import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  // Hàm sinh mã đơn hàng đẹp: TT + Ngày + 4 ký tự ngẫu nhiên
  private generateOrderCode(): string {
    const date = new Date();
    const datePart = date.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TT${datePart}-${randomPart}`;
  }

  async create(createOrderDto: CreateOrderDto, userId?: string) {
    const { items, ...orderData } = createOrderDto;

    // 1. Kiểm tra tồn kho trước khi tạo đơn
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException(`Sản phẩm với ID ${item.productId} không tồn tại`);
      }

      if (product.currentStock < item.quantity) {
        throw new BadRequestException(`Sản phẩm ${product.name} không đủ hàng trong kho (Còn: ${product.currentStock})`);
      }
    }

    // 2. Tính tổng tiền
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderCode = this.generateOrderCode();

    // 3. Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
    return this.prisma.$transaction(async (tx) => {
      // Tạo danh sách items kèm giá vốn hiện tại
      const orderItems: any[] = [];
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          costPrice: product?.costPrice || 0, // Lưu giá vốn tại thời điểm mua
        });
      }

      // Tạo đơn hàng
      const order = await tx.order.create({
        data: {
          orderCode,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: orderData.customerEmail,
          province: orderData.province,
          district: orderData.district,
          ward: orderData.ward,
          addressDetail: orderData.addressDetail,
          note: orderData.note,
          paymentMethod: orderData.paymentMethod || 'COD',
          totalAmount,
          ...(userId ? { user: { connect: { id: userId } } } : {}),
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Trừ tồn kho
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await this.cacheManager.clear();
      return order;
    });
  }

  async findAll(page: number = 1, limit: number = 9, userId?: string) {
    const skip = (Number(page) - 1) * Number(limit);
    const where = userId ? { userId } : {};

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          items: {
            include: {
              product: {
                include: { brand: true }
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({ where })
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
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = ['PENDING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'PAID'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Trạng thái đơn hàng không hợp lệ');
    }

    const result = await this.prisma.order.update({
      where: { id },
      data: { status },
    });
    
    // Nếu trạng thái đổi sang CANCELLED, ta cần xóa cache vì tồn kho sẽ được trả lại (thường làm trong cancelOrder nhưng tốt hơn là clear ở đây cho chắc)
    await this.cacheManager.clear();
    return result;
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng để hủy');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên đơn hàng này');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              increment: item.quantity,
            },
          },
        });
      }

      await this.cacheManager.clear();
      return updatedOrder;
    });
  }
}
