// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { BrandModule } from './brand/brand.module';
import { InventoryModule } from './inventory/inventory.module';
import { UploadModule } from './upload/upload.module';
import { OrderModule } from './order/order.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          url: 'redis://redis:6379',
          ttl: 3600 * 1000, // Cache trong 1 tiếng mặc định
        }),
      }),
    }),
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,
      limit: 2000, // Giới hạn an toàn 2.000 yêu cầu/phút
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    MailModule,
    ProductModule,
    BrandModule,
    InventoryModule,
    UploadModule,
    OrderModule,
    DashboardModule
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
