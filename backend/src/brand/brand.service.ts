// d:\node js\sneaker\backend\src\brand\brand.service.ts

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BRAND_MESSAGES } from '../constants/messages';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) { }

  // 1. Tạo mới (Bạn đã làm phần này rất tốt)
  async create(createBrandDto: CreateBrandDto) {
    const { name, slug } = createBrandDto;

    const isExist = await this.prisma.brand.findFirst({
      where: {
        OR: [{ name }, { slug }]
      }
    });

    if (isExist) {
      throw new ConflictException(BRAND_MESSAGES.ALREADY_EXISTS);
    }

    return await this.prisma.brand.create({
      data: { name, slug }
    });
  }

  // 2. Lấy tất cả
  async findAll() {
    return await this.prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  // 3. Lấy chi tiết 1 cái
  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!brand) {
      throw new NotFoundException(BRAND_MESSAGES.NOT_FOUND);
    }

    return brand;
  }

  // 4. Cập nhật
  async update(id: string, updateBrandDto: UpdateBrandDto) {
    // Kiểm tra xem có tồn tại không trước khi sửa
    await this.findOne(id);

    // Kiểm tra xem tên mới có bị trùng với thương hiệu khác không
    if (updateBrandDto.name || updateBrandDto.slug) {
      const isExist = await this.prisma.brand.findFirst({
        where: {
          OR: [
            { name: updateBrandDto.name },
            { slug: updateBrandDto.slug }
          ],
          NOT: { id: id } // Loại trừ chính nó ra
        }
      });
      if (isExist) throw new ConflictException(BRAND_MESSAGES.ALREADY_EXISTS);
    }

    return await this.prisma.brand.update({
      where: { id },
      data: updateBrandDto
    });
  }

  // 5. Xóa
  async remove(id: string) {
    // Kiểm tra xem có tồn tại không trước khi xóa
    await this.findOne(id);

    return await this.prisma.brand.delete({
      where: { id }
    });
  }
}
