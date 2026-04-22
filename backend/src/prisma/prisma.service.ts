import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Prisma 7 Adapter cho MariaDB hỗ trợ nạp thẳng URL từ .env
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
    super({ adapter, log: ['info', 'warn', 'error'] });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      // Test kết nối thực tế bằng một câu lệnh đơn giản
      await this.$queryRaw`SELECT 1`;
      console.log('✅ Prisma connected to MySQL successfully');
    } catch (error) {
      console.error('❌ Prisma connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma disconnected from MySQL');
  }
}
