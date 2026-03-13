import { NextRequest, NextResponse } from "next/server"
import { 
  getAllChaptersAsText, 
  getChapterAsText, 
  getChapterContextForChatbot,
  getChapterList,
  searchChapters 
} from "@/lib/chapter-content-extractor"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const chapterId = searchParams.get("chapterId")
    const format = searchParams.get("format") // "text" | "context" | "list"
    const query = searchParams.get("query")

    console.log("GET chapters:", { chapterId, format, query })

    // Handle search
    if (query) {
      const searchResults = searchChapters(query)
      return NextResponse.json({
        success: true,
        query,
        results: searchResults
      })
    }

    // Handle specific chapter request
    if (chapterId) {
      if (format === "context") {
        const context = getChapterContextForChatbot(chapterId)
        if (!context) {
          return NextResponse.json(
            { error: "Chapter not found" },
            { status: 404 }
          )
        }
        return NextResponse.json({
          success: true,
          chapterId,
          format: "context",
          content: context
        })
      } else {
        const chapterText = getChapterAsText(chapterId)
        if (!chapterText) {
          return NextResponse.json(
            { error: "Chapter not found" },
            { status: 404 }
          )
        }
        return NextResponse.json({
          success: true,
          chapterId,
          format: "text",
          content: chapterText
        })
      }
    }

    // Handle chapter list request
    if (format === "list") {
      const chapterList = getChapterList()
      return NextResponse.json({
        success: true,
        format: "list",
        chapters: chapterList
      })
    }

    // Default: return all chapters as text
    const allChaptersText = getAllChaptersAsText()
    
    return NextResponse.json({
      success: true,
      format: "all-text",
      content: allChaptersText
    })

  } catch (error) {
    console.error("Failed to get chapter content:", error)
    return NextResponse.json(
      { error: "Failed to get chapter content" },
      { status: 500 }
    )
  }
}
