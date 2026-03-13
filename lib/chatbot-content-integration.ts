import { getChapterContextForChatbot, searchChapters } from "./chapter-content-extractor"

// Re-export for use in other modules
export { getChapterContextForChatbot, searchChapters } from "./chapter-content-extractor"

/**
 * Get relevant chapter content for chatbot based on user query
 * @param userQuery The user's question or request
 * @param currentChapterId The currently active chapter (optional)
 * @returns Formatted content string for chatbot context
 */
export function getRelevantContentForChatbot(
  userQuery: string, 
  currentChapterId?: string | null
): string {
  let content = ""
  
  // If we have a current chapter, include its context first
  if (currentChapterId) {
    const chapterContext = getChapterContextForChatbot(currentChapterId)
    if (chapterContext) {
      content += `Current Chapter Context:\n${chapterContext}\n\n`
    }
  }
  
  // Search for relevant content across all chapters
  const searchResults = searchChapters(userQuery)
  
  if (searchResults.length > 0) {
    content += "Relevant Information:\n"
    searchResults.forEach((result, index) => {
      content += `\n${index + 1}. From "${result.chapterTitle}":\n`
      result.matches.forEach(match => {
        content += `   - ${match}\n`
      })
    })
  }
  
  return content
}

/**
 * Extract key topics and concepts from chapter content
 * @param chapterId The chapter ID to analyze
 * @returns Array of key topics
 */
export function extractKeyTopics(chapterId: string): string[] {
  const context = getChapterContextForChatbot(chapterId)
  if (!context) return []
  
  // Simple keyword extraction - in a real implementation, you might use NLP
  const topics: string[] = []
  
  // Common historical and military terms to look for
  const keyTerms = [
    "Harsha", "Sasanka", "Gauda", "Magadha", "military", "campaign", 
    "expedition", "conquest", "kingdom", "empire", "throne", "allies",
    "enemies", "strategy", "diplomacy", "architecture", "monuments",
    "Nalanda", "university", "temples", "patronage"
  ]
  
  keyTerms.forEach(term => {
    if (context.toLowerCase().includes(term.toLowerCase())) {
      topics.push(term)
    }
  })
  
  return [...new Set(topics)] // Remove duplicates
}

/**
 * Generate study questions based on chapter content
 * @param chapterId The chapter ID to generate questions for
 * @param count Number of questions to generate
 * @returns Array of study questions
 */
export function generateStudyQuestions(chapterId: string, count: number = 5): string[] {
  const context = getChapterContextForChatbot(chapterId)
  if (!context) return []
  
  const questions: string[] = []
  
  // Question templates based on common content patterns
  const questionTemplates = [
    "What were the main challenges that {character} faced during {period}?",
    "How did {character} demonstrate {quality} in the {context}?",
    "What was the significance of {event} in the broader historical context?",
    "How did {action} contribute to {outcome}?",
    "What were the key factors that led to {result}?",
    "Describe the relationship between {character1} and {character2}.",
    "What role did {concept} play in {context}?",
    "How did {location} influence the events described?"
  ]
  
  // Extract key entities to fill in templates
  const entities = extractKeyTopics(chapterId)
  
  // Generate questions using available entities
  for (let i = 0; i < count && i < questionTemplates.length; i++) {
    let question = questionTemplates[i]
    
    // Simple placeholder replacement (in a real implementation, this would be more sophisticated)
    if (entities.includes("Harsha")) {
      question = question.replace("{character}", "Harsha")
    }
    if (entities.includes("Sasanka")) {
      question = question.replace("{character1}", "Harsha").replace("{character2}", "Sasanka")
    }
    if (entities.includes("military")) {
      question = question.replace("{action}", "military campaigns").replace("{quality}", "military prowess")
    }
    if (entities.includes("Gauda")) {
      question = question.replace("{location}", "Gauda")
    }
    
    // Remove any remaining placeholders
    question = question.replace(/\{[^}]+\}/g, "the relevant factors")
    
    questions.push(question)
  }
  
  return questions
}

/**
 * Create a summary of chapter content for quick reference
 * @param chapterId The chapter ID to summarize
 * @returns Concise summary
 */
export function createChapterSummary(chapterId: string): string | null {
  const context = getChapterContextForChatbot(chapterId)
  if (!context) return null
  
  // Extract the first few sentences from each section for a quick summary
  const lines = context.split('\n')
  const summaryLines: string[] = []
  
  let inContent = false
  for (const line of lines) {
    if (line.startsWith('Content:')) {
      inContent = true
      continue
    }
    
    if (inContent && line.trim()) {
      // Take the first sentence of each paragraph
      const firstSentence = line.split('.')[0] + '.'
      if (firstSentence.length > 10) { // Avoid very short fragments
        summaryLines.push(firstSentence)
      }
      
      // Limit summary to reasonable length
      if (summaryLines.length >= 3) break
    }
  }
  
  return summaryLines.length > 0 ? summaryLines.join(' ') : null
}

/**
 * Get vocabulary definitions for a specific chapter
 * @param chapterId The chapter ID
 * @returns Formatted vocabulary list
 */
export function getChapterVocabulary(chapterId: string): string | null {
  const context = getChapterContextForChatbot(chapterId)
  if (!context) return null
  
  const vocabSection = context.split('Key Vocabulary:')
  if (vocabSection.length < 2) return null
  
  return vocabSection[1].trim()
}
