// Import both Prisma clients
import { prisma } from './prisma'          // For conversations (local)
import { chapterPrisma } from './chapter-prisma'  // For chapters (Neon)

// Export both clients
export { prisma, chapterPrisma }

// Helper function to get chapter content from Neon database
export async function getChapterContent(chapterId: string) {
  try {
    // Use raw SQL to query your Neon database - using Book/Topic/Page schema
    const chapter = await chapterPrisma.$queryRaw`
      SELECT 
        b.*,
        t.title as topic_title
      FROM "Book" b
      LEFT JOIN "Topic" t ON b.id = t.book_id
      WHERE b.id = ${parseInt(chapterId)}
    `
    return chapter
  } catch (error) {
    console.error('Error fetching chapter content:', error)
    return null
  }
}

// Helper function to get documents by chapter from Neon database
export async function getDocumentsByChapter(grade: number, subject: string, chapter: string) {
  try {
    // Updated to work with Book/Topic/Page schema
    const documents = await chapterPrisma.$queryRaw`
      SELECT 
        p.*,
        t.title as topic_title,
        b.title as book_title
      FROM "Page" p
      LEFT JOIN "Topic" t ON p.topic_id = t.id
      LEFT JOIN "Book" b ON t.book_id = b.id
      WHERE b.title = ${chapter}
        AND t.title = ${subject}
      ORDER BY p.page_order ASC
    `
    return documents
  } catch (error) {
    console.error('Error fetching documents by chapter:', error)
    return []
  }
}

// Helper function to save conversations to local database
export async function saveConversation(userId: number, schoolId: number, title: string, content: any) {
  try {
    // Use local prisma for conversations
    const conversation = await prisma.document.create({
      data: {
        title,
        content,
        schoolId,
      }
    })
    return conversation
  } catch (error) {
    console.error('Error saving conversation:', error)
    return null
  }
}

// Helper function to get all conversations from local database
export async function getConversations(userId: number, schoolId: number, chapterId?: string) {
  try {
    const where = {
      schoolId,
      ...(chapterId && { chapter: chapterId })
    }
    
    const conversations = await prisma.document.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    })
    return conversations
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return []
  }
}

// Additional helper functions for Neon database schema

// Get all books
export async function getAllBooks() {
  try {
    const books = await chapterPrisma.$queryRaw`SELECT * FROM "Book" ORDER BY title`
    return books
  } catch (error) {
    console.error('Error fetching books:', error)
    return []
  }
}

// Get topics by book
export async function getTopicsByBook(bookId: number) {
  try {
    const topics = await chapterPrisma.$queryRaw`
      SELECT * FROM "Topic" 
      WHERE book_id = ${bookId}
      ORDER BY title
    `
    return topics
  } catch (error) {
    console.error('Error fetching topics:', error)
    return []
  }
}

// Get pages by topic
export async function getPagesByTopic(topicId: number) {
  try {
    const pages = await chapterPrisma.$queryRaw`
      SELECT * FROM "Page" 
      WHERE topic_id = ${topicId}
      ORDER BY page_order ASC
    `
    return pages
  } catch (error) {
    console.error('Error fetching pages:', error)
    return []
  }
}

// Get document chunks by page
export async function getDocumentChunksByPage(pageId: number) {
  try {
    const chunks = await chapterPrisma.$queryRaw`
      SELECT * FROM "DocumentChunk" 
      WHERE document_id = ${pageId}
      ORDER BY chunk_index ASC
    `
    return chunks
  } catch (error) {
    console.error('Error fetching document chunks:', error)
    return []
  }
}
