import { NextResponse, NextRequest } from "next/server"
import { getAllBooks, getTopicsByBook, getPagesByTopic } from "@/lib/db"

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
    const { bookId, topicId } = body

    if (topicId) {
      // Get pages for a specific topic
      const pages = await getPagesByTopic(topicId)
      return NextResponse.json({ pages })
    } else if (bookId) {
      // Get topics for a specific book
      const topics = await getTopicsByBook(bookId)
      return NextResponse.json({ topics })
    } else {
      return NextResponse.json(
        { error: 'Either bookId or topicId is required' },
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
