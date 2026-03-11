import { config } from 'dotenv'
config({ path: '.env.local' })

console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No')

import OpenAI from "openai"
import fs from "fs"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function deleteAllFiles() {
  const vectorStoreId = fs.readFileSync('vector_store_id.txt', 'utf8').trim()
  console.log('Vector Store ID:', vectorStoreId)

  const files = await openai.vectorStores.files.list(vectorStoreId)
  console.log(`Found ${files.data.length} files to delete`)
  for (const f of files.data) {
    console.log('File ID:', f.id)
    if (!f.id) {
      console.log('Skipping file with no ID')
      continue
    }
    console.log(`Deleting file ID: ${f.id}`)
    await openai.vectorStores.files.delete(f.id, { vector_store_id: vectorStoreId })
    // Also delete from OpenAI files
    await openai.files.delete(f.id)
    console.log(`Deleted file ID: ${f.id}`)
  }
  console.log('All files deleted from vector store')
}

deleteAllFiles()
