const { PrismaClient } = require('@prisma/client');

async function forceRefreshDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 FORCING DATABASE REFRESH CHECK');
    console.log('==============================');
    
    // Get the absolute latest data using raw SQL
    const pages = await prisma.$queryRaw`
      SELECT id, topic_id, vector_file_id, created_at, updated_at 
      FROM public."EducationalPage" 
      ORDER BY updated_at DESC
    `;
    
    console.log(`\n📊 Latest EducationalPage data (${pages.length} records):`);
    console.log('ID  | TOPIC_ID | VECTOR_FILE_ID               | UPDATED_AT');
    console.log('----|----------|-----------------------------|----------------------');
    
    pages.forEach(page => {
      const fileId = page.vector_file_id || 'NULL';
      const updated = page.updated_at ? page.updated_at.toISOString().slice(0, 19).replace('T', ' ') : 'NULL';
      console.log(`${page.id.toString().padEnd(3)} | ${page.topic_id.toString().padEnd(8)} | ${fileId.padEnd(27)} | ${updated}`);
    });
    
    // Check if any records have placeholder values
    const placeholders = pages.filter(p => p.vector_file_id && p.vector_file_id.startsWith('file-chapter-'));
    
    if (placeholders.length > 0) {
      console.log(`\n⚠️ Found ${placeholders.length} records with placeholder file IDs:`);
      placeholders.forEach(page => {
        console.log(`  Topic ${page.topic_id}: ${page.vector_file_id}`);
      });
      
      console.log('\n🔧 Force updating placeholders with real file IDs...');
      
      // Real file IDs from OpenAI
      const realFileIds = [
        { topicId: 1, fileId: 'file-GLzzQT35WZgPbM1g3Mcr2u' },
        { topicId: 2, fileId: 'file-EtL45e1wy7b6Pbw7V4GUYW' },
        { topicId: 3, fileId: 'file-2bGM7o1P2d7JHVefVLHoMC' },
        { topicId: 4, fileId: 'file-73n5a7o6LfYJzgubhdUGzH' },
        { topicId: 5, fileId: 'file-GLzzQT35WZgPbM1g3Mcr2u' }
      ];
      
      for (const mapping of realFileIds) {
        const page = placeholders.find(p => p.topic_id === mapping.topicId);
        if (page) {
          await prisma.educationalPage.update({
            where: { id: page.id },
            data: { vector_file_id: mapping.fileId }
          });
          console.log(`✅ Updated Topic ${mapping.topicId}: ${page.vector_file_id} → ${mapping.fileId}`);
        }
      }
      
      console.log('\n🔄 Refreshing data after updates...');
      
      // Get fresh data
      const freshPages = await prisma.$queryRaw`
        SELECT id, topic_id, vector_file_id, updated_at 
        FROM public."EducationalPage" 
        ORDER BY topic_id ASC
      `;
      
      console.log('\n📊 Fresh EducationalPage data:');
      console.log('ID  | TOPIC_ID | VECTOR_FILE_ID               | UPDATED_AT');
      console.log('----|----------|-----------------------------|----------------------');
      
      freshPages.forEach(page => {
        const fileId = page.vector_file_id || 'NULL';
        const updated = page.updated_at ? page.updated_at.toISOString().slice(0, 19).replace('T', ' ') : 'NULL';
        console.log(`${page.id.toString().padEnd(3)} | ${page.topic_id.toString().padEnd(8)} | ${fileId.padEnd(27)} | ${updated}`);
      });
      
    } else {
      console.log('\n✅ No placeholder file IDs found - all records have real file IDs!');
    }
    
    // Final verification with raw SQL
    console.log('\n🔍 FINAL VERIFICATION WITH RAW SQL:');
    const finalCheck = await prisma.$queryRaw`
      SELECT id, topic_id, vector_file_id, 
             CASE WHEN vector_file_id LIKE 'file-chapter-%' THEN 'PLACEHOLDER' 
                  WHEN vector_file_id IS NULL THEN 'NULL' 
                  ELSE 'REAL' END as status
      FROM public."EducationalPage" 
      ORDER BY topic_id ASC
    `;
    
    console.log('\n📊 Final status check:');
    console.log('ID  | TOPIC_ID | VECTOR_FILE_ID               | STATUS');
    console.log('----|----------|-----------------------------|--------');
    
    finalCheck.forEach(page => {
      const fileId = page.vector_file_id || 'NULL';
      const status = page.status;
      console.log(`${page.id.toString().padEnd(3)} | ${page.topic_id.toString().padEnd(8)} | ${fileId.padEnd(27)} | ${status}`);
    });
    
    const realCount = finalCheck.filter(p => p.status === 'REAL').length;
    console.log(`\n🎉 SUMMARY: ${realCount}/${finalCheck.length} records have REAL file IDs`);
    
    if (realCount === finalCheck.length) {
      console.log('🎉🎉🎉 ALL RECORDS HAVE REAL FILE IDS! 🎉🎉🎉');
      console.log('Your database interface should now show the updated values!');
      console.log('Try refreshing your database view or re-running the query.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await prisma.$disconnect();
}

forceRefreshDatabase();
