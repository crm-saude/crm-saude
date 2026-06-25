import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const { PrismaClient } = require('@prisma/client');

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const clinic = await prisma.clinic.create({
    data: { name: 'Admin', plan: 'CLINIC' },
  });

  const hashed = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@crmsaude.com',
      password: hashed,
      role: 'ADMIN',
      clinicId: clinic.id,
    },
  });

  console.log('Admin criado com sucesso!');
  await prisma.$disconnect();
}

main();
