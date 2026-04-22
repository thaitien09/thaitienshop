// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  // Các hàm CRUD chuẩn hóa
  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
