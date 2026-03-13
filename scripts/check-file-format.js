// Script to check the format of files in the vector store
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function checkFileFormat() {
  try {
    const vectorStoreId = 'vs_69b2658c2a508191bc198fae37e84dd9';
    
    // List all files in the vector store
    const files = await openai.vectorStores.files.list(vectorStoreId);
    
    console.log(`📁 Found ${files.data.length} files in vector store:`);
    
    files.data.forEach((file, index) => {
      console.log(`  ${index + 1}. ID: ${file.id}`);
      console.log(`     Filename: ${file.filename || 'No filename'}`);
      console.log(`     Purpose: ${file.purpose}`);
      console.log(`     Status: ${file.status}`);
      console.log(`     Created: ${file.created_at}`);
      console.log('---');
    });
    
    // Check file details for the first few files
    for (let i = 0; i < Math.min(3, files.data.length); i++) {
      const file = files.data[i];
      console.log(`\n🔍 Details for file ${i + 1}:`);
      console.log(`   File ID: ${file.id}`);
      
      try {
        // Try to retrieve the file content info
        const fileDetails = await openai.files.retrieve(file.id);
        console.log(`   Filename: ${fileDetails.filename}`);
        console.log(`   Bytes: ${fileDetails.bytes}`);
        console.log(`   Purpose: ${fileDetails.purpose}`);
      } catch (error) {
        console.log(`   Error retrieving details: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking file format:', error);
  }
}

checkFileFormat();
