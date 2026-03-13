import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log("Deleting conversation:", id)

    // Delete the conversation from database
    const deleted = await (prisma as any).document.delete({
      where: { id: id },
    }).catch((error: any) => {
      // Handle case where record doesn't exist
      if (error.code === 'P2025') {
        console.log("Conversation already deleted or not found:", id)
        return null
      }
      throw error
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
