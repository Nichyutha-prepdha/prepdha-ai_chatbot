const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');

async function fixWithRealFileIds() {
  const prisma = new PrismaClient();
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  try {
    console.log('🔧 FIXING WITH REAL OPENAI FILE IDS');
    console.log('===================================');
    
    // Get all files from OpenAI
    const files = await openai.files.list();
    
    // Map chapter files to their real IDs
    const chapterFileMap = new Map();
    
    files.data.forEach(file => {
      if (file.filename.includes('chapter')) {
        // Extract chapter number from filename
        const match = file.filename.match(/chapter-(\d+)/);
        if (match) {
          const chapterNum = match[1];
          if (!chapterFileMap.has(chapterNum)) {
            chapterFileMap.set(chapterNum, []);
          }
          chapterFileMap.get(chapterNum).push({
            id: file.id,
            filename: file.filename,
            created: new Date(file.created_at * 1000)
          });
        }
      }
    });
    
    console.log('\n📋 Found chapter files:');
    chapterFileMap.forEach((files, chapter) => {
      console.log(`Chapter ${chapter}: ${files.length} files`);
      files.forEach(file => {
        console.log(`  - ${file.id}: ${file.filename}`);
      });
    });
    
    // Get vector store files to see which ones are actually in the vector store
    const vectorStoreId = "vs_69b2658c2a508191bc198fae37e84dd9";
    const vectorStoreFiles = await openai.vectorStores.files.list(vectorStoreId);
    
    const vectorStoreFileIds = new Set(vectorStoreFiles.data.map(f => f.id));
    
    console.log('\n🔍 Checking which chapter files are in vector store:');
    const chapterVectorFileMap = new Map();
    
    chapterFileMap.forEach((files, chapter) => {
      const vectorFiles = files.filter(f => vectorStoreFileIds.has(f.id));
      if (vectorFiles.length > 0) {
        chapterVectorFileMap.set(chapter, vectorFiles);
        console.log(`Chapter ${chapter}: ${vectorFiles.length} files in vector store`);
        vectorFiles.forEach(file => {
          console.log(`  ✅ ${file.id}: ${file.filename}`);
        });
      } else {
        console.log(`Chapter ${chapter}: No files in vector store`);
      }
    });
    
    // Get existing topics
    const topics = await prisma.topic.findMany({
      select: { id: true, title: true },
      orderBy: { id: 'asc' }
    });
    
    console.log('\n📋 Existing topics:');
    topics.forEach(topic => {
      console.log(`Topic ${topic.id}: ${topic.title}`);
    });
    
    // Update EducationalPage with real file IDs
    console.log('\n🔄 UPDATING EducationalPage WITH REAL FILE IDS');
    console.log('================================================');
    
    let updated = 0;
    
    for (const topic of topics) {
      // Extract chapter number from topic title
      const match = topic.title.match(/(\d+)/);
      if (!match) {
        console.log(`⏭️ Skipping topic ${topic.id}: ${topic.title} (no chapter number)`);
        continue;
      }
      
      const chapterNum = match[1];
      const vectorFiles = chapterVectorFileMap.get(chapterNum);
      
      if (!vectorFiles || vectorFiles.length === 0) {
        console.log(`⚠️ No vector store files found for chapter ${chapterNum} (Topic ${topic.id})`);
        continue;
      }
      
      // Use the most recent file for this chapter
      const latestFile = vectorFiles.reduce((latest, current) => 
        current.created > latest.created ? current : latest
      );
      
      console.log(`🔧 Topic ${topic.id} (${topic.title}): Using file ${latestFile.id}`);
      
      // Check if EducationalPage exists
      const existingPage = await prisma.educationalPage.findFirst({
        where: { topic_id: topic.id }
      });
      
      if (existingPage) {
        // Update with real file ID
        await prisma.educationalPage.update({
          where: { id: existingPage.id },
          data: { vector_file_id: latestFile.id }
        });
        console.log(`✅ Updated EducationalPage ${existingPage.id} with real file ID: ${latestFile.id}`);
        updated++;
      } else {
        // Create new record
        const newPage = await prisma.educationalPage.create({
          data: {
            topic_id: topic.id,
            vector_file_id: latestFile.id,
            is_published: false
          }
        });
        console.log(`➕ Created EducationalPage ${newPage.id} with real file ID: ${latestFile.id}`);
        updated++;
      }
    }
    
    console.log(`\n🎉 UPDATE COMPLETE! Updated ${updated} records with real file IDs`);
    
    // Final verification
    const finalPages = await prisma.educationalPage.findMany({
      select: { 
        id: true, 
        topic_id: true, 
        vector_file_id: true,
        created_at: true 
      },
      orderBy: { topic_id: 'asc' }
    });
    
    console.log('\n📊 FINAL EducationalPage state:');
    console.log('ID  | TOPIC_ID | VECTOR_FILE_ID               | CREATED_AT');
    console.log('----|----------|-----------------------------|----------------------');
    
    finalPages.forEach(page => {
      const fileId = page.vector_file_id || 'NULL';
      const created = page.created_at.toISOString().slice(0, 19).replace('T', ' ');
      console.log(`${page.id.toString().padEnd(3)} | ${page.topic_id.toString().padEnd(8)} | ${fileId.padEnd(27)} | ${created}`);
    });
    
    // Verify these file IDs actually exist in OpenAI
    console.log('\n🔍 VERIFYING FILE IDs EXIST IN OPENAI:');
    let verifiedCount = 0;
    
    for (const page of finalPages) {
      if (!page.vector_file_id) continue;
      
      const exists = files.data.find(f => f.id === page.vector_file_id);
      if (exists) {
        console.log(`✅ Topic ${page.topic_id}: ${page.vector_file_id} (${exists.filename})`);
        verifiedCount++;
      } else {
        console.log(`❌ Topic ${page.topic_id}: ${page.vector_file_id} (NOT FOUND)`);
      }
    }
    
    console.log(`\n📊 VERIFICATION: ${verifiedCount}/${finalPages.length} file IDs are real OpenAI files!`);
    
    if (verifiedCount === finalPages.length) {
      console.log('🎉 SUCCESS: All file IDs are now real OpenAI files!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await prisma.$disconnect();
}

fixWithRealFileIds();
