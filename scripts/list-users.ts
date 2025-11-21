import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testAuth() {
  console.log('🔐 Testing authentication flow...\n');
  
  try {
    // List all users
    console.log('Fetching all users from database...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true, // We'll check if it exists (not show it)
      },
    });

    console.log(`\n✅ Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Has password: ${user.password ? '✅ Yes' : '❌ No (OAuth only)'}`);
      console.log('');
    });

    if (users.length === 0) {
      console.log('⚠️  No users found in database!');
      console.log('   You need to create a user first.');
    }

  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
