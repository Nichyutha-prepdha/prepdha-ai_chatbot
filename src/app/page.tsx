'use client'

import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [fileId, setFileId] = useState('')
  const [results, setResults] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setResults('') // Clear previous results
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, file_id: fileId || undefined })
    })
    if (res.ok) {
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setResults(accumulated)
        }
      }
    } else {
      const errorData = await res.json()
      setResults(errorData.error || 'Error')
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">RAG System Demo</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          className="border p-2 w-full"
        />
        <input
          type="text"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          placeholder="Optional: Enter file ID to search within specific file"
          className="border p-2 w-full mt-2"
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white p-2">Search</button>
      </form>
      <div>
        <h2 className="text-xl mb-2">Results:</h2>
        <p>{results}</p>
      </div>
    </div>
  )
}
