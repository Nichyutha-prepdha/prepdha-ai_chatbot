import { config } from 'dotenv'
config({ path: '.env.local' })

console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No')

import OpenAI from "openai"
import fs from "fs"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function init() {
  // Create vector store
  const vectorStore = await openai.vectorStores.create({
    name: "knowledge-base"
  })

  console.log("Vector Store ID:", vectorStore.id)

  fs.writeFileSync('vector_store_id.txt', vectorStore.id)

  console.log("Vector store created and ID saved")
}

init()
