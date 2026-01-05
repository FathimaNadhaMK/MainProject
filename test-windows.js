const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing database on Windows...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        clerkUserId: 'win_test_' + Date.now(),
        email: `test${Date.now()}@windows.com`,
        name: 'Windows Test User',
        educationLevel: 'Graduate',
        targetRole: 'SDE'
      }
    });
    console.log(`✅ Created user: ${user.name}`);
    
    // Create assessment with title
    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id,
        title: 'Windows Test Assessment',
        type: 'coding',
        totalQuestions: 10
      }
    });
    console.log(`✅ Created assessment with title: ${assessment.title}`);
    
    // Query it back
    const found = await prisma.assessment.findFirst({
      where: { title: 'Windows Test Assessment' }
    });
    console.log(`✅ Found assessment: ${found?.title}`);
    
    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\n📊 Tables in database:');
    tables.forEach((t, i) => {
      console.log(`   ${i+1}. ${t.table_name}`);
    });
    
    // Clean up
    await prisma.assessment.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('\n🧹 Cleaned up test data');
    
    console.log('\n🎉 Windows setup successful!');
    console.log('👉 Now run: npx prisma studio');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Try:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check DATABASE_URL in .env file');
    console.log('   3. Run: npx prisma db push --force-reset');
  } finally {
    await prisma.$disconnect();
  }
}

main();