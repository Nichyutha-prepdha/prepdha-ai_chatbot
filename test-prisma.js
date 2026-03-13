const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
  try {
    console.log('Testing Prisma client...');
    const prisma = new PrismaClient();
    
    // Test basic connection
    try {
      const schools = await prisma.school.count();
      console.log('✅ Connected to main database. Schools count:', schools);
    } catch (error) {
      console.error('❌ Main database connection failed:', error.message);
    }
    
    // Test eduPage model
    try {
      const eduPageCount = await prisma.eduPage.count();
      console.log('✅ EduPage model accessible. Current count:', eduPageCount);
    } catch (error) {
      console.error('❌ EduPage model failed:', error.message);
      console.error('Available models:', Object.keys(prisma).filter(k => k.includes('page')));
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Prisma client initialization failed:', error);
  }
}

testPrisma();
