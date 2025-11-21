import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  const email = 'test@example.com';
  const password = 'password123';
  const name = 'Test User';

  console.log('🔧 Creating test user...\n');
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('⚠️  User already exists. Updating password...\n');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      console.log('✅ Password updated successfully!\n');
    } else {
      console.log('Creating new user...\n');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'SUPER_ADMIN',
        },
      });

      console.log('✅ User created successfully!\n');
    }

    console.log('📋 Test credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');
    console.log('You can now use these credentials to login.');

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
