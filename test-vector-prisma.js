const { vectorPrisma } = require('./lib/vector-prisma.ts');

async function testVectorPrisma() {
  try {
    console.log('Testing vector-prisma client...');
    
    // Test basic connection
    try {
      const result = await vectorPrisma.$queryRaw`SELECT current_database()`;
      console.log('✅ Connected to database:', result);
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    
    // Check available models
    console.log('Available models:', Object.keys(vectorPrisma).filter(k => k.includes('page')));
    
    // Test eduPage model
    try {
      const eduPageCount = await vectorPrisma.eduPage.count();
      console.log('✅ EduPage model accessible. Current count:', eduPageCount);
    } catch (error) {
      console.error('❌ EduPage model failed:', error.message);
    }
    
    await vectorPrisma.$disconnect();
  } catch (error) {
    console.error('Vector Prisma client initialization failed:', error);
  }
}

testVectorPrisma();
