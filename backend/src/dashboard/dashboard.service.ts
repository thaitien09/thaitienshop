import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // Lấy khoảng thời gian từ preset hoặc custom
  private getDateRange(period: string, from?: string, to?: string): { gte?: Date; lte?: Date } {
    const now = new Date();

    if (period === 'today') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { gte: start };
    }
    if (period === '7days') {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { gte: start };
    }
    if (period === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { gte: start };
    }
    if (period === 'thisYear') {
      const start = new Date(now.getFullYear(), 0, 1);
      return { gte: start };
    }
    if (period === 'custom' && from && to) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };
    }
    // Mặc định: toàn thời gian (all-time)
    return {};
  }

  async getStats(period: string = 'all', from?: string, to?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateFilter = this.getDateRange(period, from, to);

    // Điều kiện lọc đơn hàng thành công theo khoảng thời gian
    const successfulOrderWhere = {
      status: { in: ['DELIVERED', 'PAID'] },
      ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
    };

    const [
      totalRevenue,
      orderCount,
      productCount,
      customerCount,
      recentOrders,
      lowStockProducts,
      pendingOrdersCount,
      newUsersToday
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: successfulOrderWhere,
        _sum: { totalAmount: true }
      }),
      this.prisma.order.count({
        where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
      }),
      this.prisma.product.count(),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      this.prisma.product.count({ where: { currentStock: { lt: 5 } } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count({
        where: { role: 'CUSTOMER', createdAt: { gte: today } }
      })
    ]);

    // Tính lợi nhuận theo khoảng thời gian đã chọn
    const successfulOrders = await this.prisma.order.findMany({
      where: successfulOrderWhere,
      include: { items: true }
    });

    let totalCost = 0;
    successfulOrders.forEach(order => {
      order.items.forEach(item => {
        totalCost += (item.costPrice || 0) * (item.quantity || 0);
      });
    });

    const revenue = Number(totalRevenue._sum.totalAmount || 0);
    const profit = revenue - totalCost;

    return {
      period,
      totalRevenue: revenue,
      totalCost: totalCost || 0,
      totalProfit: profit || 0,
      profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
      orderCount: orderCount || 0,
      productCount: productCount || 0,
      customerCount: customerCount || 0,
      recentOrders: (recentOrders || []).map(order => ({
        id: order.orderCode,
        customer: order.customerName || order.user?.name || 'Khách vãng lai',
        amount: order.totalAmount || 0,
        status: this.mapStatus(order.status),
        createdAt: order.createdAt
      })),
      alerts: {
        lowStock: lowStockProducts,
        pendingOrders: pendingOrdersCount,
        newUsersToday: newUsersToday
      }
    };
  }

  private mapStatus(status: string) {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ xử lý',
      'PAID': 'Đã thanh toán',
      'DELIVERED': 'Đã giao',
      'CANCELLED': 'Đã hủy',
      'SHIPPING': 'Đang giao'
    };
    return statusMap[status] || status;
  }
}
