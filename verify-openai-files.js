const { OpenAI } = require('openai');

async function verifyOpenAIFiles() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  try {
    console.log('🔍 VERIFYING OPENAI FILES');
    console.log('========================');
    
    // List all files
    const files = await openai.files.list();
    console.log(`\n📊 Total files in OpenAI: ${files.data.length}`);
    
    // Show all files
    console.log('\n📄 All OpenAI files:');
    files.data.forEach((file, index) => {
      console.log(`${index + 1}. ID: ${file.id}, Filename: ${file.filename}, Purpose: ${file.purpose}, Created: ${new Date(file.created_at * 1000).toISOString()}`);
    });
    
    // Check for our specific file IDs
    const ourFileIds = [
      'file-chapter-1',
      'file-chapter-2', 
      'file-chapter-3',
      'file-chapter-4',
      'file-chapter-5'
    ];
    
    console.log('\n🔍 Checking our stored file IDs:');
    ourFileIds.forEach(storedId => {
      const found = files.data.find(file => file.id === storedId);
      if (found) {
        console.log(`✅ ${storedId}: FOUND (${found.filename})`);
      } else {
        console.log(`❌ ${storedId}: NOT FOUND`);
      }
    });
    
    // Also check vector store files
    const vectorStoreId = "vs_69b2658c2a508191bc198fae37e84dd9";
    console.log(`\n🔍 Checking vector store: ${vectorStoreId}`);
    
    try {
      const vectorStoreFiles = await openai.vectorStores.files.list(vectorStoreId);
      console.log(`📊 Files in vector store: ${vectorStoreFiles.data.length}`);
      
      console.log('\n📄 Vector store files:');
      vectorStoreFiles.data.forEach((file, index) => {
        console.log(`${index + 1}. ID: ${file.id}, Created: ${new Date(file.created_at * 1000).toISOString()}`);
      });
      
      console.log('\n🔍 Checking if our file IDs are in vector store:');
      ourFileIds.forEach(storedId => {
        const found = vectorStoreFiles.data.find(file => file.id === storedId);
        if (found) {
          console.log(`✅ ${storedId}: IN VECTOR STORE`);
        } else {
          console.log(`❌ ${storedId}: NOT IN VECTOR STORE`);
        }
      });
      
    } catch (vectorError) {
      console.error(`❌ Error checking vector store: ${vectorError.message}`);
    }
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`- Database has: ${ourFileIds.length} file IDs stored`);
    console.log(`- OpenAI has: ${files.data.length} total files`);
    
    const matchingFiles = ourFileIds.filter(storedId => 
      files.data.find(file => file.id === storedId)
    );
    console.log(`- Matching files: ${matchingFiles.length}/${ourFileIds.length}`);
    
    if (matchingFiles.length === 0) {
      console.log('\n❌ ISSUE: None of the stored file IDs exist in OpenAI!');
      console.log('The file IDs in your database are placeholder names, not actual OpenAI file IDs.');
      console.log('You need to update them with real OpenAI file IDs.');
    } else if (matchingFiles.length < ourFileIds.length) {
      console.log(`\n⚠️ PARTIAL MATCH: Only ${matchingFiles.length}/${ourFileIds.length} file IDs are real.`);
    } else {
      console.log('\n✅ PERFECT: All stored file IDs exist in OpenAI!');
    }
    
  } catch (error) {
    console.error('❌ Error verifying files:', error.message);
  }
}

verifyOpenAIFiles();
