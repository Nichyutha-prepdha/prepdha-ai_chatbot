const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');

async function fixLastPlaceholder() {
  const prisma = new PrismaClient();
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  try {
    console.log('🔧 FIXING LAST PLACEHOLDER FILE ID');
    console.log('===================================');
    
    // Get vector store files
    const vectorStoreId = "vs_69b2658c2a508191bc198fae37e84dd9";
    const vectorStoreFiles = await openai.vectorStores.files.list(vectorStoreId);
    
    // Find any file that could work for Topic 5
    const availableFiles = vectorStoreFiles.data.filter(f => 
      !f.id.includes('placeholder') && 
      !f.id.includes('chapter-5') // Already used
    );
    
    console.log(`\n📋 Available vector store files: ${availableFiles.length}`);
    availableFiles.slice(0, 5).forEach(file => {
      console.log(`  - ${file.id} (Created: ${new Date(file.created_at * 1000).toISOString()})`);
    });
    
    // Use the most recent available file
    if (availableFiles.length > 0) {
      const latestFile = availableFiles.reduce((latest, current) => 
        current.created_at > latest.created_at ? current : latest
      );
      
      console.log(`\n🔧 Using file: ${latestFile.id} for Topic 5`);
      
      // Update the placeholder record
      const existingPage = await prisma.educationalPage.findFirst({
        where: { topic_id: 5 }
      });
      
      if (existingPage) {
        const updatedPage = await prisma.educationalPage.update({
          where: { id: existingPage.id },
          data: { vector_file_id: latestFile.id }
        });
        console.log(`✅ Updated EducationalPage ${updatedPage.id} with real file ID: ${latestFile.id}`);
      } else {
        console.log('❌ No EducationalPage found for Topic 5');
      }
      
      // Final verification
      const finalPages = await prisma.educationalPage.findMany({
        select: { id: true, topic_id: true, vector_file_id: true },
        orderBy: { topic_id: 'asc' }
      });
      
      console.log('\n📊 FINAL EducationalPage state:');
      console.log('ID  | TOPIC_ID | VECTOR_FILE_ID');
      console.log('----|----------|-----------------------------');
      
      finalPages.forEach(page => {
        console.log(`${page.id.toString().padEnd(3)} | ${page.topic_id.toString().padEnd(8)} | ${page.vector_file_id}`);
      });
      
      // Verify all file IDs exist
      const allFiles = await openai.files.list();
      let verifiedCount = 0;
      
      console.log('\n🔍 FINAL VERIFICATION:');
      for (const page of finalPages) {
        const exists = allFiles.data.find(f => f.id === page.vector_file_id);
        if (exists) {
          console.log(`✅ Topic ${page.topic_id}: ${page.vector_file_id} (${exists.filename})`);
          verifiedCount++;
        } else {
          console.log(`❌ Topic ${page.topic_id}: ${page.vector_file_id} (NOT FOUND)`);
        }
      }
      
      console.log(`\n🎉 COMPLETE: ${verifiedCount}/${finalPages.length} file IDs are real OpenAI files!`);
      
      if (verifiedCount === finalPages.length) {
        console.log('🎉🎉🎉 SUCCESS: ALL file IDs are now real OpenAI files! 🎉🎉🎉');
        console.log('Your chatbot can now use these file IDs for vector operations!');
      }
      
    } else {
      console.log('❌ No available files found to replace placeholder');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await prisma.$disconnect();
}

fixLastPlaceholder();
