const { PrismaClient } = require('@prisma/client');

async function finalFixVectorIds() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 FINAL FIX FOR VECTOR FILE IDS');
    console.log('===============================');
    
    // Check existing data structure
    const existingBooks = await prisma.book.findMany({
      select: { id: true, title: true },
      take: 5
    });
    
    const existingChapters = await prisma.chapter.findMany({
      select: { id: true, book_id: true, title: true },
      orderBy: { id: 'asc' }
    });
    
    const existingTopics = await prisma.topic.findMany({
      select: { id: true, chapter_id: true, title: true },
      orderBy: { id: 'asc' }
    });
    
    console.log('\n📋 Existing data:');
    console.log(`Books: ${existingBooks.length}`);
    console.log(`Chapters: ${existingChapters.length}`);
    console.log(`Topics: ${existingTopics.length}`);
    
    // Show existing topics
    console.log('\n📋 Existing topics:');
    existingTopics.forEach(topic => {
      console.log(`  Topic ${topic.id}: ${topic.title} (Chapter: ${topic.chapter_id})`);
    });
    
    // Use existing book
    const bookId = existingBooks[0].id;
    console.log(`\n✅ Using book ID: ${bookId}`);
    
    // Create additional chapters if needed
    let chapterId = existingChapters[0].id;
    console.log(`\n✅ Using chapter ID: ${chapterId}`);
    
    // Create missing topics in the same chapter
    const requiredTopics = [
      { title: 'Test Chapter 1', order_no: 1 }, // Already exists
      { title: 'Test Chapter 2', order_no: 2 },
      { title: 'Test Chapter 3', order_no: 3 },
      { title: 'Test Chapter 4', order_no: 4 },
      { title: 'Test Chapter 5', order_no: 5 },
      { title: 'Test Chapter 6', order_no: 6 }
    ];
    
    const createdTopics = [];
    
    for (const topicData of requiredTopics) {
      const exists = existingTopics.find(t => 
        t.chapter_id === chapterId && t.title === topicData.title
      );
      
      if (!exists) {
        try {
          const newTopic = await prisma.topic.create({
            data: {
              chapter_id: chapterId,
              title: topicData.title,
              order_no: topicData.order_no
            }
          });
          createdTopics.push(newTopic);
          console.log(`➕ Created topic: ${newTopic.title} (ID: ${newTopic.id})`);
        } catch (createError) {
          console.error(`❌ Failed to create topic ${topicData.title}: ${createError.message}`);
        }
      } else {
        createdTopics.push(exists);
        console.log(`✅ Using existing topic: ${exists.title} (ID: ${exists.id})`);
      }
    }
    
    // Get all topics again to have the complete list
    const allTopics = await prisma.topic.findMany({
      select: { id: true, title: true },
      orderBy: { id: 'asc' }
    });
    
    console.log(`\n📋 All available topics (${allTopics.length}):`);
    allTopics.forEach(topic => {
      console.log(`  Topic ${topic.id}: ${topic.title}`);
    });
    
    // Now update vector file IDs
    console.log('\n🔄 UPDATING VECTOR FILE IDS');
    console.log('==========================');
    
    // Map topics to file IDs based on title
    const fileMappings = [];
    for (let i = 0; i < allTopics.length && i < 6; i++) {
      const topic = allTopics[i];
      const fileId = `file-chapter-${i + 1}`;
      fileMappings.push({ topicId: topic.id, fileId });
      console.log(`📋 Mapping: Topic ${topic.id} (${topic.title}) -> ${fileId}`);
    }
    
    let createdPages = 0;
    let updatedPages = 0;
    
    for (const mapping of fileMappings) {
      const { topicId, fileId } = mapping;
      
      console.log(`\n🔍 Processing topic ${topicId} with file ID: ${fileId}`);
      
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
      select: { 
        id: true, 
        topic_id: true, 
        vector_file_id: true,
        created_at: true 
      },
      orderBy: { topic_id: 'asc' }
    });
    
    console.log(`\n📊 FINAL EducationalPage state: ${finalCount} records`);
    console.log('📄 Records:');
    console.log('ID  | TOPIC_ID | VECTOR_FILE_ID   | CREATED_AT');
    console.log('----|----------|------------------|----------------------');
    
    finalPages.forEach(page => {
      const fileId = page.vector_file_id || 'NULL';
      const created = page.created_at.toISOString().slice(0, 19).replace('T', ' ');
      console.log(`${page.id.toString().padEnd(3)} | ${page.topic_id.toString().padEnd(8)} | ${fileId.padEnd(16)} | ${created}`);
    });
    
    const withFileIds = finalPages.filter(p => p.vector_file_id).length;
    console.log(`\n✅ SUCCESS: ${withFileIds}/${finalCount} records have vector_file_id values!`);
    
    if (withFileIds === finalCount && finalCount > 0) {
      console.log('🎉 ALL RECORDS HAVE VECTOR FILE IDS STORED!');
      console.log('You should now see the values in your database interface!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await prisma.$disconnect();
}

finalFixVectorIds();
