import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('=== Database Tables and Data ===\n')
    
    // Check Schools
    const schools = await prisma.school.findMany()
    console.log(`Schools (${schools.length}):`)
    schools.forEach(school => {
      console.log(`  ID: ${school.id}, Name: "${school.name}"`)
    })
    console.log('')
    
    // Check Conversations
    const conversations = await prisma.conversation.findMany({
      include: {
        school: { select: { name: true } },
        _count: { select: { messages: true } }
      }
    })
    console.log(`Conversations (${conversations.length}):`)
    conversations.forEach(conv => {
      console.log(`  ID: ${conv.id}, Title: "${conv.title}", School: "${conv.school.name}", Messages: ${conv._count.messages}`)
    })
    console.log('')
    
    // Check Messages
    const messages = await prisma.message.findMany({
      include: {
        conversation: { select: { title: true } }
      }
    })
    console.log(`Messages (${messages.length}):`)
    messages.forEach(msg => {
      console.log(`  ID: ${msg.id}, Role: ${msg.role}, Conversation: "${msg.conversation.title}"`)
    })
    console.log('')
    
    // Check Documents
    const documents = await prisma.document.findMany()
    console.log(`Documents (${documents.length}):`)
    documents.forEach(doc => {
      console.log(`  ID: ${doc.id}, Title: "${doc.title}"`)
    })
    
  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
