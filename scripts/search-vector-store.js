import { config } from 'dotenv'
config({ path: '.env.local' })

console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No')

import OpenAI from "openai"
import fs from "fs"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function searchVectorStore(query) {
  const vectorStoreId = fs.readFileSync('vector_store_id.txt', 'utf8').trim()

  const results = await openai.vectorStores.search(vectorStoreId, {
    query: query || '*',  // Use '*' to get all if no query provided
    max_num_results: 20
  })

  // Filter results if query is a specific topic or page
  let filteredResults = results.data
  if (query.startsWith('topic_')) {
    filteredResults = results.data.filter(chunk => {
      const text = chunk.content[0]?.text || ''
      return text.includes(`[TOPIC_ID: ${query}]`)
    })
  } else if (query.startsWith('page_')) {
    filteredResults = results.data.filter(chunk => {
      const text = chunk.content[0]?.text || ''
      return text.includes(`[PAGE_ID: ${query}]`)
    })
  }

  console.log(`\nFound ${filteredResults.length} chunks:\n`)

  for (const chunk of filteredResults) {
    console.log('--- CHUNK ---')
    
    // Handle different response formats
    let content = ''
    if (typeof chunk.content === 'string') {
      content = chunk.content
    } else if (chunk.content && chunk.content.text) {
      content = chunk.content.text
    } else if (chunk.content && chunk.content.content) {
      content = chunk.content.content
    } else {
      content = JSON.stringify(chunk.content)
    }
    
    console.log(`Content: ${content}`)
    console.log(`File ID: ${chunk.file_id}`)
    console.log(`Score: ${chunk.score}`)
    console.log('')
  }
}

const query = process.argv[2] || ''
searchVectorStore(query)
