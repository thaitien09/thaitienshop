// d:\node js\sneaker\backend\src\product\product.service.ts

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PRODUCT_MESSAGES, BRAND_MESSAGES } from '../constants/messages';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    const productData = createProductDto;

    // 1. Kiểm tra xem Slug đã tồn tại chưa
    const isExist = await this.prisma.product.findUnique({
      where: { slug: productData.slug }
    });
    if (isExist) throw new ConflictException(PRODUCT_MESSAGES.ALREADY_EXISTS);

    // 2. Kiểm tra xem hãng (Brand) có tồn tại không
    const brand = await this.prisma.brand.findUnique({
      where: { id: productData.brandId }
    });
    if (!brand) throw new NotFoundException(BRAND_MESSAGES.NOT_FOUND);

    // 3. Tạo sản phẩm trực tiếp với mã SKU tự động
    const sku = `WAX-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    return await this.prisma.product.create({
      data: {
        ...productData,
        sku
      },
      include: {
        brand: true
      }
    });
  }

  async findAll(
    page: number = 1, 
    limit: number = 9, 
    search?: string, 
    brandId?: string,
    minPrice?: number,
    maxPrice?: number,
    stockStatus?: string
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    if (search) {
      where.name = { contains: search };
    }
    if (brandId && brandId !== 'all' && brandId !== 'Tất cả') {
      where.brandId = brandId;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = Number(minPrice);
      if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
    }
    if (stockStatus === 'instock') {
      where.currentStock = { gt: 0 };
    } else if (stockStatus === 'outstock') {
      where.currentStock = { lte: 0 };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          brand: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        lastPage: Math.ceil(total / limit),
        limit: Number(limit)
      }
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true
      }
    });
    if (!product) throw new NotFoundException(PRODUCT_MESSAGES.NOT_FOUND);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Kiểm tra tồn tại

    // Lọc bỏ các field undefined để không vô tình ghi đè dữ liệu cũ bằng null
    const cleanData = Object.fromEntries(
      Object.entries(updateProductDto).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );

    return await this.prisma.product.update({
      where: { id },
      data: cleanData,
      include: { brand: true }
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Kiểm tra tồn tại

    return await this.prisma.product.delete({
      where: { id }
    });
  }
}
