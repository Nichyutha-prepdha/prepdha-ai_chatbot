import { NextResponse, NextRequest } from "next/server"
import { getAllBooks, getChaptersByBook, getTopicsByChapter, getPagesByTopic } from "@/lib/db"

export async function GET() {
  try {
    const books = await getAllBooks()
    return NextResponse.json({ books })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookId, chapterId, topicId } = body

    if (topicId) {
      // Get pages for a specific topic
      const pages = await getPagesByTopic(topicId)
      return NextResponse.json({ pages })
    } else if (chapterId) {
      // Get topics for a specific chapter
      const topics = await getTopicsByChapter(chapterId)
      return NextResponse.json({ topics })
    } else if (bookId) {
      // Get chapters for a specific book
      const chapters = await getChaptersByBook(bookId)
      return NextResponse.json({ chapters })
    } else {
      return NextResponse.json(
        { error: 'Either bookId, chapterId, or topicId is required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
