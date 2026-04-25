import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Inject } from '@nestjs/common';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BrandService } from './brand.service';
// ... rest of imports stay same ...

@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  private async clearCache() {
    await this.cacheManager.del('brands-list');
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo thương hiệu mới (Chỉ dành cho Admin)' })
  @ResponseMessage(BRAND_MESSAGES.CREATE_SUCCESS)
  async create(@Body() createBrandDto: CreateBrandDto) {
    const result = await this.brandService.create(createBrandDto);
    await this.clearCache();
    return result;
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Lấy danh sách tất cả thương hiệu' })
  async findAll() {
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
  async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    const result = await this.brandService.update(id, updateBrandDto);
    await this.clearCache();
    return result;
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa một thương hiệu (Chỉ dành cho Admin)' })
  @ResponseMessage(BRAND_MESSAGES.DELETE_SUCCESS)
  async remove(@Param('id') id: string) {
    const result = await this.brandService.remove(id);
    await this.clearCache();
    return result;
  }
}
