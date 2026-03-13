const { PrismaClient } = require('@prisma/client');

async function createMissingTopics() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 CREATING MISSING TOPICS');
    console.log('==========================');
    
    // Topics we need (based on your chapter data)
    const requiredTopics = [
      { id: 1, title: 'Test Chapter 1' }, // Already exists
      { id: 2, title: 'Test Chapter 2' },
      { id: 3, title: 'Test Chapter 3' },
      { id: 4, title: 'Test Chapter 4' },
      { id: 5, title: 'Test Chapter 5' },
      { id: 6, title: 'Test Chapter 6' } // For file-chapter-6
    ];
    
    // Check existing topics
    const existingTopics = await prisma.topic.findMany({
      select: { id: true, title: true },
      orderBy: { id: 'asc' }
    });
    
    console.log('\n📋 Existing topics:');
    existingTopics.forEach(topic => {
      console.log(`  ✅ Topic ${topic.id}: ${topic.title}`);
    });
    
    // Create missing topics
    let created = 0;
    for (const requiredTopic of requiredTopics) {
      const exists = existingTopics.find(t => t.id === requiredTopic.id);
      
      if (!exists) {
        try {
          const newTopic = await prisma.topic.create({
            data: {
              id: requiredTopic.id,
              title: requiredTopic.title,
              description: `Educational content for ${requiredTopic.title}`,
              is_published: false
            }
          });
          console.log(`➕ Created topic ${newTopic.id}: ${newTopic.title}`);
          created++;
        } catch (createError) {
          console.error(`❌ Failed to create topic ${requiredTopic.id}: ${createError.message}`);
        }
      }
    }
    
    console.log(`\n🎉 Topics creation complete: ${created} new topics created`);
    
    // Now update all vector file IDs
    console.log('\n🔄 UPDATING ALL VECTOR FILE IDS');
    console.log('==============================');
    
    const fileMappings = [
      { topicId: 1, fileId: 'file-chapter-1' },
      { topicId: 2, fileId: 'file-chapter-2' },
      { topicId: 3, fileId: 'file-chapter-3' },
      { topicId: 4, fileId: 'file-chapter-4' },
      { topicId: 5, fileId: 'file-chapter-5' },
      { topicId: 6, fileId: 'file-chapter-6' }
    ];
    
    let createdPages = 0;
    let updatedPages = 0;
    
    for (const mapping of fileMappings) {
      const { topicId, fileId } = mapping;
      
      console.log(`\n🔍 Processing topic ${topicId} with file ID: ${fileId}`);
      
      // Check if topic exists
      const topic = await prisma.topic.findFirst({
        where: { id: topicId },
        select: { id: true, title: true }
      });
      
      if (!topic) {
        console.warn(`⚠️ Topic ${topicId} does not exist. Skipping.`);
        continue;
      }
      
      console.log(`✅ Found topic: ${topic.title}`);
      
      // Check if EducationalPage already exists
      const existingPage = await prisma.educationalPage.findFirst({
        where: { topic_id: topicId }
      });
      
      if (existingPage) {
        if (existingPage.vector_file_id === fileId) {
          console.log(`⏭️ Already has correct file ID. Skipping.`);
        } else {
          // Update existing record
          await prisma.educationalPage.update({
            where: { id: existingPage.id },
            data: { vector_file_id: fileId }
          });
          console.log(`🔄 Updated existing record with file ID: ${fileId}`);
          updatedPages++;
        }
      } else {
        // Create new record
        const newPage = await prisma.educationalPage.create({
          data: {
            topic_id: topicId,
            vector_file_id: fileId,
            is_published: false
          }
        });
        console.log(`➕ Created new EducationalPage record ID: ${newPage.id}`);
        createdPages++;
      }
    }
    
    console.log(`\n🎉 VECTOR FILE IDS UPDATE COMPLETE!`);
    console.log(`📊 Results: ${createdPages} created, ${updatedPages} updated`);
    
    // Final verification
    const finalCount = await prisma.educationalPage.count();
    const finalPages = await prisma.educationalPage.findMany({
      select: { id: true, topic_id: true, vector_file_id: true },
      orderBy: { topic_id: 'asc' }
    });
    
    console.log(`\n📊 FINAL EducationalPage state: ${finalCount} records`);
    console.log('📄 Records:');
    finalPages.forEach(page => {
      console.log(`  ✅ Topic ${page.topic_id}: vector_file_id = '${page.vector_file_id}'`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await prisma.$disconnect();
}

createMissingTopics();
