/**
 * Enhanced chat service that integrates chapter content for better responses
 */

import { getRelevantContentForChatbot, getChapterContextForChatbot } from "./chatbot-content-integration"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

interface ChatRequest {
  messages: ChatMessage[]
  context?: string | null
  chapterId?: string | null
}

/**
 * Enhanced chat request handler that includes chapter content
 */
export async function handleEnhancedChatRequest(request: ChatRequest): Promise<string> {
  const { messages, context, chapterId } = request
  
  // Get the latest user message
  const userMessage = messages[messages.length - 1]?.content || ""
  
  // Build enhanced context with chapter content
  let enhancedContext = ""
  
  // Add chapter context if available
  if (chapterId) {
    const chapterContext = getChapterContextForChatbot(chapterId)
    if (chapterContext) {
      enhancedContext += `\n\n=== CHAPTER CONTEXT ===\n${chapterContext}\n`
    }
  }
  
  // Add user-provided context (like highlighted text)
  if (context) {
    enhancedContext += `\n\n=== USER CONTEXT ===\n${context}\n`
  }
  
  // Add relevant content based on user query
  const relevantContent = getRelevantContentForChatbot(userMessage, chapterId)
  if (relevantContent) {
    enhancedContext += `\n\n=== RELEVANT INFORMATION ===\n${relevantContent}\n`
  }
  
  // Create the system prompt with enhanced context
  const systemPrompt = `You are a helpful AI tutor specializing in ancient Indian history, particularly the reign of Emperor Harsha (c. 590-647 CE). 

Your role is to:
1. Answer questions about Harsha, his empire, military campaigns, and historical context
2. Provide detailed explanations based on the chapter content provided
3. Help students understand key concepts and vocabulary
4. Generate relevant study questions when appropriate
5. Maintain an engaging and educational tone${enhancedContext ? `\n\nHere is relevant context to help you answer:\n${enhancedContext}` : ""}

Please base your answers primarily on the provided chapter content. If information isn't available in the context, you can provide general historical knowledge but indicate that it's not from the specific chapter material.

Keep responses educational, accurate, and appropriate for students learning about this historical period.`

  // Call the AI service with enhanced context
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...messages
        ],
        context: enhancedContext,
        chapterId: chapterId || null,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get response from AI")
    }

    const data = await response.json()
    return data.content || "I'm sorry, I couldn't generate a response."
  } catch (error) {
    console.error("Enhanced chat service error:", error)
    return "I apologize, but I'm having trouble processing your request right now. Please try again."
  }
}

/**
 * Generate contextual suggestions based on current chapter
 */
export function generateContextualSuggestions(chapterId: string | null, lastUserMessage?: string): string[] {
  const baseSuggestions = [
    "Explain this slowly step by step",
    "Explain like I'm five using a short story", 
    "Give me 3 practice questions on this chapter",
  ]
  
  if (!chapterId) {
    return baseSuggestions
  }
  
  const chapterContext = getChapterContextForChatbot(chapterId)
  if (!chapterContext) {
    return baseSuggestions
  }
  
  // Generate chapter-specific suggestions
  const contextualSuggestions = [
    "What were the main challenges Harsha faced?",
    "How did Harsha's military campaigns work?",
    "What was the relationship between Harsha and Sasanka?",
    "Explain the historical significance of these events",
    "Help me understand the key vocabulary terms",
  ]
  
  // If there was a previous message, add follow-up suggestions
  if (lastUserMessage) {
    const lowerMessage = lastUserMessage.toLowerCase()
    
    if (lowerMessage.includes("explain") || lowerMessage.includes("summary")) {
      contextualSuggestions.push(
        "Can you give me more specific details?",
        "What happened after this?",
        "How does this connect to other events?"
      )
    }
    
    if (lowerMessage.includes("question") || lowerMessage.includes("quiz")) {
      contextualSuggestions.push(
        "Give me more practice questions",
        "Make the questions harder",
        "Focus on vocabulary questions"
      )
    }
  }
  
  return [...baseSuggestions.slice(0, 2), ...contextualSuggestions.slice(0, 3)]
}

/**
 * Extract key terms from user message for better context
 */
export function extractKeyTerms(message: string): string[] {
  const historicalTerms = [
    "harsha", "sasanka", "gauda", "magadha", "bengal", "india",
    "military", "campaign", "expedition", "conquest", "battle",
    "king", "emperor", "throne", "kingdom", "empire",
    "allies", "enemies", "diplomacy", "strategy",
    "architecture", "monuments", "temple", "nalanda", "university",
    "ascended", "instability", "retaliation", "betrayal"
  ]
  
  const words = message.toLowerCase().split(/\s+/)
  const foundTerms = words.filter(word => 
    historicalTerms.some(term => word.includes(term) || term.includes(word))
  )
  
  return [...new Set(foundTerms)] // Remove duplicates
}
