// d:\node js\sneaker\backend\src\brand\brand.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BRAND_MESSAGES } from 'src/constants/messages';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorators/response-message.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles, Role } from 'src/decorators/roles.decorator';

@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo thương hiệu mới (Chỉ dành cho Admin)' })
  @ResponseMessage(BRAND_MESSAGES.CREATE_SUCCESS)
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả thương hiệu' })
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một thương hiệu theo ID' })
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin thương hiệu (Chỉ dành cho Admin)' })
  @ResponseMessage(BRAND_MESSAGES.UPDATE_SUCCESS)
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa một thương hiệu (Chỉ dành cho Admin)' })
  @ResponseMessage(BRAND_MESSAGES.DELETE_SUCCESS)
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}
