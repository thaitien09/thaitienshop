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
import { PaymentModule } from './payment/payment.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,
      limit: 10000, // Tăng mạnh lên 10.000 để test thoải mái
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
    PaymentModule,
    DashboardModule
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule { }
