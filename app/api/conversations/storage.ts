// In-memory storage for demo purposes
// In production, you'd use a database like PostgreSQL with Prisma
export const conversations = new Map()
export let messageId = 1
export let conversationId = 1

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  reference?: string
  image?: string
}

export interface Conversation {
  id: string
  title: string
  userId: number
  schoolId: number
  chapter?: string | null
  messages: Message[]
  createdAt: string
  updatedAt: string
}
