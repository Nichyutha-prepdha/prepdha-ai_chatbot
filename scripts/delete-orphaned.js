import { config } from 'dotenv'
config({ path: '.env.local' })

console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No')

import OpenAI from "openai"
import fs from "fs"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const vectorStoreId = fs.readFileSync('vector_store_id.txt', 'utf8').trim()

async function deleteOrphaned() {
  const fileId = 'file-RdiQrDvdv2qYEFy1g7eChF'
  try {
    await openai.vectorStores.files.delete(fileId, { vector_store_id: vectorStoreId })
    console.log(`Deleted orphaned file ${fileId} from vector store`)
  } catch (err) {
    console.log(`Error deleting ${fileId}: ${err.message}`)
  }
}

deleteOrphaned()
