'use client'

import { useState, useEffect } from 'react'

interface Book {
  id: number
  title: string
  class_subject_id: number
  order_no: number
}

interface Chapter {
  id: number
  book_id: number
  title: string
  order_no: number | null
}

interface Topic {
  id: number
  title: string
  chapter_id: number
  order_no: number | null
}

interface Page {
  id: number
  page_order: number
  topic_id: number
  content_text: string | null
  content_html: string | null
  content_json: any | null
  is_published: boolean
  created_at: Date
  updated_at: Date
}

export default function DatabaseTest() {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/books')
      const data = await response.json()
      setBooks(data.books || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    }
    setLoading(false)
  }

  const fetchChapters = async (bookId: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId })
      })
      const data = await response.json()
      setChapters(data.chapters || [])
    } catch (error) {
      console.error('Error fetching chapters:', error)
    }
    setLoading(false)
  }

  const fetchTopics = async (chapterId: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId })
      })
      const data = await response.json()
      setTopics(data.topics || [])
    } catch (error) {
      console.error('Error fetching topics:', error)
    }
    setLoading(false)
  }

  const fetchPages = async (topicId: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      })
      const data = await response.json()
      console.log('Fetched pages:', data.pages)
      setPages(data.pages || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
    setLoading(false)
  }

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book)
    setSelectedChapter(null)
    setSelectedTopic(null)
    setPages([])
    setChapters([])
    setTopics([])
    fetchChapters(book.id)
  }

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setSelectedTopic(null)
    setPages([])
    setTopics([])
    fetchTopics(chapter.id)
  }

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    fetchPages(topic.id)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Browser</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Books Column */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Books ({books.length})</h2>
          <div className="border rounded-lg p-3 max-h-96 overflow-y-auto">
            {books.map(book => (
              <div
                key={book.id}
                onClick={() => handleBookSelect(book)}
                className={`p-2 cursor-pointer hover:bg-gray-100 rounded ${
                  selectedBook?.id === book.id ? 'bg-blue-100' : ''
                }`}
              >
                {book.title}
              </div>
            ))}
          </div>
        </div>

        {/* Chapters Column */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Chapters {selectedBook && `(${chapters.length})`}
          </h2>
          <div className="border rounded-lg p-3 max-h-96 overflow-y-auto">
            {chapters.map(chapter => (
              <div
                key={chapter.id}
                onClick={() => handleChapterSelect(chapter)}
                className={`p-2 cursor-pointer hover:bg-gray-100 rounded ${
                  selectedChapter?.id === chapter.id ? 'bg-blue-100' : ''
                }`}
              >
                {chapter.title}
              </div>
            ))}
          </div>
        </div>

        {/* Topics Column */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Topics {selectedChapter && `(${topics.length})`}
          </h2>
          <div className="border rounded-lg p-3 max-h-96 overflow-y-auto">
            {topics.map(topic => (
              <div
                key={topic.id}
                onClick={() => handleTopicSelect(topic)}
                className={`p-2 cursor-pointer hover:bg-gray-100 rounded ${
                  selectedTopic?.id === topic.id ? 'bg-blue-100' : ''
                }`}
              >
                {topic.title}
              </div>
            ))}
          </div>
        </div>

        {/* Pages Column */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Pages {selectedTopic && `(${pages.length})`}
          </h2>
          <div className="border rounded-lg p-3 max-h-96 overflow-y-auto">
            {pages.map(page => (
              <div key={page.id} className="p-2 border-b mb-4 last:border-b-0">
                <h3 className="font-medium mb-2">Page {page.page_order}</h3>
                <div className="text-sm text-gray-700">
                  {page.content_text ? (
                    <div className="whitespace-pre-wrap">{page.content_text}</div>
                  ) : page.content_html ? (
                    <div dangerouslySetInnerHTML={{ __html: page.content_html }} />
                  ) : page.content_json ? (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(page.content_json, null, 2)}</pre>
                  ) : (
                    <div className="text-gray-500 italic">No content available</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-center text-gray-600">Loading...</div>
      )}
    </div>
  )
}
