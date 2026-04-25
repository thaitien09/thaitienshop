import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { AuthModule } from 'src/auth/auth.module'; // Thêm dòng này
import { PrismaModule } from 'src/prisma/prisma.module'; // Thêm dòng này

@Module({
  controllers: [BrandController],
  providers: [BrandService],
  imports: [AuthModule, PrismaModule],
})
export class BrandModule { }
