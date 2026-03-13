#!/usr/bin/env node

/**
 * Demo script showing how to extract and use chapter content for the chatbot
 * Run with: npx tsx scripts/demo-chapter-content.ts
 */

import { 
  getAllChaptersAsText, 
  getChapterAsText, 
  getChapterContextForChatbot,
  getChapterList,
  searchChapters 
} from '../lib/chapter-content-extractor'

import { 
  getRelevantContentForChatbot,
  extractKeyTopics,
  generateStudyQuestions,
  createChapterSummary,
  getChapterVocabulary
} from '../lib/chatbot-content-integration'

console.log('📚 Chapter Content Extraction Demo\n')

// 1. Get all chapters list
console.log('📋 Available Chapters:')
const chapters = getChapterList()
chapters.forEach((ch, i) => {
  console.log(`  ${i + 1}. ${ch.title} (${ch.id}) - Status: ${ch.status}`)
})

// 2. Get specific chapter content
console.log('\n📖 Chapter 1 Content (Context Format):')
const chapter1Context = getChapterContextForChatbot('chapter-1')
if (chapter1Context) {
  console.log(chapter1Context.substring(0, 500) + '...')
}

// 3. Search functionality
console.log('\n🔍 Searching for "Harsha":')
const searchResults = searchChapters('Harsha')
searchResults.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.chapterTitle}:`)
  result.matches.slice(0, 2).forEach(match => {
    console.log(`     - ${match.substring(0, 100)}...`)
  })
})

// 4. Get relevant content for a user query
console.log('\n🤖 Relevant Content for Query "Who was Harsha?":')
const relevantContent = getRelevantContentForChatbot('Who was Harsha?', 'chapter-1')
console.log(relevantContent.substring(0, 500) + '...')

// 5. Extract key topics
console.log('\n🏷️ Key Topics from Chapter 1:')
const topics = extractKeyTopics('chapter-1')
console.log(topics.join(', '))

// 6. Generate study questions
console.log('\n❓ Study Questions for Chapter 1:')
const questions = generateStudyQuestions('chapter-1', 3)
questions.forEach((q, i) => {
  console.log(`  ${i + 1}. ${q}`)
})

// 7. Create summary
console.log('\n📝 Chapter 1 Summary:')
const summary = createChapterSummary('chapter-1')
if (summary) {
  console.log(summary)
}

// 8. Get vocabulary
console.log('\n📖 Chapter 1 Vocabulary:')
const vocab = getChapterVocabulary('chapter-1')
if (vocab) {
  console.log(vocab)
}

// 9. Show how to use in API context
console.log('\n🌐 API Usage Examples:')
console.log('GET /api/chapters - Get all chapters as text')
console.log('GET /api/chapters?format=list - Get chapter list')
console.log('GET /api/chapters?chapterId=chapter-1 - Get specific chapter')
console.log('GET /api/chapters?chapterId=chapter-1&format=context - Get chapter context for chatbot')
console.log('GET /api/chapters?query=Harsha - Search across chapters')

console.log('\n✅ Demo completed!')
