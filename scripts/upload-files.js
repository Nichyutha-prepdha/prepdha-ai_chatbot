import { config } from 'dotenv'
config({ path: '.env.local' })

console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No')

import OpenAI from "openai"
import fs from "fs"
import { toFile } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const METADATA_FILE = 'data/upload_metadata.json'

function loadMetadata() {
  if (fs.existsSync(METADATA_FILE)) {
    return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'))
  }
  return {}
}

function saveMetadata(metadata) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2))
}


function transformProductsToChunks(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const chunks = []

  for (const chapter of data.chapters || []) {
    for (const topic of chapter.topics || []) {
      const topicId = topic.topic_id
      const topicName = topic.topic_name

      for (const page of topic.pages || []) {
        const pageId = page.page_id
        const content = page.content
        const chunkContent = `[TOPIC_ID: ${topicId}] [PAGE_ID: ${pageId}] [TOPIC_NAME: ${topicName}] ${content}`
        chunks.push({
          key: `${topicId}_${pageId}`,
          filename: `${topicId}_${pageId}.txt`,
          content: chunkContent
        })
      }
    }
  }

  return chunks
}

async function upload() {
  const vectorStoreId = fs.readFileSync('vector_store_id.txt', 'utf8').trim()
  const metadata = loadMetadata()

  // Get current files in vector store
  const files = await openai.vectorStores.files.list(vectorStoreId)
  console.log(`Found ${files.data.length} files in vector store`)
  
  const filesWithNames = await Promise.all(
    files.data.map(async (f) => {
      try {
        const fileInfo = await openai.files.retrieve(f.id)
        console.log(`  - File in vector store: ID=${f.id}, filename=${fileInfo.filename}`)
        return { id: f.id, filename: fileInfo.filename }
      } catch (err) {
        console.log(`  - Error retrieving file ${f.id}: ${err.message}`)
        return null
      }
    })
  ).then(results => results.filter(Boolean))
  
  console.log(`Loaded ${filesWithNames.length} files with names\n`)

  // Transform products.json to chunks
  const chunks = transformProductsToChunks('data/products.json')
  let uploadedCount = 0
  let replacedCount = 0

  for (const chunk of chunks) {
    console.log(`Looking for: ${chunk.filename}`)
    const existingFiles = filesWithNames.filter(f => f.filename === chunk.filename)
    console.log(`  Found: ${existingFiles.length > 0 ? existingFiles.map(f => f.id).join(', ') : 'NOT FOUND'}`)

    // Delete all existing files with this filename
    for (const existingFile of existingFiles) {
      console.log(`Found existing file for ${chunk.key}: ${existingFile.id} - will replace`)
      // Delete old file from vector store
      await openai.vectorStores.files.delete(existingFile.id, { vector_store_id: vectorStoreId })
      // Also delete from OpenAI files
      await openai.files.delete(existingFile.id)
      console.log(`Deleted old file for ${chunk.key}: ${existingFile.id}`)
    }

    if (existingFiles.length > 0) {
      replacedCount++
    }

    // Upload new file with explicit filename using toFile
    const tempPath = `data/temp_${chunk.filename}`
    fs.writeFileSync(tempPath, chunk.content)

    const fileContent = fs.readFileSync(tempPath)
    const file = await openai.files.create({
      file: await toFile(fileContent, chunk.filename),
      purpose: "assistants"
    })

    await openai.vectorStores.files.create(
      vectorStoreId,
      { file_id: file.id, attributes: { file_id: file.id } }
    )

    

    // Update metadata
    metadata[chunk.key] = {
      file_id: file.id,
      filename: chunk.filename,
      uploaded_at: new Date().toISOString()
    }

    fs.unlinkSync(tempPath)
    console.log(`Uploaded: ${chunk.filename} (${existingFiles.length > 0 ? 'replaced' : 'new'})`)
    uploadedCount++
  }

  // TODO: Clean up orphaned files - need to find correct SDK method

  // Save metadata
  saveMetadata(metadata)

  console.log(`\nSummary: ${uploadedCount} uploaded (${replacedCount} replaced, ${uploadedCount - replacedCount} new)`)
}

upload()
