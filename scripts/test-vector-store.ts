#!/usr/bin/env node

/**
 * Test script to verify vector store functionality and debug similarity scores
 * Run with: npx tsx scripts/test-vector-store.ts
 */

import { openaiVectorStore } from '../lib/openai-vector-store'
import { searchSimilarDocumentsByQuery } from '../lib/embeddings'

console.log('🔍 Testing Vector Store Functionality\n')

async function testVectorStore() {
  try {
    // 1. Check embedding status
    console.log('📊 Checking embedding status...')
    const status = await openaiVectorStore.checkEmbeddingStatus()
    console.log('Embedding Status:', JSON.stringify(status, null, 2))
    
    // Show recommendations
    console.log('\n💡 Recommendations:')
    status.recommendations.forEach(rec => console.log(`   - ${rec}`))
    
    if (!status.isReady) {
      console.log('\n⚠️  Vector store is not ready for similarity scoring yet.')
      console.log('   Please follow the recommendations above and try again later.')
      return
    }
    
    // 2. Check vector store status
    console.log('\n📊 Checking vector store status...')
    const vectorStatus = await openaiVectorStore.getVectorStoreStatus()
    console.log('Vector Store Status:', JSON.stringify(vectorStatus, null, 2))
    
    // 2. List files in vector store
    console.log('\n📁 Files in vector store:')
    const files = await openaiVectorStore.listFiles()
    console.log(`Found ${files.length} files:`)
    files.forEach((file, i) => {
      console.log(`  ${i + 1}. ${file.id} - Status: ${file.status} - Created: ${file.created_at}`)
      if (file.last_error) {
        console.log(`     Error: ${file.last_error}`)
      }
    })
    
    // 3. Test search with detailed logging
    console.log('\n🔍 Testing search functionality...')
    const testQuery = "Harsha military campaigns"
    console.log(`Query: "${testQuery}"`)
    
    const results = await openaiVectorStore.searchSimilarDocuments(testQuery, 3)
    
    console.log(`\n📈 Search Results (${results.length} found):`)
    results.forEach((result, i) => {
      console.log(`\n${i + 1}. Result ID: ${result.id}`)
      console.log(`   Similarity: ${result.similarity !== null && result.similarity !== undefined ? result.similarity.toFixed(4) : 'NULL'}`)
      console.log(`   Content: ${result.content.substring(0, 150)}...`)
      console.log(`   Chapter ID: ${result.chapter_id || 'NULL'}`)
      console.log(`   Section ID: ${result.section_id || 'NULL'}`)
    })
    
    // 4. Test through the embeddings service
    console.log('\n🔄 Testing through embeddings service...')
    const embeddingResults = await searchSimilarDocumentsByQuery(testQuery, 3, 0.1)
    
    console.log(`\n📈 Embeddings Service Results (${embeddingResults.length} found):`)
    embeddingResults.forEach((result, i) => {
      console.log(`\n${i + 1}. Result ID: ${result.id}`)
      console.log(`   Similarity: ${result.similarity !== null && result.similarity !== undefined ? (result.similarity * 100).toFixed(1) + '%' : 'NULL'}`)
      console.log(`   Content: ${result.content.substring(0, 150)}...`)
    })
    
    // 5. Analysis and recommendations
    console.log('\n🎯 Analysis:')
    
    const hasSimilarityScores = results.some(r => r.similarity !== null)
    const hasFileErrors = files.some(f => f.last_error)
    const allFilesProcessed = files.every(f => f.status === 'completed')
    
    if (!hasSimilarityScores) {
      console.log('❌ No similarity scores found')
      console.log('   Possible causes:')
      console.log('   - OpenAI still indexing embeddings (wait 15-30 minutes)')
      console.log('   - API response format changed')
      console.log('   - Vector store not properly initialized')
    } else {
      console.log('✅ Similarity scores are working!')
    }
    
    if (hasFileErrors) {
      console.log('❌ Some files have errors')
      console.log('   Check the error messages above')
    }
    
    if (!allFilesProcessed) {
      console.log('⏳ Some files are still being processed')
      console.log('   Wait for OpenAI to complete indexing')
    } else {
      console.log('✅ All files are processed')
    }
    
    // 6. Recommendations
    console.log('\n💡 Recommendations:')
    
    if (!hasSimilarityScores && allFilesProcessed) {
      console.log('   - Wait 15-30 minutes for OpenAI indexing to complete')
      console.log('   - Check if OpenAI API key has vector store permissions')
      console.log('   - Try re-uploading embeddings if needed')
    }
    
    if (hasFileErrors) {
      console.log('   - Fix file processing errors')
      console.log('   - May need to re-upload problematic files')
    }
    
    console.log('\n✅ Test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('\nTroubleshooting:')
    console.error('1. Check OpenAI API key in environment variables')
    console.error('2. Verify vector store permissions')
    console.error('3. Check internet connection')
    console.error('4. Ensure OpenAI services are available')
  }
}

// Run the test
testVectorStore()
