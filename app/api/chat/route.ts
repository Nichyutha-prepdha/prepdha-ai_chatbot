import { NextRequest, NextResponse } from "next/server"
import { getAllBooks, getTopicsByBook, getPagesByTopic, getDocumentChunksByPage } from "@/lib/db"

type ChatRole = "system" | "user" | "assistant"

interface ChatMessage {
  role: ChatRole
  content: string
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY. Add it to your .env.local file." },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()
    const messages = Array.isArray(body?.messages) ? (body.messages as ChatMessage[]) : []
    const context = typeof body?.context === "string" ? body.context : null
    const bookId = typeof body?.bookId === "number" ? body.bookId : null
    const topicId = typeof body?.topicId === "number" ? body.topicId : null
    const pageId = typeof body?.pageId === "number" ? body.pageId : null

    // Fetch content from Neon database if IDs are provided
    let databaseContext = ""
    if (bookId || topicId || pageId) {
      try {
        if (pageId) {
          // Get specific page content
          const chunks = await getDocumentChunksByPage(pageId)
          databaseContext = (chunks as any[]).map((chunk: any) => chunk.content).join("\n\n")
        } else if (topicId) {
          // Get all pages in topic
          const pages = await getPagesByTopic(topicId)
          const allChunks = []
          for (const page of (pages as any[])) {
            const chunks = await getDocumentChunksByPage(page.id)
            allChunks.push(...(chunks as any[]))
          }
          databaseContext = allChunks.map((chunk: any) => chunk.content).join("\n\n")
        } else if (bookId) {
          // Get all topics and pages in book
          const topics = await getTopicsByBook(bookId)
          const allChunks = []
          for (const topic of (topics as any[])) {
            const pages = await getPagesByTopic(topic.id)
            for (const page of (pages as any[])) {
              const chunks = await getDocumentChunksByPage(page.id)
              allChunks.push(...(chunks as any[]))
            }
          }
          databaseContext = allChunks.map((chunk: any) => chunk.content).join("\n\n")
        }
      } catch (error) {
        console.error("Error fetching database content:", error)
      }
    }

    const MAX_CHAT_MESSAGES =
      Number(process.env.MAX_CHAT_MESSAGES ?? "10") || 10

    const trimmedMessages =
      messages.length > MAX_CHAT_MESSAGES
        ? messages.slice(-MAX_CHAT_MESSAGES)
        : messages

    const payloadMessages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are a helpful study assistant for middle-school students. Use provided chapter context when available. Keep answers clear, structured, and easy to understand. For 'explain' or 'explain like I am five' requests, give slow, step-by-step explanations with simple analogies and short paragraphs, not just bullet lists. Use bullets only when the user explicitly asks to list or summarize.\n\nFormatting rules:\n1) For SUMMARIZE requests: write flowing prose paragraphs WITHOUT any numbering or bullet points.\n2) For QUESTIONS / quiz / practice / check-understanding requests: output numbered questions (1., 2., 3., …), each on its own line.\n3) For KEY / MAIN / IMPORTANT points requests: output each point on its own line as a bullet or number.\n4) When the user provides selected text or specific context and asks for questions or key points, base everything ONLY on that text, not outside knowledge.",
      },
      ...(databaseContext
        ? [
            {
              role: "system" as const,
              content: `Content from the database:\n\n${databaseContext}`,
            },
          ]
        : []),
      ...(context
        ? [
            {
              role: "system" as const,
              content: `Additional context from the textbook or notes:\n\n${context}`,
            },
          ]
        : []),
      ...trimmedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ]

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: payloadMessages,
        temperature: 1.2,
        top_p: 0.95,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error:", errorText)
      return NextResponse.json(
        {
          error: "OpenAI API error",
          details: errorText,
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    let content =
      data?.output?.[0]?.content ??
      "I'm sorry, I couldn't generate a response. Please try asking again."

    // Check if the request was for questions, key points, or summarize
    const lastMessage = trimmedMessages[trimmedMessages.length - 1]?.content || ""
    console.log("Last message:", lastMessage)
    const isQuestionRequest = /question|quiz|practice|check.*understanding|ask.*question|generate.*question/i.test(lastMessage)
    const isKeyPointsRequest = /key.?point|main.?point|important.?point|bullet.?point|summary.?point/i.test(lastMessage)
    const isSummarizeRequest = /summarize|summary|give.*summary/i.test(lastMessage)
    
    console.log("Request type detection:")
    console.log("isQuestionRequest:", isQuestionRequest)
    console.log("isKeyPointsRequest:", isKeyPointsRequest)
    console.log("isSummarizeRequest:", isSummarizeRequest)

    // Format based on request type
    if (isQuestionRequest) {
      console.log("Question request detected, formatting questions...")
      console.log("Original content:", content)
      content = formatQuestions(content)
      console.log("Formatted content:", content)
    } else if (isKeyPointsRequest) {
      content = formatKeyPoints(content)
    } else if (isSummarizeRequest) {
      content = removeNumbering(content)
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Chat route error:", error)
    return NextResponse.json(
      { error: "Unexpected error while generating AI response." },
      { status: 500 }
    )
  }
}

function removeNumbering(content: string): string {
  // Remove numbering like "1. " at the start of lines, keeping just the text
  content = content.replace(/^\d+\.\s+/gm, "")
  return content.trim()
}

function formatQuestions(content: string): string {
  console.log("formatQuestions called with:", content)
  
  // Check if content is already numbered
  const hasNumbering = /^\d+\./.test(content.trim())
  console.log("Already numbered?", hasNumbering)
  
  if (hasNumbering) {
    // Already numbered, just clean up and return
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const numberedLines = lines.filter(line => /^\d+\./.test(line))
    console.log("Already numbered lines:", numberedLines)
    return numberedLines.join('\n')
  }
  
  // Simple approach: split by question marks and number everything
  const parts = content.split('?')
  console.log("Split parts:", parts)
  
  let questions: string[] = []
  
  // Rebuild questions with question marks
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()
    if (part) {
      // Add question mark back if it's not the last part or if the last part ends with punctuation
      const question = i < parts.length - 1 ? part + '?' : part
      questions.push(question)
    }
  }
  
  console.log("Rebuilt questions:", questions)
  
  // Filter out any non-question parts and our follow-up text
  questions = questions.filter(q => 
    q.includes('?') && 
    !q.toLowerCase().includes('should i generate') &&
    !q.toLowerCase().includes('provide additional') &&
    !q.toLowerCase().includes('practice questions')
  )
  
  console.log("Filtered questions:", questions)
  
  // If no questions found, try a different approach
  if (questions.length === 0) {
    // Split by lines and number everything that looks like a question
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    questions = lines.filter(line => line.includes('?') || line.toLowerCase().includes('question'))
    console.log("Line-based questions:", questions)
  }
  
  // Last resort - just number all meaningful content
  if (questions.length === 0) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 5)
    questions = lines.filter(line => !line.toLowerCase().includes('should i generate'))
    console.log("Fallback questions:", questions)
  }
  
  // Number the questions
  const result = questions
    .map((question, index) => `${index + 1}. ${question}`)
    .join('\n')
  
  console.log("Final result:", result)
  return result
}

function formatKeyPoints(content: string): string {
  // Handle various bullet point formats and ensure each point is on separate line
  let formatted = content
  
  // Replace bullet points with consistent format and ensure line breaks
  formatted = formatted.replace(/^[•·* -]\s*/gm, "• ")
  formatted = formatted.replace(/^\d+\.\s*/gm, "• ")
  formatted = formatted.replace(/^\d+\)\s*/gm, "• ")
  
  // Split by bullet points and rejoin with proper line breaks
  const parts = formatted.split(/(?=•\s)/g)
  
  // Clean and format each part
  const cleaned = parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n")
  
  return cleaned.trim()
}

