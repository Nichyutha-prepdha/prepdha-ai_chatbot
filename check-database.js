const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 REAL-TIME DATABASE CHECK');
    console.log('============================');
    
    // Test connection with exact database name
    const dbResult = await prisma.$queryRaw`SELECT current_database(), current_schema(), version()`;
    console.log(`✅ Database: ${dbResult[0].current_database}`);
    console.log(`✅ Schema: ${dbResult[0].current_schema}`);
    
    // Check EducationalPage table exists
    const tableCheck = await prisma.$queryRaw`SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'EducationalPage'
    ) as table_exists`;
    console.log(`\n📋 EducationalPage table exists: ${tableCheck[0].table_exists}`);
    
    if (tableCheck[0].table_exists) {
      // Get exact count
      const count = await prisma.educationalPage.count();
      console.log(`\n📊 Total records: ${count}`);
      
      if (count === 0) {
        console.log('❌ NO RECORDS FOUND!');
        console.log('\n🔍 Checking if records exist in different table...');
        
        // Check Page table (old table)
        const pageCount = await prisma.page.count();
        console.log(`📄 Page table records: ${pageCount}`);
        
        if (pageCount > 0) {
          const pages = await prisma.page.findMany({
            select: { id: true, chapterId: true, vector_file_id: true },
            take: 5
          });
          console.log('Page table contents:');
          pages.forEach(page => {
            console.log(`  Page ${page.id}: chapterId=${page.chapterId}, vector_file_id='${page.vector_file_id || 'NULL'}'`);
          });
        }
        
        // Try to create a test record to ensure table works
        console.log('\n🧪 Creating test record...');
        try {
          const testRecord = await prisma.educationalPage.create({
            data: {
              topic_id: 1,
              vector_file_id: 'test-file-id',
              is_published: false
            }
          });
          console.log(`✅ Test record created: ID ${testRecord.id}`);
          
          // Immediately check if it exists
          const verifyRecord = await prisma.educationalPage.findFirst({
            where: { id: testRecord.id }
          });
          
          if (verifyRecord) {
            console.log(`✅ Test record verified: vector_file_id='${verifyRecord.vector_file_id}'`);
            console.log('✅ Table is working correctly!');
            
            // Clean up
            await prisma.educationalPage.delete({ where: { id: testRecord.id } });
            console.log('🧹 Test record cleaned up');
          } else {
            console.log('❌ Test record not found immediately after creation!');
          }
          
        } catch (createError) {
          console.error('❌ Failed to create test record:', createError.message);
        }
        
      } else {
        // Show all records
        const pages = await prisma.educationalPage.findMany({
          select: { 
            id: true, 
            topic_id: true, 
            vector_file_id: true,
            content_text: true,
            is_published: true,
            created_at: true,
            updated_at: true
          },
          orderBy: { topic_id: 'asc' }
        });
        
        console.log('\n📄 ALL EDUCATIONALPAGE RECORDS:');
        console.log('ID | TOPIC_ID | VECTOR_FILE_ID | CONTENT_LENGTH | PUBLISHED | CREATED_AT');
        console.log('---|----------|---------------|----------------|-----------|----------------');
        
        pages.forEach(page => {
          const fileId = page.vector_file_id || 'NULL';
          const contentLen = page.content_text ? page.content_text.length : 0;
          const created = page.created_at.toISOString().slice(0, 19).replace('T', ' ');
          console.log(`${page.id}  | ${page.topic_id}       | ${fileId.padEnd(13)} | ${contentLen.toString().padEnd(14)} | ${page.is_published}        | ${created}`);
        });
        
        // Check for NULL vector_file_id
        const nullCount = pages.filter(p => !p.vector_file_id).length;
        if (nullCount > 0) {
          console.log(`\n⚠️ ${nullCount} records have NULL vector_file_id`);
        }
      }
      
    } else {
      console.log('❌ EducationalPage table does not exist!');
      console.log('You may need to run: npx prisma db push');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
  
  await prisma.$disconnect();
}

checkDatabase();
