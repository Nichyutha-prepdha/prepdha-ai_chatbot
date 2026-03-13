const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:1234@localhost:5432/chatbot_db'
    }
  }
});

async function checkDatabase() {
  try {
    console.log('Checking database contents...');
    
    // Check if vector_file_id column exists in Page table
    const pages = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pages' 
      AND column_name = 'vector_file_id'
    `;
    
    console.log('vector_file_id column exists:', pages.length > 0);
    
    // Check actual Page records
    const pageRecords = await prisma.$queryRaw`
      SELECT id, "chapterId", "vector_file_id", "createdAt"
      FROM pages 
      ORDER BY "createdAt" DESC 
      LIMIT 10
    `;
    
    console.log('Page records:', pageRecords.length);
    pageRecords.forEach(page => {
      console.log(`- Page ID: ${page.id}, Chapter: ${page.chapterId}, Vector File: ${page.vector_file_id || 'NULL'}`);
    });
    
    // Check Document records
    const docCount = await prisma.document.count();
    console.log('Document count:', docCount);
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
