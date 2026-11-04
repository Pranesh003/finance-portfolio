import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting development database seeding...');

  // Hash demo password
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create or upsert demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo.user@antigravity-finance.local' },
    update: {},
    create: {
      email: 'demo.user@antigravity-finance.local',
      passwordHash,
      role: 'USER',
      isActive: true,
      isEmailVerified: true,
      kycStatus: 'VERIFIED',
      profile: {
        create: {
          firstName: 'Alex',
          lastName: 'Morgan',
          phoneNumber: '+1-555-0199',
          country: 'United States',
          city: 'San Francisco'
        }
      },
      preferences: {
        create: {
          defaultCurrency: 'USD',
          locale: 'en-US',
          theme: 'system',
          enableBiometrics: true,
          enablePushNotifications: true,
          enableEmailAlerts: true,
          enableTwoFactor: false
        }
      }
    }
  });

  console.log(`✅ Demo user seeded: ${user.email} (ID: ${user.id})`);

  // 2. Default Transaction Categories
  const categories = [
    { name: 'Income / Salary', slug: 'salary', icon: 'banknotes', color: '#10B981' },
    { name: 'Groceries & Food', slug: 'groceries', icon: 'shopping-cart', color: '#F59E0B' },
    { name: 'Housing & Rent', slug: 'housing', icon: 'home', color: '#3B82F6' },
    { name: 'Utilities & Bills', slug: 'utilities', icon: 'bolt', color: '#8B5CF6' },
    { name: 'Investments & Savings', slug: 'investments', icon: 'chart-bar', color: '#06B6D4' }
  ];

  for (const cat of categories) {
    await prisma.transactionCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
        isCustom: false
      }
    });
  }

  console.log(`✅ ${categories.length} transaction categories seeded.`);
  console.log('🚀 Seed data complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

