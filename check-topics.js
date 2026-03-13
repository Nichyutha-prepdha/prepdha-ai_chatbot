const { PrismaClient } = require('@prisma/client');

async function checkTopics() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking available topics...');
    
    const topics = await prisma.topic.findMany({
      select: {
        id: true,
        title: true
      },
      take: 10
    });
    
    console.log('Available topics:');
    topics.forEach(topic => {
      console.log(`  ID: ${topic.id}, Title: ${topic.title}`);
    });
    
    if (topics.length === 0) {
      console.log('❌ No topics found. You need to create topics first.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTopics();
