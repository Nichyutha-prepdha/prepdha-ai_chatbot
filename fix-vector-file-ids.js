const { PrismaClient } = require('@prisma/client');

async function fixVectorFileIds() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 FIXING VECTOR FILE IDs');
    console.log('========================');
    
    // Get all records from Page table
    const pageRecords = await prisma.page.findMany({
      select: { 
        id: true, 
        chapterId: true, 
        vector_file_id: true 
      }
    });
    
    console.log(`\n📄 Found ${pageRecords.length} records in Page table`);
    
    // File mappings (from your OpenAI vector store)
    const fileMappings = {
      'chapter-1': 'file-chapter-1',
      'chapter-2': 'file-chapter-2', 
      'chapter-3': 'file-chapter-3',
      'chapter-4': 'file-chapter-4',
      'chapter-5': 'file-chapter-5'
    };
    
    let created = 0;
    let updated = 0;
    
    for (const pageRecord of pageRecords) {
      const { chapterId, vector_file_id } = pageRecord;
      
      console.log(`\n🔍 Processing: ${chapterId}`);
      
      // Extract topic ID from chapterId (e.g., "chapter-1" -> 1)
      const topicId = parseInt(chapterId.split('-')[1]);
      
      if (isNaN(topicId)) {
        console.error(`❌ Cannot extract topic ID from: ${chapterId}`);
        continue;
      }
      
      // Get the corresponding file ID
      const fileId = fileMappings[chapterId];
      
      if (!fileId) {
        console.error(`❌ No file mapping found for: ${chapterId}`);
        continue;
      }
      
      console.log(`📋 Topic ID: ${topicId}, File ID: ${fileId}`);
      
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
      const existingEduPage = await prisma.educationalPage.findFirst({
        where: { topic_id: topicId }
      });
      
      if (existingEduPage) {
        if (existingEduPage.vector_file_id === fileId) {
          console.log(`⏭️ Already has correct file ID. Skipping.`);
        } else {
          // Update existing record
          await prisma.educationalPage.update({
            where: { id: existingEduPage.id },
            data: { vector_file_id: fileId }
          });
          console.log(`🔄 Updated existing record with file ID: ${fileId}`);
          updated++;
        }
      } else {
        // Create new record in EducationalPage
        const newEduPage = await prisma.educationalPage.create({
          data: {
            topic_id: topicId,
            vector_file_id: fileId,
            is_published: false
          }
        });
        console.log(`➕ Created new EducationalPage record ID: ${newEduPage.id}`);
        created++;
      }
      
      // Also update the original Page table for consistency
      if (vector_file_id !== fileId) {
        await prisma.page.update({
          where: { id: pageRecord.id },
          data: { vector_file_id: fileId }
        });
        console.log(`🔄 Updated Page table record with file ID: ${fileId}`);
      }
    }
    
    console.log(`\n🎉 FIX COMPLETE!`);
    console.log(`📊 Results: ${created} created, ${updated} updated`);
    
    // Verify final state
    const finalEduCount = await prisma.educationalPage.count();
    const finalEduPages = await prisma.educationalPage.findMany({
      select: { id: true, topic_id: true, vector_file_id: true },
      orderBy: { topic_id: 'asc' }
    });
    
    console.log(`\n📊 Final EducationalPage state: ${finalEduCount} records`);
    console.log('📄 Records:');
    finalEduPages.forEach(page => {
      console.log(`  ✅ Topic ${page.topic_id}: vector_file_id = '${page.vector_file_id}'`);
    });
    
    // Also check Page table
    const finalPageCount = await prisma.page.count();
    const finalPages = await prisma.page.findMany({
      select: { id: true, chapterId: true, vector_file_id: true },
      orderBy: { chapterId: 'asc' }
    });
    
    console.log(`\n📊 Final Page table state: ${finalPageCount} records`);
    console.log('📄 Records:');
    finalPages.forEach(page => {
      console.log(`  ✅ ${page.chapterId}: vector_file_id = '${page.vector_file_id}'`);
    });
    
  } catch (error) {
    console.error('❌ Error during fix:', error.message);
  }
  
  await prisma.$disconnect();
}

fixVectorFileIds();
