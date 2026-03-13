const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT current_database()`;
    console.log('✅ Connected to database:', result);
    
    // Check available models
    console.log('Available page models:', Object.keys(prisma).filter(k => k.toLowerCase().includes('page')));
    
    // Test EduPage model
    try {
      const eduPageCount = await prisma.eduPage.count();
      console.log('✅ EduPage model accessible. Current count:', eduPageCount);
    } catch (error) {
      console.error('❌ EduPage model failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
