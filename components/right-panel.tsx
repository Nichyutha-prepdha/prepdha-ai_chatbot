"use client"

import { useState, useCallback, useEffect } from "react"
import { ChatPanel, AISummaryPanel } from "./chat-panel"
import { FlashcardsPanel } from "./flashcards-panel"
import { QuestionsPanel } from "./questions-panel"
import { NotesPanel } from "./notes-panel"
import { AttachmentsPanel } from "./attachments-panel"
import { EditPanel } from "./edit-panel"
import {
  MessageSquare,
  BookOpen,
  HelpCircle,
  FileText,
  Paperclip,
  Pencil,
  X,
  Plus,
  Trash,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  time: string
  reference?: string
  image?: string
}

interface ChatThread {
  id: string
  title: string
  messages: Message[]
  chapterId: string | null
}

type TabId = "chat" | "flashcards" | "questions" | "notes" | "attachments" | "edit"

const tabs: { id: TabId; icon: typeof MessageSquare; label: string }[] = [
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "flashcards", icon: BookOpen, label: "Flashcards" },
  { id: "questions", icon: HelpCircle, label: "Questions" },
  { id: "notes", icon: FileText, label: "Notes" },
  { id: "attachments", icon: Paperclip, label: "Attachments" },
  { id: "edit", icon: Pencil, label: "Edit" },
]

// Remove hardcoded initialThreads - will load from database
const initialThreads: ChatThread[] = []

// API helpers for chat persistence
async function loadConversations(userId: number, schoolId: number, chapterId?: string): Promise<ChatThread[]> {
  try {
    const url = chapterId 
      ? `/api/conversations?userId=${userId}&schoolId=${schoolId}&chapterId=${chapterId}`
      : `/api/conversations?userId=${userId}&schoolId=${schoolId}`
    console.log("Loading conversations from:", url)
    const response = await fetch(url)
    if (!response.ok) {
      console.error("Failed to load conversations, status:", response.status)
      return []
    }
    const docs = await response.json()
    console.log("Loaded conversations:", docs)
    const result = docs.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      chapterId: doc.chapterId,
      messages: doc.messages || [],
    }))
    console.log("Mapped conversations with chapterIds:", result.map((t: ChatThread) => ({ id: t.id, title: t.title, chapterId: t.chapterId })))
    return result
  } catch (error) {
    console.error("Failed to load conversations:", error)
    return []
  }
}

async function createConversation(
  userId: number,
  schoolId: number,
  title: string,
  chapterId?: string
): Promise<ChatThread | null> {
  try {
    console.log("Creating conversation:", { userId, schoolId, title, chapterId })
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId, 
        schoolId, 
        title, 
        chapter: chapterId || null // Ensure chapter is always sent (null if not provided)
      }),
    })
    if (!response.ok) {
      console.error("Failed to create conversation, status:", response.status)
      return null
    }
    const doc = await response.json()
    console.log("Created conversation:", doc)
    const titlePrefixRegex = /^chat:(?:u\d+:)?/i
    const result = {
      id: doc.id,
      title: doc.title.replace(titlePrefixRegex, ""),
      chapterId: doc.chapter, // Backend returns 'chapter' not 'chapterId'
      messages: [],
    }
    console.log("Mapped created conversation:", result)
    return result
  } catch (error) {
    console.error("Failed to create conversation:", error)
    return null
  }
}

async function saveMessage(documentId: string, role: 'user' | 'assistant', content: string, chapterId?: string | null): Promise<boolean> {
  try {
    console.log("Saving message:", { documentId, role, content: content.substring(0, 50) + "..." })
    console.log("Current chapterId when saving:", chapterId)
    
    const response = await fetch(`/api/conversations/${documentId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, content }),
    })
    console.log("Save message response status:", response.status)
    const result = await response.json()
    console.log("Save message response:", result)
    return response.ok
  } catch (error) {
    console.error('Failed to save message:', error)
    return false
  }
}

async function loadMessages(threadId: string): Promise<Message[]> {
  try {
    console.log("Loading messages for thread:", threadId)
    const response = await fetch(`/api/conversations/${threadId}/messages`)
    if (!response.ok) {
      console.error("Failed to load messages, status:", response.status)
      return []
    }
    const data = await response.json()
    console.log("Loaded messages for thread", threadId, ":", data)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Failed to load messages:", error)
    return []
  }
}

async function deleteConversation(threadId: string): Promise<boolean> {
  try {
    console.log("Attempting to delete conversation:", threadId)
    const response = await fetch(`/api/conversations/${threadId}`, {
      method: 'DELETE',
    })
    console.log("Delete response status:", response.status)
    const result = await response.json()
    console.log("Delete response:", result)
    return response.ok
  } catch (error) {
    console.error("Failed to delete conversation:", error)
    return false
  }
}

const MAX_CHAT_THREADS =
  Number(process.env.NEXT_PUBLIC_MAX_CHAT_THREADS ?? "3") || 3

interface RightPanelProps {
  contextReference: string | null
  chapterContext: string | null
  onClearReference: () => void
  currentChapterId: string | null
}

export function RightPanel({
  contextReference,
  chapterContext,
  onClearReference,
  currentChapterId,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("chat")
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [activeThreadByChapter, setActiveThreadByChapter] = useState<
    Record<string, string | null>
  >({})
  const [showHistory, setShowHistory] = useState(false)
  const [showSummary, setShowSummary] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null
  
  // Debug active thread
  useEffect(() => {
    console.log("Active thread ID:", activeThreadId)
    console.log("Active thread:", activeThread)
    console.log("Active thread messages:", activeThread?.messages || [])
  }, [activeThreadId, activeThread])

  // Refresh conversations to get updated titles
  const refreshConversationsList = useCallback(async () => {
    const userId = 1
    const schoolId = 1
    try {
      console.log("=== Refreshing conversations list ===")
      const updatedThreads = await loadConversations(userId, schoolId, currentChapterId || undefined)
      
      // Load messages for all threads from database
      const threadsWithMessages = await Promise.all(
        updatedThreads.map(async (thread) => {
          const messages = await loadMessages(thread.id)
          console.log("Refresh - loaded messages for thread", thread.id, ":", messages)
          return { ...thread, messages }
        })
      )
      
      console.log("Refresh - setting threads with messages:", threadsWithMessages.map(t => ({ id: t.id, messageCount: t.messages.length })))
      setThreads(threadsWithMessages)
    } catch (error) {
      console.error("Failed to refresh conversations:", error)
    }
  }, [currentChapterId])

  // Load conversations from database on component mount
  useEffect(() => {
    const loadFromDatabase = async () => {
      const userId = 1
      const schoolId = 1
      const dbThreads = await loadConversations(userId, schoolId, currentChapterId || undefined)
      
      // Load messages for each thread from database
      const threadsWithMessages = await Promise.all(
        dbThreads.map(async (thread) => {
          const messages = await loadMessages(thread.id)
          console.log("Loaded messages for thread", thread.id, ":", messages.length, "messages")
          return { ...thread, messages }
        })
      )
      
      console.log("Setting threads with messages:", threadsWithMessages.map(t => ({ id: t.id, messageCount: t.messages.length })))
      setThreads(threadsWithMessages)
      
      const map: Record<string, string> = {}
      for (const t of threadsWithMessages) {
        if (t.chapterId && !map[t.chapterId]) map[t.chapterId] = t.id
      }
      setActiveThreadByChapter(map)
      
      // Auto-select first thread if no active thread
      if (!activeThreadId && threadsWithMessages.length > 0) {
        const firstThread = threadsWithMessages[0]
        setActiveThreadId(firstThread.id)
        setShowSummary(false)
        console.log("Auto-selected first thread:", firstThread.id)
      }
    }
    loadFromDatabase()
  }, [currentChapterId])

  // When the chapter changes, restore that chapter's last active chat (if any),
  // otherwise show the summary for a fresh start or select first available conversation.
  useEffect(() => {
    if (!currentChapterId) return

    const lastActiveForChapter = activeThreadByChapter[currentChapterId] ?? null
    setShowHistory(false)

    console.log("Chapter changed to:", currentChapterId)
    console.log("Last active for chapter:", lastActiveForChapter)
    console.log("Available threads:", threads.map(t => ({ id: t.id, chapterId: t.chapterId })))

    if (lastActiveForChapter && threads.find(t => t.id === lastActiveForChapter)) {
      setActiveThreadId(lastActiveForChapter)
      setShowSummary(false)
      console.log("Restored last active thread:", lastActiveForChapter)
    } else {
      // Try to select the first conversation for this chapter
      const chapterConversation = threads.find(t => t.chapterId === currentChapterId)
      if (chapterConversation) {
        setActiveThreadId(chapterConversation.id)
        setShowSummary(false)
        // Update the mapping
        setActiveThreadByChapter(prev => ({
          ...prev,
          [currentChapterId]: chapterConversation.id,
        }))
        console.log("Selected first chapter conversation:", chapterConversation.id)
      } else {
        // If no chapter conversation, select the first available thread
        if (threads.length > 0) {
          setActiveThreadId(threads[0].id)
          setShowSummary(false)
          setActiveThreadByChapter(prev => ({
            ...prev,
            [currentChapterId]: threads[0].id,
          }))
          console.log("Selected first available thread:", threads[0].id)
        } else {
          setActiveThreadId(null)
          setShowSummary(true)
          console.log("No threads available, showing summary")
        }
      }
    }
  }, [currentChapterId, activeThreadByChapter, threads])

  const getSuggestionsForThread = useCallback((thread: ChatThread | null): string[] => {
    if (!thread || thread.messages.length === 0) {
      return [
        "Explain this slowly step by step",
        "Explain like I'm five using a short story",
        "Give me 3 practice questions on this chapter",
      ]
    }

    const lastUser = [...thread.messages].reverse().find((m) => m.role === "user")
    const lastAssistant = [...thread.messages].reverse().find(
      (m) => m.role === "assistant"
    )

    const userText = lastUser?.content.toLowerCase() ?? ""
    const assistantText = lastAssistant?.content.toLowerCase() ?? ""

    // If we just summarized, suggest follow‑ups that go deeper
    if (userText.includes("summarize") || assistantText.includes("summary")) {
      return [
        "Explain this slowly step by step",
        "Give me a simple real‑life example",
        "Ask me 3 questions to check my understanding",
      ]
    }

    // If we just had an explanation, suggest applications and checks
    if (userText.includes("explain")) {
      return [
        "Give me a quick summary in 3 lines",
        "List the most important reasons or causes",
        "Create a short quiz (3 questions) on this explanation",
      ]
    }

    // Generic fall‑back suggestions
    return [
      "Explain this slowly step by step",
      "Explain like I'm five using a short story",
      "Give me 3 practice questions on this chapter",
    ]
  }, [])

  const handleNewChat = useCallback(async () => {
    const userId = 1
    const schoolId = 1
    const run = async () => {
      setError(null)
      const dbThread = await createConversation(
        userId,
        schoolId,
        "New Chat",
        currentChapterId || undefined
      )
      if (!dbThread) {
        setError("Failed to create a new chat.")
        return
      }
      setThreads((prev) => [dbThread, ...prev.slice(0, MAX_CHAT_THREADS - 1)])
      setActiveThreadId(dbThread.id)
      setShowHistory(false)
      setShowSummary(false)
      if (currentChapterId) {
        setActiveThreadByChapter((prev) => ({
          ...prev,
          [currentChapterId]: dbThread.id,
        }))
      }
    }
    run()
  }, [currentChapterId])

  const handleSelectThread = useCallback(async (threadId: string) => {
    console.log("Selecting thread:", threadId)
    console.log("Current chapterId:", currentChapterId)
    
    setActiveThreadId(threadId)
    setShowHistory(false)
    setShowSummary(false)
    if (currentChapterId) {
      setActiveThreadByChapter((prev) => ({
        ...prev,
        [currentChapterId]: threadId,
      }))
    }
    
    // Load messages for the selected thread if not already loaded
    const thread = threads.find((t) => t.id === threadId)
    console.log("Found thread in threads state:", thread)
    console.log("Active thread when selecting from history:", activeThread)
    
    if (!thread || thread.messages.length === 0) {
      console.log("Loading messages for thread from database...")
      const messages = await loadMessages(threadId)
      console.log("Loaded messages from database:", messages)
      setThreads((prev) => {
        console.log("Updating threads state with loaded messages...")
        const updated = prev.map((t) => (t.id === threadId ? { ...t, messages } : t))
        console.log("Updated threads state:", updated.map(t => ({ id: t.id, messageCount: t.messages?.length || 0 })))
        return updated
      })
    } else {
      console.log("Thread already has messages:", thread?.messages?.length || 0)
    }
  }, [currentChapterId, threads])

  const handleDeleteThread = useCallback(async (threadId: string) => {
    const success = await deleteConversation(threadId)
    if (success) {
      // Remove thread from state
      setThreads((prev) => prev.filter((t) => t.id !== threadId))
      
      // Clear active thread if it was the deleted one
      if (activeThreadId === threadId) {
        setActiveThreadId(null)
        setShowSummary(true)
      }
      
      // Remove from activeThreadByChapter mapping
      setActiveThreadByChapter((prev) => {
        const updated = { ...prev }
        for (const [chapterId, id] of Object.entries(prev)) {
          if (id === threadId) {
            delete updated[chapterId]
          }
        }
        return updated
      })
    } else {
      setError("Failed to delete conversation")
    }
  }, [activeThreadId])

  const sendToAI = useCallback(
    async (
      threadId: string,
      messages: Message[],
      reference?: string,
      chapterFallback?: string | null
    ) => {
      try {
        setIsSending(true)
        setError(null)

        const placeholderId = `${threadId}-ai-${Date.now()}`
        const placeholderTime = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })

        const placeholderMsg: Message = {
          id: placeholderId,
          role: "assistant",
          content: "",
          time: placeholderTime,
        }

        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, placeholderMsg] }
              : t
          )
        )

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context: reference || chapterFallback || null,
          }),
        })

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}))
          throw new Error(errorBody?.error || "Failed to get a response from AI")
        }

        const data = await response.json()
        const aiContent: string =
          typeof data?.content === "string"
            ? data.content
            : "I'm sorry, I couldn't generate a response. Please try again."

        // Check if AI response contains actual practice questions (not just conversational questions)
        const hasQuestions = (/\d+\./.test(aiContent) && /\?/.test(aiContent)) || 
                           (/question/i.test(aiContent) && (/\d+/.test(aiContent) || /1\.|2\.|3\./.test(aiContent))) || 
                           (/practice/i.test(aiContent) && /\d/.test(aiContent)) ||
                           (/quiz/i.test(aiContent) && /\d/.test(aiContent))
        
        // Check if the user's message was a content-related request (not just acknowledgment/greeting)
        const lastUserMessage = messages[messages.length - 1]?.content || ""
        const isUserRequestContentRelated = /question|quiz|practice|explain|explanation|summary|summarize|key.?point|main.?point|important.?point|tell.?me|what|how|why|when|where|who|which|give.?me|list|describe/i.test(lastUserMessage)
        
        // Check if user is asking about topics outside the chapter content
        const isUserAskingOutsideContent = (
          !/i understand|i understood|ok|thanks|thank you|hi|hello|hey|chivalry|greeting|acknowledge/i.test(lastUserMessage) &&
          !isUserRequestContentRelated &&
          !/harsha|king|throne|ascend|reign|military|campaign|territory|sasanka|gauda|chapter|age|battle|war|kingdom|court|alliance|enemy/i.test(lastUserMessage) &&
          lastUserMessage.length > 5
        )
        
        // Check if AI response indicates it can't answer or is giving general info
        const isAIGivingGeneralResponse = (
          /i don't have|I don't have|I'm not sure|I'm not sure|I cannot|I can't|outside|beyond|not mentioned|not covered|no information|no info|general|broader topic|different topic/i.test(aiContent) ||
          /that's a great question|that's interesting|while I don't|I don't have specific|I can provide general/i.test(aiContent)
        )
        
        // Check if AI response is content-related (explanation, summary, key points about chapter)
        const isContentRelated = (
          /explain|explanation|summary|summarize|key.?point|main.?point|important.?point|chapter|harsha|king|throne|ascend|reign|military|campaign|territory|sasanka|gauda/i.test(aiContent) &&
          aiContent.length > 50 // Substantial content, not just a greeting
        ) || hasQuestions
        
        // Check if AI response already contains a follow-up prompt
        const hasFollowUpPrompt = /Would you like|Should I|just type.*yes|type.*yes.*and/i.test(aiContent)
        
        // Handle different response types
        let finalContent
        if (isUserAskingOutsideContent && isAIGivingGeneralResponse) {
          // User asked outside content, AI gave general response - add content guidance
          finalContent = aiContent + "\n\n---\n\n**💡 Ask anything related to the chapter content** for more detailed and specific answers!"
        } else if (!hasFollowUpPrompt && isContentRelated && isUserRequestContentRelated) {
          // Content-related request with content response - add follow-up
          if (hasQuestions) {
            finalContent = aiContent + "\n\n---\n\n**Should I generate more questions?** If you'd like me to provide additional practice questions, just type **'yes'** and I'll create more questions for you."
          } else {
            finalContent = aiContent + "\n\n---\n\n**Did you understand this explanation?** If you'd like me to explain this in more detail, just type **'yes'** and I'll provide a more detailed explanation."
          }
        } else {
          // No additional prompts needed
          finalContent = aiContent
        }

        let index = 0
        const step = Math.max(2, Math.floor(finalContent.length / 80))

        const interval = setInterval(() => {
          index += step
          const nextText =
            index >= finalContent.length
              ? finalContent
              : finalContent.slice(0, index)

          setThreads((prev) =>
            prev.map((t) =>
              t.id === threadId
                ? {
                    ...t,
                    messages: t.messages.map((m) =>
                      m.id === placeholderId ? { ...m, content: nextText } : m
                    ),
                  }
                : t
            )
          )

          if (index >= finalContent.length) {
            clearInterval(interval)
            
            // Add the AI message to UI state
            const aiMsg: Message = {
              id: `ai-${Date.now()}`,
              role: "assistant",
              content: finalContent,
              time: new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
              }),
            }
            
            console.log("Adding AI message to UI:", aiMsg)
            
            setThreads((prev) => {
              console.log("Updating threads with AI response...")
              const updated = prev.map((t) =>
                t.id === threadId
                  ? { ...t, messages: [...t.messages.filter(m => m.id !== placeholderId), aiMsg] }
                  : t
              )
              console.log("Updated threads after AI:", updated.map(t => ({ id: t.id, messageCount: t.messages.length })))
              return updated
            })
            
            // Save AI response to database (user message is saved in handleSendMessage)
            saveMessage(threadId, 'assistant', finalContent, currentChapterId || undefined)
            
            // Refresh conversation list to get updated title
            refreshConversationsList()
          }
        }, 20)

        // Store interval ID for cleanup
        return () => clearInterval(interval)
      } catch (err) {
        console.error(err)
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while talking to the AI."
        )
      } finally {
        setIsSending(false)
      }
    },
    [refreshConversationsList]
  )

  const handleSendMessage = useCallback(
    async (text: string) => {
      const time = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })

      // Check if user typed "yes" for detailed explanation or more questions
      const isYesResponse = text.toLowerCase().trim() === "yes"
      
      if (isYesResponse && activeThreadId) {
        const currentThread = threads.find((t) => t.id === activeThreadId)
        if (currentThread && currentThread.messages.length > 0) {
          // Find the last assistant message to get context
          const lastAssistantMessage = [...currentThread.messages].reverse().find(m => m.role === "assistant")
          const lastUserMessage = [...currentThread.messages].reverse().find(m => m.role === "user")
          
          if (lastAssistantMessage && lastUserMessage) {
            // Check if the original user request was for explanations or questions
            const originalUserText = lastUserMessage.content.toLowerCase()
            const wasOriginallyAboutExplanation = originalUserText.includes("explain") || originalUserText.includes("step by step") || originalUserText.includes("slowly")
            const wasOriginallyAboutQuestions = originalUserText.includes("question") || originalUserText.includes("practice") || originalUserText.includes("quiz")
            
            let detailedRequest
            if (wasOriginallyAboutQuestions) {
              detailedRequest = "Please generate more practice questions"
            } else if (wasOriginallyAboutExplanation) {
              detailedRequest = "Please explain this in much more detail with examples, context, and deeper analysis."
            } else {
              // Fallback: check the assistant message content with more flexible patterns
              const wasAboutQuestions = /should i generate|would you like|do you want|create.*question|provide.*question|generate.*question|more.*question|additional.*question/i.test(lastAssistantMessage.content)
              detailedRequest = wasAboutQuestions ? 
                "Please generate more practice questions" : 
                "Please explain this in much more detail with examples, context, and deeper analysis."
            }
            
            const userMsg: Message = {
              id: Date.now().toString(),
              role: "user",
              content: detailedRequest,
              time,
            }

            setThreads((prev) =>
              prev.map((t) =>
                t.id === activeThreadId
                  ? { ...t, messages: [...t.messages, userMsg] }
                  : t
              )
            )

            // Save the detailed request message to database
            await saveMessage(activeThreadId, 'user', detailedRequest, currentChapterId)

            try {
              await sendToAI(
                activeThreadId,
                [...currentThread.messages, userMsg],
                contextReference || chapterContext || undefined
              )
            } catch (error) {
              console.error('Failed to send detailed request:', error)
            }
            return
          }
        }
      }

      // Prevent auto-generated requests from creating new threads
      if (text.startsWith("Please") && (text.includes("generate more") || text.includes("explain this in much more detail"))) {
        return
      }

      if (!activeThreadId) {
        // Create a new thread in database
        const newTitle = text.length > 30 ? text.slice(0, 30) + "..." : text
        const dbThread = await createConversation(
          1,
          1,
          newTitle,
          currentChapterId || undefined
        )

      if (dbThread) {
          const newThread: ChatThread = {
            ...dbThread,
            messages: [],
          }

          // Add new thread and enforce per-chapter limit
          setThreads((prev) => {
            const sameChapter = prev.filter(
              (t) => t.chapterId === newThread.chapterId
            )
            const otherChapters = prev.filter(
              (t) => t.chapterId !== newThread.chapterId
            )

            const updatedSameChapter = [newThread, ...sameChapter].slice(
              0,
              MAX_CHAT_THREADS
            )

            return [...updatedSameChapter, ...otherChapters]
          })
          setActiveThreadId(newThread.id)
          setShowSummary(false)
          if (currentChapterId) {
            setActiveThreadByChapter((prev) => ({
              ...prev,
              [currentChapterId]: newThread.id,
            }))
          }

          const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            time,
            reference: contextReference || undefined,
          }

          // Save the user message to database
          saveMessage(newThread.id, 'user', text, currentChapterId)

          setThreads((prev) =>
            prev.map((t) =>
              t.id === newThread.id
                ? { ...t, messages: [...t.messages, userMsg] }
                : t
            )
          )

          try {
            await sendToAI(
              newThread.id,
              [...newThread.messages, userMsg],
              contextReference || chapterContext || undefined
            )
          } catch (error) {
            console.error('Failed to send message to AI:', error)
          }
        }
      } else {
        // Add to existing thread
        const userMsg: Message = {
          id: Date.now().toString(),
          role: "user",
          content: text,
          time,
          reference: contextReference || undefined,
        }
        console.log("Adding user message to existing thread:", userMsg)
        
        const currentThread = threads.find((t) => t.id === activeThreadId)
        console.log("Current thread before update:", currentThread)
        
        const messagesForApi = currentThread
          ? [...currentThread.messages, userMsg]
          : [userMsg]

        console.log("Messages for API:", messagesForApi)

        setThreads((prev) => {
          console.log("Updating threads state...")
          const updated = prev.map((t) =>
            t.id === activeThreadId
              ? { ...t, messages: [...t.messages, userMsg] }
              : t
          )
          console.log("Updated threads:", updated.map(t => ({ id: t.id, messageCount: t.messages.length })))
          return updated
        })
        if (contextReference) onClearReference()

        // Persist user message for existing threads
        if (activeThreadId) {
          console.log("About to save user message for thread:", activeThreadId)
          console.log("Current thread before save:", threads.find(t => t.id === activeThreadId))
          saveMessage(activeThreadId, 'user', text, currentChapterId)
        }

        try {
          await sendToAI(
            activeThreadId!,
            messagesForApi,
            contextReference || chapterContext || undefined
          )
        } catch (error) {
          console.error('Failed to send message to AI:', error)
        }
      }
    },
    [
      activeThreadId,
      contextReference,
      chapterContext,
      threads,
      onClearReference,
      sendToAI,
      currentChapterId,
    ]
  )

  return (
    <div className="flex flex-col w-full min-w-0 border-l border-border bg-card h-full">
      {/* Tab Icons */}
      <div className="flex items-center justify-center gap-1 px-3 py-2.5 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-[#7c3aed] text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              aria-label={tab.label}
              title={tab.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          )
        })}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "chat" && (
          <>
            {/* Chat History Drawer */}
            {showHistory && (
              <div className="border-b border-border bg-card">
                {/* History Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowHistory(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Close chat history"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold text-foreground">
                      Chats
                    </span>
                  </div>
                  <button
                    onClick={handleNewChat}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] font-medium hover:bg-[#7c3aed]/20 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    New
                  </button>
                </div>
                {/* Thread List */}
                <div className="max-h-48 overflow-y-auto">
                  {(() => {
                    console.log("Current chapterId:", currentChapterId)
                    console.log("All threads:", threads.map(t => ({ id: t.id, title: t.title, chapterId: t.chapterId })))
                    const filteredThreads = threads.filter((thread) =>
                      currentChapterId
                        ? thread.chapterId === currentChapterId
                        : true // Show all conversations when not in a specific chapter
                    )
                    console.log("Filtered threads:", filteredThreads.map(t => ({ id: t.id, title: t.title, chapterId: t.chapterId })))
                    return filteredThreads
                  })()
                    .map((thread) => (
                      <div
                        key={thread.id}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors group ${
                          activeThreadId === thread.id
                            ? "bg-[#7c3aed]/5"
                            : ""
                        }`}
                      >
                        <button
                          onClick={() => handleSelectThread(thread.id)}
                          className="flex items-center gap-3 flex-1 min-w-0"
                        >
                          <MessageSquare className="w-4 h-4 text-[#7c3aed] shrink-0" />
                          <span className="text-sm text-foreground truncate">
                            {thread.title}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteThread(thread.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-all p-1 rounded hover:bg-red-50"
                          aria-label="Delete conversation"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              {showSummary && !activeThread ? (
                <AISummaryPanel
                  onSendMessage={handleSendMessage}
                  contextReference={contextReference}
                  onClearReference={onClearReference}
                  onOpenHistory={() => setShowHistory(true)}
                  chapterId={currentChapterId}
                />
              ) : activeThread ? (
                <ChatPanel
                  messages={activeThread.messages}
                  onSendMessage={handleSendMessage}
                  suggestions={getSuggestionsForThread(activeThread)}
                  contextReference={contextReference}
                  onClearReference={onClearReference}
                  title={activeThread.title}
                  onOpenHistory={() => setShowHistory(true)}
                />
              ) : null}
            </div>
          </>
        )}
        {activeTab === "flashcards" && <FlashcardsPanel />}
        {activeTab === "questions" && <QuestionsPanel />}
        {activeTab === "notes" && <NotesPanel />}
        {activeTab === "attachments" && <AttachmentsPanel />}
        {activeTab === "edit" && (
          <EditPanel 
            contextReference={contextReference}
            chapterContext={chapterContext}
            currentChapterId={currentChapterId}
          />
        )}
      </div>
      {/* Simple error / status message */}
      {error && (
        <div className="px-4 py-2 text-xs text-red-600 border-t border-border bg-red-50">
          {error}
        </div>
      )}
      {isSending && !error && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border bg-muted/40">
          Generating AI response...
        </div>
      )}
    </div>
  )
}
