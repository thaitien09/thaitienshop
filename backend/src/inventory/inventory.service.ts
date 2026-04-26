import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async createReceipt(userId: string, createReceiptDto: CreateReceiptDto) {
    const { note, items } = createReceiptDto;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Tạo bản ghi Phiếu nhập trước
      const receipt = await tx.inventoryReceipt.create({
        data: {
          userId,
          note,
          totalCost: 0,
        },
      });

      let totalCost = 0;

      // 2. Xử lý từng món hàng
      for (const item of items) {
        const quantity = Number(item.quantity);
        const costPrice = Number(item.costPrice);

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Không tìm thấy sản phẩm ID: ${item.productId}`);
        }

        // Tạo chi tiết phiếu
        await tx.inventoryReceiptItem.create({
          data: {
            receiptId: receipt.id,
            productId: item.productId,
            quantity: quantity,
            costPrice: costPrice,
          },
        });

        // Tính toán giá vốn trung bình mới (Weighted Average Cost)
        const oldStock = product.currentStock || 0;
        const oldCostPrice = product.costPrice || 0;
        const newQuantity = quantity;
        const newCostPrice = costPrice;

        // Công thức: (Giá trị cũ + Giá trị mới) / (Tổng số lượng mới)
        const totalValue = (oldStock * oldCostPrice) + (newQuantity * newCostPrice);
        const totalQuantity = oldStock + newQuantity;
        const averageCostPrice = totalQuantity > 0 ? Math.round(totalValue / totalQuantity) : newCostPrice;

        // Cập nhật tồn kho và giá vốn trung bình vào sản phẩm
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { increment: quantity },
            costPrice: averageCostPrice,
          },
        });

        totalCost += quantity * costPrice;
      }

      // 3. Cập nhật tổng tiền cuối cùng cho phiếu
      const result = await tx.inventoryReceipt.update({
        where: { id: receipt.id },
        data: { totalCost },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: { select: { id: true, name: true, email: true } }
        },
      });
      await this.cacheManager.clear();
      return result;
    });
  }

  async findAllReceipts() {
    return await this.prisma.inventoryReceipt.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneReceipt(id: string) {
    const receipt = await this.prisma.inventoryReceipt.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!receipt) throw new NotFoundException('Không tìm thấy phiếu nhập kho');
    return receipt;
  }

  async updateReceipt(
    id: string,
    body: { note?: string; items: { id: string; costPrice: number }[] }
  ) {
    const receipt = await this.prisma.inventoryReceipt.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!receipt) throw new NotFoundException('Không tìm thấy phiếu nhập kho');

    return await this.prisma.$transaction(async (tx) => {
      let totalCost = 0;

      for (const updatedItem of body.items) {
        const receiptItem = receipt.items.find(i => i.id === updatedItem.id);
        if (!receiptItem) continue;

        const newCostPrice = Number(updatedItem.costPrice);

        // Cập nhật giá vốn trong chi tiết phiếu
        await tx.inventoryReceiptItem.update({
          where: { id: updatedItem.id },
          data: { costPrice: newCostPrice },
        });

        // Tính lại giá vốn trung bình cho sản phẩm dựa trên TẤT CẢ phiếu nhập
        const allOtherItems = await tx.inventoryReceiptItem.findMany({
          where: { productId: receiptItem.productId, id: { not: updatedItem.id } },
        });

        const totalQty = allOtherItems.reduce((s, i) => s + i.quantity, 0) + receiptItem.quantity;
        const totalVal = allOtherItems.reduce((s, i) => s + i.quantity * i.costPrice, 0) + receiptItem.quantity * newCostPrice;
        const avgCost = totalQty > 0 ? Math.round(totalVal / totalQty) : newCostPrice;

        // Cập nhật giá vốn trung bình lên bảng Product
        await tx.product.update({
          where: { id: receiptItem.productId },
          data: { costPrice: avgCost },
        });

        totalCost += receiptItem.quantity * newCostPrice;
      }

      // Cập nhật ghi chú và tổng tiền vốn phiếu
      const result = await tx.inventoryReceipt.update({
        where: { id },
        data: {
          ...(body.note !== undefined ? { note: body.note } : {}),
          totalCost,
        },
        include: {
          items: { include: { product: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });
      await this.cacheManager.clear();
      return result;
    });
  }
}
