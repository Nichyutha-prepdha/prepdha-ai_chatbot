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
      school_id: parseInt(schoolId),
      OR: [
        { title: { contains: `chat:u${userId}:` } },
        { title: { contains: "chat:" } },
      ],
    }

    // If chapterId is provided, filter by chapter
    if (chapterId) {
      whereClause.chapter = chapterId
    }

    console.log("Where clause:", whereClause)

    const conversations = await (prisma as any).document.findMany({
      where: whereClause,
      orderBy: { updated_at: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        created_at: true,
        updated_at: true,
      },
    })

    console.log("Found conversations in DB:", conversations)

    // Transform to match expected format
    const formatted = conversations.map((doc: any) => {
      const titlePrefixRegex = /^chat:(?:u\d+:)?/i
      const messages: any[] = []
      
      return {
        id: doc.id,
        title: doc.title.replace(titlePrefixRegex, ""),
        chapterId: null, // Document model doesn't have chapter field
        grade: null, // Document model doesn't have grade field
        subject: null, // Document model doesn't have subject field
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
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
        school_id: parseInt(schoolId),
        title: `chat:u${userId}:${title || "New Chat"}`,
      },
      select: {
        id: true,
        title: true,
        created_at: true,
        updated_at: true,
      },
    })

    // Transform response to match expected format
    const titlePrefixRegex = /^chat:(?:u\d+:)?/i
    const formatted = {
      id: conversation.id,
      title: conversation.title?.replace(titlePrefixRegex, "") || "New Chat",
      chapterId: null,
      grade: null,
      subject: null,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
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
