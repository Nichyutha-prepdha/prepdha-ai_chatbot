const { PrismaClient } = require('@prisma/client');

async function testEducationalPage() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing EducationalPage model...');
    
    // Test count
    const count = await prisma.educationalPage.count();
    console.log('✅ EducationalPage count:', count);
    
    // Test create
    const testPage = await prisma.educationalPage.create({
      data: {
        topic_id: 999,
        content_text: 'Test content',
        vector_file_id: 'test-file-id',
        is_published: false
      }
    });
    console.log('✅ Created test page:', testPage.id);
    
    // Test find
    const found = await prisma.educationalPage.findFirst({
      where: { topic_id: 999 }
    });
    console.log('✅ Found test page:', found ? 'YES' : 'NO');
    
    // Clean up
    await prisma.educationalPage.delete({
      where: { id: testPage.id }
    });
    console.log('✅ Cleaned up test page');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testEducationalPage();
