import { config } from 'dotenv'
config({ path: '.env.local' })

console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No')

import OpenAI from "openai"
import fs from "fs"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function listFiles() {
  const vectorStoreId = fs.readFileSync('vector_store_id.txt', 'utf8').trim()

  const files = await openai.vectorStores.files.list(vectorStoreId)
  console.log('Files in vector store:')
  for (const f of files.data) {
    try {
      const fileInfo = await openai.files.retrieve(f.id)
      console.log(`- Filename: ${fileInfo.filename}, ID: ${f.id}, Status: ${f.status}`)
      console.log('---')
    } catch (err) {
      console.log(`- Error retrieving file ${f.id}: ${err.message}, Status: ${f.status}`)
      console.log('---')
    }
  }
}

listFiles()
