import { NextRequest, NextResponse } from "next/server"
import { getAllBooks, getTopicsByBook, getPagesByTopic, getDocumentChunksByPage } from "@/lib/db"
import { searchWithQueryText } from "@/lib/embeddings"
import OpenAI from "openai"

// Import hardcoded chapter content for fallback
function getHardcodedChapterContent(chapterId: string): string | null {
  const chapters: { [key: string]: string } = {
    "chapter-1": `Military Campaigns and Expansion
Subtitle: Harsha vs Sasanka

When Harsha ascended to the throne at just sixteen years old in 606 CE, he stepped into a kingdom shaken by grief and political instability. His elder brother Rajyavardhana had been killed under suspicious circumstances, and powerful neighbours were already testing the limits of the new ruler. Despite his youth, Harsha quickly realised that hesitation could cost him both his family's honour and his empire's future.

To stabilise his rule, Harsha began carefully choosing allies among nearby kingdoms while keeping a close watch on Sasanka of Gauda, the ruler widely believed to be behind his brother's death. Courtiers and generals debated whether Harsha should focus on internal reforms or immediate retaliation. Harsha listened to each side before deciding that securing loyal support at home was the first step toward any successful campaign.

Once his core territories were secure, Harsha turned his attention outward. He reorganised his army, improved communication between distant provinces, and ensured that supplies could move quickly across his lands. These preparations did not yet look like conquest to outsiders, but they quietly laid the foundation for the military campaigns that would soon follow.

News of Sasanka's actions in Gauda spread quickly through Harsha's court. Advisors warned that delaying a response would make Harsha appear weak. After weeks of planning, Harsha ordered his first expedition toward the eastern frontier. Villagers watched long lines of soldiers, horses, and war elephants moving along dusty roads, carrying the hopes of an empire seeking justice.

The journey toward Gauda was not easy. Heavy rains turned paths into rivers of mud, and some local chiefs hesitated to support Harsha openly, fearing Sasanka's retaliation. Harsha used both diplomacy and firmness to secure safe passage, promising protection to those who sided with him and warning of consequences for those who secretly aided his enemy.

Although this first expedition did not immediately remove Sasanka from power, it sent a powerful message. Harsha showed that he would not quietly accept injustice or betrayal. The expedition tested his army, revealed which allies he could trust, and marked the beginning of a longer struggle that would reshape the balance of power in northern India.`,

    "chapter-2": `First Expedition Against Sasanka
Subtitle: Harsha's first response

News of Sasanka's actions in Gauda spread quickly through Harsha's court. Advisors warned that delaying a response would make Harsha appear weak. After weeks of planning, Harsha ordered his first expedition toward the eastern frontier. Villagers watched long lines of soldiers, horses, and war elephants moving along dusty roads, carrying the hopes of an empire seeking justice.

The journey toward Gauda was not easy. Heavy rains turned paths into rivers of mud, and some local chiefs hesitated to support Harsha openly, fearing Sasanka's retaliation. Harsha used both diplomacy and firmness to secure safe passage, promising protection to those who sided with him and warning of consequences for those who secretly aided his enemy.

Although this first expedition did not immediately remove Sasanka from power, it sent a powerful message. Harsha showed that he would not quietly accept injustice or betrayal. The expedition tested his army, revealed which allies he could trust, and marked the beginning of a longer struggle that would reshape the balance of power in northern India.`,

    "chapter-3": `Conquest after Sasanka's death
Subtitle: Power shift in Gauda

After Sasanka's death, Gauda was left without a strong leader. Competing nobles tried to claim the throne, and rumours of rebellion spread across the region. Harsha saw both danger and opportunity in this moment. If he acted too slowly, another rival might seize Gauda. If he moved wisely, he could bring stability to the region under his own rule.

Harsha advanced with a combination of military strength and careful negotiation. Some cities opened their gates willingly, hoping that Harsha would restore order and protect trade routes. Others resisted and had to be persuaded through short but decisive battles. By rewarding cooperation and limiting unnecessary punishment, Harsha encouraged local leaders to accept his authority.

Once Gauda was firmly under his control, Harsha focused on rebuilding rather than simple revenge. He repaired roads, encouraged scholars to visit his court, and supported temples and monasteries. In doing so, he turned a once-hostile region into an important part of his expanding empire.`,

    "chapter-4": `Conquest of Magadha
Subtitle: Expanding the empire

Magadha was a rich and ancient region, famous for its fertile land and important trade routes. Any ruler who controlled Magadha gained access to wealth, soldiers, and influence. Harsha understood that bringing Magadha into his realm would turn his kingdom into a truly powerful empire.

Before choosing war, Harsha tried to reach peaceful agreements with Magadha's rulers. When some local powers refused to cooperate, he launched targeted campaigns rather than one long and costly war. These careful strategies allowed him to win key forts and cities without exhausting his army.

After Magadha accepted his rule, Harsha worked to connect it with his other territories. He improved roads so that messengers, traders, and scholars could travel more easily. Over time, people from different regions of his empire began to feel more connected to one another, sharing ideas, goods, and cultural traditions.`,

    "chapter-5": `Architecture and Monuments Under Harsha
Subtitle: Building an empire's legacy

Temples of Faith and Power
Harsha's reign saw significant architectural development across his empire. He understood that impressive buildings could demonstrate both his devotion to the gods and his authority as a ruler. Temples constructed during his time featured intricate stone carvings, tall spires, and spacious halls for worshippers.

Patronage of Buddhist Institutions
As a devoted Buddhist, Harsha provided generous support for monasteries and stupas. He funded the construction of new meditation halls, libraries for sacred texts, and living quarters for monks. These institutions became centers of learning and spiritual practice that attracted scholars from across Asia.

Educational Centers
Harsha established universities and learning centers that combined religious instruction with secular subjects. Students studied mathematics, astronomy, medicine, and literature alongside Buddhist philosophy. These institutions helped preserve knowledge and promote intellectual exchange between different regions.

Urban Development
Cities under Harsha's rule saw major improvements in infrastructure. Wide roads, public water systems, and marketplaces were built to accommodate growing populations. The architectural style blended traditional Indian elements with influences from neighboring regions, creating a distinctive Harsha-era aesthetic.

Legacy in Stone
The buildings and monuments from Harsha's time continue to stand as testaments to his vision. They represent not just architectural achievement but the cultural and religious values that shaped his empire. These structures served as gathering places for communities and symbols of the empire's prosperity and stability.`
  };

  return chapters[chapterId] || null;
}

type ChatRole = "system" | "user" | "assistant"

interface ChatMessage {
  role: ChatRole
  content: string
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Helper function to convert messages to prompt format
function createPromptFromMessages(messages: ChatMessage[]): string {
  return messages
    .map(msg => {
      if (msg.role === 'system') {
        return `System: ${msg.content}`
      } else if (msg.role === 'user') {
        return `User: ${msg.content}`
      } else if (msg.role === 'assistant') {
        return `Assistant: ${msg.content}`
      }
      return msg.content
    })
    .join('\n\n') + '\n\nAssistant:'
}

// Helper functions for responsive enhancement
function enhanceQuestionResponse(content: string): string {
  // Add structured formatting for questions
  if (!content.includes("1.") && !content.includes("•")) {
    return `Here's your answer:\n\n${content}`
  }
  return content
}

function enhanceExplanationResponse(content: string): string {
  // Add explanatory formatting
  if (!content.includes("Step") && !content.includes("First")) {
    return `Let me explain this clearly:\n\n${content}\n\nDoes this help you understand?`
  }
  return content
}

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
    const chapterId = typeof body?.chapterId === "string" ? body.chapterId : null
    const bookId = typeof body?.bookId === "number" ? body.bookId : null
    const topicId = typeof body?.topicId === "number" ? body.topicId : null
    const pageId = typeof body?.pageId === "number" ? body.pageId : null

    // Fetch content from Neon database if IDs are provided
    let databaseContext = ""
    let embeddingContext = ""
    
    // First, check if this is a summary request before doing vector store search
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || ""
    const isSummarizeRequest = /summarize|summary|give.*summary/i.test(lastUserMessage)
    
    // Only do semantic search if it's NOT a summary request
    if (!isSummarizeRequest && lastUserMessage && lastUserMessage.length > 10) {
      try {
        const relevantDocs = await searchWithQueryText(lastUserMessage, 3, 0.3, {
          chapterId,
        })
        
        if (relevantDocs.length > 0) {
          embeddingContext = relevantDocs.map((doc: any, index: number) => 
            `Relevant Content ${index + 1} (Similarity: ${((doc.similarity || 0) * 100).toFixed(1)}%):\n` +
            `Chapter ID: ${doc.chapter_id || 'Unknown'}\n` +
            `Book: ${doc.book_title || 'Unknown'}\n` +
            `Topic: ${doc.topic_title || 'Unknown'}\n` +
            `Content: ${doc.content}`
          ).join("\n\n---\n\n")
        } else {
          // Fallback: Use hardcoded chapter content if vector store has no results
          if (chapterId) {
            const hardcodedContent = getHardcodedChapterContent(chapterId);
            if (hardcodedContent) {
              embeddingContext = `Relevant Content (Fallback):\nChapter ID: ${chapterId}\nContent: ${hardcodedContent}`;
              console.log(`📚 Using fallback content for ${chapterId} (vector store empty)`);
            }
          }
        }
      } catch (error) {
        console.error("Error in semantic search:", error)
      }
    }
    
    // Then, fetch specific content if IDs are provided (fallback)
    if (bookId || topicId || pageId) {
      try {
        const { getDocumentChunksByPage, getPagesByTopic, getTopicsByBook, getAllBooks } = await import("@/lib/db")
        
        if (pageId) {
          const chunks = await getDocumentChunksByPage(pageId)
          databaseContext = (chunks as any[]).map((chunk: any) => chunk.content).join("\n\n")
        } else if (topicId) {
          const pages = await getPagesByTopic(topicId)
          const allChunks = []
          for (const page of (pages as any[])) {
            const chunks = await getDocumentChunksByPage(page.id)
            allChunks.push(...(chunks as any[]))
          }
          databaseContext = allChunks.map((chunk: any) => chunk.content).join("\n\n")
        } else if (bookId) {
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
      ...(embeddingContext
        ? [
            {
              role: "system" as const,
              content: `Relevant content found via semantic search:\n\n${embeddingContext}\n\nPlease use this relevant content to answer the user's question accurately.`,
            },
          ]
        : []),
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


    // Use real OpenAI Responses API
    
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
    
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: payloadMessages,
      temperature: 0.7,
      max_output_tokens: 2000,
    })

    if (!response) {
      return NextResponse.json(
        { 
          error: "Responses API error",
          details: "No response received",
        },
        { status: 500 }
      )
    }

    // Handle real Responses API output format
    let content
    
    if (response.output && response.output.length > 0) {
      const outputItem = response.output[0]
      // Check if it's a message type
      if (outputItem.type === 'message' && 'content' in outputItem) {
        const messageItem = outputItem as any
        if (messageItem.content && messageItem.content.length > 0) {
          const contentItem = messageItem.content.find((item: any) => item.type === "output_text")
          content = contentItem?.text || "No text content found"
        } else {
          content = "No content in message"
        }
      } else {
        content = "Output is not a message type"
      }
    } else {
      content = "Invalid response format from Responses API"
    }

    // Apply responsive enhancements
    if (content && typeof content === 'string') {
      const lastMessage = trimmedMessages[trimmedMessages.length - 1]?.content || ""
      
      if (lastMessage.includes("?")) {
        content = enhanceQuestionResponse(content)
      } else if (lastMessage.toLowerCase().includes("explain")) {
        content = enhanceExplanationResponse(content)
      }
    }

    // Check if the request was for questions, key points, or summarize
    const lastMessage = trimmedMessages[trimmedMessages.length - 1]?.content || ""
    const isQuestionRequest = /question|quiz|practice|check.*understanding|ask.*question|generate.*question/i.test(lastMessage)
    const isKeyPointsRequest = /key.?point|main.?point|important.?point|bullet.?point|summary.?point/i.test(lastMessage)
    

    // Format based on request type
    if (isQuestionRequest) {
    } else if (isKeyPointsRequest) {
      content = formatKeyPoints(content)
    } else if (isSummarizeRequest && chapterId) {
      // Use chapter-specific summary caching
      try {
        const summaryResponse = await fetch(`http://localhost:3000/api/pages/${chapterId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          content = summaryData.summary;
          console.log(`📋 Using cached summary for chapter ${chapterId}: ${summaryData.cached ? 'CACHED' : 'NEW'}`);
        } else {
          // Fallback to regular processing if summary API fails
          content = removeNumbering(content);
        }
      } catch (error) {
        console.error("Summary API error:", error);
        // Fallback to regular processing
        content = removeNumbering(content);
      }
    } else {
      content = removeNumbering(content);
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
  
  // Check if content is already numbered
  const hasNumbering = /^\d+\./.test(content.trim())
  
  if (hasNumbering) {
    // Already numbered, just clean up and return
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const numberedLines = lines.filter(line => /^\d+\./.test(line))
    return numberedLines.join('\n')
  }
  
  // Simple approach: split by question marks and number everything
  const parts = content.split('?')
  
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
  
  
  // Filter out any non-question parts and our follow-up text
  questions = questions.filter(q => 
    q.includes('?') && 
    !q.toLowerCase().includes('should i generate') &&
    !q.toLowerCase().includes('provide additional') &&
    !q.toLowerCase().includes('practice questions')
  )
  
  
  // If no questions found, try a different approach
  if (questions.length === 0) {
    // Split by lines and number everything that looks like a question
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    questions = lines.filter(line => line.includes('?') || line.toLowerCase().includes('question'))
  }
  
  // Last resort - just number all meaningful content
  if (questions.length === 0) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 5)
    questions = lines.filter(line => !line.toLowerCase().includes('should i generate'))
  }
  
  // Number the questions
  const result = questions
    .map((question, index) => `${index + 1}. ${question}`)
    .join('\n')
  
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
