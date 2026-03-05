'use client'

import { useState, useEffect } from 'react'

interface Book {
  id: number
  title: string
  class_subject_id: number
  order_no: number
}

interface Topic {
  id: number
  title: string
  book_id: number
  order_no: number
}

interface Page {
  id: number
  page_order: number
  topic_id: number
  content_text: string
}

export default function DatabaseTest() {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
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

  const fetchTopics = async (bookId: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId })
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
      setPages(data.pages || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
    setLoading(false)
  }

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book)
    setSelectedTopic(null)
    setPages([])
    fetchTopics(book.id)
  }

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    fetchPages(topic.id)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Browser</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Topics Column */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Topics {selectedBook && `(${topics.length})`}
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
              <div key={page.id} className="p-2 border-b">
                Page {page.page_order}
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
