import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('Test 1: Attempting to connect to database...');
    await prisma.$connect();
    console.log('✅ Successfully connected to database\n');

    // Test 2: Execute a simple query
    console.log('Test 2: Executing a simple query...');
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('✅ Query executed successfully');
    console.log('Database info:', result);
    console.log('');

    // Test 3: Check if tables exist
    console.log('Test 3: Checking if tables exist...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('✅ Tables found:', tables);
    console.log('');

    // Test 4: Count users (if table exists)
    try {
      console.log('Test 4: Counting users...');
      const userCount = await prisma.user.count();
      console.log(`✅ Found ${userCount} users in database\n`);
    } catch (error) {
      console.log('⚠️  User table might not exist yet (need to run migrations)\n');
    }

    console.log('🎉 All connection tests passed!');
    
  } catch (error) {
    console.error('❌ Connection test failed!\n');
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      // Provide helpful hints based on error type
      if (error.message.includes('Tenant or user not found')) {
        console.error('\n💡 Hint: The database user or password is incorrect.');
        console.error('   Check your DATABASE_URL in .env.local');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Hint: Cannot reach the database server.');
        console.error('   Check if the host and port are correct.');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.error('\n💡 Hint: The database does not exist.');
        console.error('   You may need to create it first.');
      } else if (error.message.includes('password authentication failed')) {
        console.error('\n💡 Hint: Password is incorrect.');
        console.error('   Verify your DATABASE_URL credentials.');
      }
    }
    
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
