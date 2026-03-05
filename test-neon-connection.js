const { chapterPrisma } = require('./lib/chapter-prisma');

async function testNeonConnection() {
  try {
    console.log('Testing Neon database connection...');
    
    // Test basic connection
    await chapterPrisma.$connect();
    console.log('✅ Successfully connected to Neon database');
    
    // Test a simple query to see what tables are available
    const result = await chapterPrisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('📋 Available tables:', result);
    
    // Test if we can query Chapter table
    try {
      const chapters = await chapterPrisma.$queryRaw`SELECT COUNT(*) as count FROM "Chapter" LIMIT 1`;
      console.log('📚 Chapter table records:', chapters);
    } catch (error) {
      console.log('⚠️ Chapter table not found or accessible:', error.message);
    }
    
    await chapterPrisma.$disconnect();
    console.log('✅ Connection test completed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testNeonConnection();
