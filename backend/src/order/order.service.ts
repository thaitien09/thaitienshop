import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService
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

    return this.prisma.$transaction(async (tx) => {
      const orderCode = this.generateOrderCode();
      let totalAmount = 0;
      const orderItemsData = [];

      // Xử lý từng item trong một vòng lặp duy nhất
      for (const item of items) {
        // 1. Lấy thông tin sản phẩm và KHÓA dòng này để tránh tranh chấp (Lock)
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, price: true, currentStock: true, costPrice: true }
        });

        if (!product) {
          throw new BadRequestException(`Sản phẩm ID ${item.productId} không tồn tại`);
        }

        // 2. Kiểm tra tồn kho ngay lập tức
        if (product.currentStock < item.quantity) {
          throw new BadRequestException(`Sản phẩm ${product.name} không đủ hàng (Còn: ${product.currentStock})`);
        }

        // 3. Trừ tồn kho luôn
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        // 4. Chuẩn bị dữ liệu item đơn hàng
        totalAmount += item.price * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          costPrice: product.costPrice || 0,
        });
      }

      // 5. Tạo đơn hàng và chi tiết đơn hàng
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
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });
  }

  async findAll(userId?: string) {
    return this.prisma.order.findMany({
      where: userId ? { userId } : {},
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
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

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new BadRequestException('Không tìm thấy đơn hàng');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền hủy đơn hàng này');
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

      return updatedOrder;
    });
  }
}
