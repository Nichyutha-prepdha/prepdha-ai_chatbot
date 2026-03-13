const { PrismaClient } = require('@prisma/client');

async function createTopicsWithChapters() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 CREATING MISSING TOPICS WITH CHAPTERS');
    console.log('=======================================');
    
    // First, check existing data
    const existingBooks = await prisma.book.findMany({
      select: { id: true, title: true },
      take: 5
    });
    
    const existingChapters = await prisma.chapter.findMany({
      select: { id: true, book_id: true, title: true },
      take: 10
    });
    
    const existingTopics = await prisma.topic.findMany({
      select: { id: true, chapter_id: true, title: true },
      orderBy: { id: 'asc' }
    });
    
    console.log('\n📋 Existing data:');
    console.log(`Books: ${existingBooks.length}`);
    console.log(`Chapters: ${existingChapters.length}`);
    console.log(`Topics: ${existingTopics.length}`);
    
    // Create a book if none exists
    let bookId;
    if (existingBooks.length === 0) {
      console.log('\n➕ Creating default book...');
      const newBook = await prisma.book.create({
        data: {
          class_subject_id: 1, // Assuming this exists
          title: 'Default Educational Book'
        }
      });
      bookId = newBook.id;
      console.log(`✅ Created book ID: ${bookId}`);
    } else {
      bookId = existingBooks[0].id;
      console.log(`✅ Using existing book ID: ${bookId}`);
    }
    
    // Create chapters if needed
    const requiredChapters = [
      { book_id: bookId, title: 'Chapter 1', order_no: 1 },
      { book_id: bookId, title: 'Chapter 2', order_no: 2 },
      { book_id: bookId, title: 'Chapter 3', order_no: 3 },
      { book_id: bookId, title: 'Chapter 4', order_no: 4 },
      { book_id: bookId, title: 'Chapter 5', order_no: 5 },
      { book_id: bookId, title: 'Chapter 6', order_no: 6 }
    ];
    
    const createdChapters = [];
    for (const chapterData of requiredChapters) {
      const exists = existingChapters.find(c => 
        c.book_id === chapterData.book_id && c.order_no === chapterData.order_no
      );
      
      if (!exists) {
        const newChapter = await prisma.chapter.create({
          data: chapterData
        });
        createdChapters.push(newChapter);
        console.log(`➕ Created chapter: ${newChapter.title} (ID: ${newChapter.id})`);
      } else {
        createdChapters.push(exists);
        console.log(`✅ Using existing chapter: ${exists.title} (ID: ${exists.id})`);
      }
    }
    
    // Create topics for each chapter
    const requiredTopics = [
      { chapter_id: createdChapters[0].id, title: 'Test Chapter 1', order_no: 1 },
      { chapter_id: createdChapters[1].id, title: 'Test Chapter 2', order_no: 1 },
      { chapter_id: createdChapters[2].id, title: 'Test Chapter 3', order_no: 1 },
      { chapter_id: createdChapters[3].id, title: 'Test Chapter 4', order_no: 1 },
      { chapter_id: createdChapters[4].id, title: 'Test Chapter 5', order_no: 1 },
      { chapter_id: createdChapters[5].id, title: 'Test Chapter 6', order_no: 1 }
    ];
    
    const createdTopics = [];
    let topicIdCounter = 1;
    
    for (const topicData of requiredTopics) {
      const exists = existingTopics.find(t => 
        t.chapter_id === topicData.chapter_id && t.title === topicData.title
      );
      
      if (!exists) {
        try {
          const newTopic = await prisma.topic.create({
            data: {
              id: topicIdCounter,
              chapter_id: topicData.chapter_id,
              title: topicData.title,
              order_no: topicData.order_no
            }
          });
          createdTopics.push(newTopic);
          console.log(`➕ Created topic: ${newTopic.title} (ID: ${newTopic.id})`);
          topicIdCounter++;
        } catch (createError) {
          console.error(`❌ Failed to create topic ${topicData.title}: ${createError.message}`);
          // Try with auto-generated ID
          const newTopic = await prisma.topic.create({
            data: {
              chapter_id: topicData.chapter_id,
              title: topicData.title,
              order_no: topicData.order_no
            }
          });
          createdTopics.push(newTopic);
          console.log(`➕ Created topic with auto ID: ${newTopic.title} (ID: ${newTopic.id})`);
        }
      } else {
        createdTopics.push(exists);
        console.log(`✅ Using existing topic: ${exists.title} (ID: ${exists.id})`);
      }
    }
    
    console.log(`\n🎉 Topics creation complete: ${createdTopics.length} topics ready`);
    
    // Now update all vector file IDs
    console.log('\n🔄 UPDATING ALL VECTOR FILE IDS');
    console.log('==============================');
    
    const fileMappings = [
      { topicId: createdTopics[0]?.id, fileId: 'file-chapter-1' },
      { topicId: createdTopics[1]?.id, fileId: 'file-chapter-2' },
      { topicId: createdTopics[2]?.id, fileId: 'file-chapter-3' },
      { topicId: createdTopics[3]?.id, fileId: 'file-chapter-4' },
      { topicId: createdTopics[4]?.id, fileId: 'file-chapter-5' },
      { topicId: createdTopics[5]?.id, fileId: 'file-chapter-6' }
    ];
    
    let createdPages = 0;
    let updatedPages = 0;
    
    for (const mapping of fileMappings) {
      if (!mapping.topicId) {
        console.warn(`⚠️ No topic available for file: ${mapping.fileId}. Skipping.`);
        continue;
      }
      
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

createTopicsWithChapters();
