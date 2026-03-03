import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  _ctx: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    // Extract conversation ID from URL
    const pathname = req.nextUrl?.pathname || ""
    const match = pathname.match(/\/api\/conversations\/([^/]+)(?:\/messages)?$/i)
    const conversationId = match?.[1]

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      )
    }

    console.log("Deleting conversation:", conversationId)

    // Delete the conversation from database
    const deleted = await (prisma as any).document.delete({
      where: { id: conversationId },
    })

    console.log("Deleted conversation:", deleted)

    return NextResponse.json({ success: true, deleted })
  } catch (error) {
    console.error("Failed to delete conversation:", error)
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    )
  }
}
