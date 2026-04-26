import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Khôi phục adapter vì Prisma Client bản này bắt buộc phải có driver adapter
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
    super({ adapter, log: ['info', 'warn', 'error'] });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma connected to MySQL successfully');
    } catch (error) {
      console.error('❌ Prisma connection error:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma disconnected from MySQL');
  }
}
