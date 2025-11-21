import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const users = [
  {
    email: 'superadmin@test.com',
    password: 'demo1234',
    name: 'Super Admin',
    role: 'SUPER_ADMIN' as const,
  },
  {
    email: 'owner@test.com',
    password: 'demo1234',
    name: 'Owner',
    role: 'OWNER' as const,
  },
  {
    email: 'manager@test.com',
    password: 'demo1234',
    name: 'Manager',
    role: 'MANAGER' as const,
  },
  {
    email: 'tenant@test.com',
    password: 'demo1234',
    name: 'Tenant',
    role: 'TENANT' as const,
  },
];

async function seedUsers() {
  console.log('🌱 Seeding demo users...\n');

  try {
    for (const userData of users) {
      console.log(`Processing ${userData.email}...`);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`  ⚠️  User exists, deleting...`);
        
        // Delete related records first (due to foreign key constraints)
        await prisma.account.deleteMany({
          where: { userId: existingUser.id },
        });
        
        await prisma.session.deleteMany({
          where: { userId: existingUser.id },
        });
        
        // Delete the user
        await prisma.user.delete({
          where: { email: userData.email },
        });
        
        console.log(`  ✅ Old user deleted`);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
        },
      });

      console.log(`  ✅ Created: ${newUser.name} (${newUser.role})`);
      console.log('');
    }

    console.log('🎉 All demo users created successfully!\n');
    console.log('📋 Login credentials:');
    console.log('━'.repeat(50));
    users.forEach((user) => {
      console.log(`${user.role.padEnd(15)} | ${user.email.padEnd(25)} | demo1234`);
    });
    console.log('━'.repeat(50));
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
