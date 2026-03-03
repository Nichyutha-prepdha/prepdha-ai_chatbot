import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getDocumentId(req: NextRequest) {
  const pathname = req.nextUrl?.pathname || ""
  const match = pathname.match(/\/api\/conversations\/([^/]+)\/messages/i)
  if (match?.[1]) return match[1]
  return null
}

function deriveThreadTitle(text: string) {
  const cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
  if (!cleaned) return "New Chat"
  return cleaned.length > 40 ? `${cleaned.slice(0, 40)}...` : cleaned
}

function deriveThreadTitleFromTwo(userText: string, assistantText: string) {
  const u = String(userText || "").replace(/\s+/g, " ").trim()
  const a = String(assistantText || "").replace(/\s+/g, " ").trim()
  const uShort = u.length > 28 ? `${u.slice(0, 28)}...` : u
  const aShort = a.length > 28 ? `${a.slice(0, 28)}...` : a
  const combined = `${uShort} — ${aShort}`.trim()
  return combined.length > 70 ? `${combined.slice(0, 70)}...` : combined
}

export async function GET(
  req: NextRequest,
  _ctx: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    const documentId = getDocumentId(req)
    if (!documentId) {
      return NextResponse.json(
        { error: "Conversation id is required." },
        { status: 400 }
      )
    }

    console.log("Loading messages for conversation:", documentId)

    const document = (await (prisma as any).document.findUnique({
      where: { id: documentId },
      select: { content: true, title: true },
    })) as { content: any; title: string | null } | null

    if (!document) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      )
    }

    let messages = []
    try {
      // Handle JSON content from PostgreSQL
      if (document.content && typeof document.content === 'object') {
        messages = document.content.messages || []
      } else if (document.content && typeof document.content === 'string') {
        const parsed = JSON.parse(document.content)
        messages = parsed.messages || []
      }
    } catch (e) {
      console.error('Error parsing content:', e)
      messages = []
    }
    
    console.log("Messages found in database:", messages)
    console.log("Number of messages:", messages.length)
    
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Failed to load messages:", error)
    return NextResponse.json(
      { error: "Failed to load messages." },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  _ctx: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    const documentId = getDocumentId(req)
    if (!documentId) {
      return NextResponse.json(
        { error: "Conversation id is required." },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({} as any))
    const { role, content, chapterId } = body

    console.log("Saving message:", { documentId, role, content, chapterId })

    if (!role || !content) {
      return NextResponse.json(
        { error: "Role and content are required." },
        { status: 400 }
      )
    }

    // Get current document
    const document = await (prisma as any).document.findUnique({
      where: { id: documentId },
      select: { content: true, title: true, chapter: true },
    })

    if (!document) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      )
    }

    // Parse existing content
    let existingContent: any = { messages: [] }
    try {
      if (document.content && typeof document.content === 'object') {
        existingContent = document.content
      } else if (document.content && typeof document.content === 'string') {
        existingContent = JSON.parse(document.content)
      }
    } catch (e) {
      console.error('Error parsing existing content:', e)
      existingContent = { messages: [] }
    }

    // Add new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    }

    existingContent.messages = [...(existingContent.messages || []), newMessage]

    // Update conversation title based on first two questions
    let updatedTitle = document.title
    if (existingContent.messages.length >= 1 && role === 'assistant') {
      const userMessages = existingContent.messages.filter((m: any) => m.role === 'user')
      const assistantMessages = existingContent.messages.filter((m: any) => m.role === 'assistant')
      
      if (userMessages.length >= 1 && assistantMessages.length >= 1) {
        const firstUser = userMessages[0].content
        const firstAssistant = assistantMessages[0].content
        
        // Generate title from first question and answer
        const userShort = firstUser.length > 30 ? firstUser.substring(0, 30) + '...' : firstUser
        const assistantShort = firstAssistant.length > 30 ? firstAssistant.substring(0, 30) + '...' : firstAssistant
        const combinedTitle = `${userShort} — ${assistantShort}`
        
        // Remove existing chat prefix if present
        const titlePrefixRegex = /^chat:(?:u\d+:)?/i
        const baseTitle = document.title?.replace(titlePrefixRegex, "") || ""
        
        updatedTitle = `chat:u1:${combinedTitle}`
        console.log("Updated conversation title:", updatedTitle)
      }
    }

    // Update document
    const updateData: any = {
      content: existingContent,
      updatedAt: new Date(),
    }

    // Update title if it was changed
    if (updatedTitle !== document.title) {
      updateData.title = updatedTitle
    }

    // Update chapter if provided
    if (chapterId !== undefined) {
      updateData.chapter = chapterId
    }

    await (prisma as any).document.update({
      where: { id: documentId },
      data: updateData,
    })

    console.log("Message saved successfully to database")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save message:", error)
    return NextResponse.json(
      { error: "Failed to save message." },
      { status: 500 }
    )
  }
}
