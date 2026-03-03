import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const schoolId = searchParams.get("schoolId")
    const chapterId = searchParams.get("chapterId")

    console.log("GET conversations:", { userId, schoolId, chapterId })

    if (!userId || !schoolId) {
      return NextResponse.json(
        { error: "userId and schoolId are required" },
        { status: 400 }
      )
    }

    // Build where clause
    const whereClause: any = {
      schoolId: parseInt(schoolId),
      OR: [
        { title: { contains: `chat:u${userId}:`, mode: "insensitive" } },
        { title: { contains: "chat:", mode: "insensitive" } },
      ],
    }

    // If chapterId is provided, filter by chapter
    if (chapterId) {
      whereClause.chapter = chapterId
    }

    console.log("Where clause:", whereClause)

    const conversations = await (prisma as any).document.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        grade: true,
        subject: true,
        chapter: true,
        createdAt: true,
        updatedAt: true,
        content: true,
      },
    })

    console.log("Found conversations in DB:", conversations)

    // Transform to match expected format
    const formatted = conversations.map((doc: any) => {
      const titlePrefixRegex = /^chat:(?:u\d+:)?/i
      let messages = []
      try {
        // Handle JSON content from PostgreSQL
        if (doc.content && typeof doc.content === 'object') {
          messages = doc.content.messages || []
        } else if (doc.content && typeof doc.content === 'string') {
          const parsed = JSON.parse(doc.content)
          messages = parsed.messages || []
        }
      } catch (e) {
        console.error('Error parsing content:', e)
        messages = []
      }
      
      return {
        id: doc.id,
        title: doc.title.replace(titlePrefixRegex, ""),
        chapterId: doc.chapter,
        grade: doc.grade,
        subject: doc.subject,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        messages: messages
      }
    })

    console.log("Formatted conversations:", formatted)

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Failed to load conversations:", error)
    return NextResponse.json(
      { error: "Failed to load conversations" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, schoolId, title, grade, subject, chapter } = body

    console.log("POST conversations:", { userId, schoolId, title, grade, subject, chapter })

    if (!userId || !schoolId) {
      return NextResponse.json(
        { error: "userId and schoolId are required" },
        { status: 400 }
      )
    }

    // Check if school exists, if not create it
    let school = await (prisma as any).school.findUnique({
      where: { id: parseInt(schoolId) },
    })

    if (!school) {
      // Create school if it doesn't exist
      await (prisma as any).school.upsert({
        where: { id: parseInt(schoolId) },
        update: {},
        create: {
          id: parseInt(schoolId),
          name: `School ${schoolId}`,
        },
      })
    }

    const conversation = await (prisma as any).document.create({
      data: {
        schoolId: parseInt(schoolId),
        title: `chat:u${userId}:${title || "New Chat"}`,
        grade: grade ? String(grade) : null,
        subject: subject || null,
        chapter: chapter || null,
        content: { messages: [] },
      },
      select: {
        id: true,
        title: true,
        grade: true,
        subject: true,
        chapter: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Transform response to match expected format
    const titlePrefixRegex = /^chat:(?:u\d+:)?/i
    const formatted = {
      id: conversation.id,
      title: conversation.title?.replace(titlePrefixRegex, "") || "New Chat",
      chapterId: conversation.chapter,
      grade: conversation.grade,
      subject: conversation.subject,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: []
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Failed to create conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}
