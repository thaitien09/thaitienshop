// src/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { USER_MESSAGES } from '../constants/messages';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  // Senior: Hàm create thuần túy, không chứa logic nghiệp vụ (Auth)
  async create(data: any) {
    return this.prisma.user.create({ data });
  }

  // Senior: Hàm tìm kiếm theo Email tách riêng để phục vụ nhiều mục đích
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Chuẩn Senior: Lấy tất cả User (Bỏ qua password để bảo mật)
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        isEmailVerified: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, currentUserId: string) {
    // 1. Không cho phép tự xóa chính mình
    if (id === currentUserId) {
      throw new BadRequestException('Bạn không thể tự xóa tài khoản của chính mình!');
    }

    const userToDelete = await this.prisma.user.findUnique({ where: { id } });
    if (!userToDelete) throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);

    // 2. Nếu xóa Admin, kiểm tra xem có phải Admin cuối cùng không
    if (userToDelete.role === 'ADMIN') {
      const adminCount = await this.prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw new BadRequestException('Không thể xóa Quản trị viên duy nhất của hệ thống!');
      }
    }

    return this.prisma.user.delete({ where: { id } });
  }
}
