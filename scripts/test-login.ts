import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function testLogin(email: string, password: string) {
  console.log(`\n🔐 Testing login for: ${email}\n`);
  
  try {
    console.log('Step 1: Looking up user in database...');
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ User not found!');
      console.log(`   No user exists with email: ${email}`);
      return;
    }

    console.log('✅ User found!');
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log('');

    if (!user.password) {
      console.log('❌ User has no password!');
      console.log('   This user was created via OAuth (Google) and cannot login with password.');
      return;
    }

    console.log('Step 2: Verifying password...');
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('❌ Password incorrect!');
      console.log('   The password you provided does not match.');
      return;
    }

    console.log('✅ Password correct!');
    console.log('');
    console.log('🎉 Login would succeed!');
    console.log('   User would be authenticated successfully.');

  } catch (error) {
    console.error('❌ Error during login test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: npm run db:test-login <email> <password>');
  console.log('');
  console.log('Example:');
  console.log('  npm run db:test-login superadmin@example.com password123');
  console.log('');
  console.log('Available test users:');
  console.log('  - superadmin@example.com');
  console.log('  - owner@test.com');
  console.log('  - manager@example.com');
  console.log('  - tenant@example.com');
  process.exit(1);
}

testLogin(email, password);
