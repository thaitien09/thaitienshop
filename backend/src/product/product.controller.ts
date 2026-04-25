import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ProductService } from './product.service';
// ... rest of imports stay same ...

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly uploadService: UploadService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  private async clearCache() {
    // Xóa cache danh sách sản phẩm khi có thay đổi
    await this.cacheManager.del('products-list');
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  // ... ApiBody stays same ...
  @ApiOperation({ summary: 'Tạo sản phẩm mới và Ảnh (Admin)' })
  @ResponseMessage('Tạo sản phẩm thành công!')
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      createProductDto.image = await this.uploadService.uploadFile(file);
    }
    const result = await this.productService.create(createProductDto);
    await this.clearCache();
    return result;
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Lấy danh sách tất cả sản phẩm' })
  async findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo ID' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật thông tin sản phẩm (Admin)' })
  @ResponseMessage('Cập nhật sản phẩm thành công!')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      updateProductDto.image = await this.uploadService.uploadFile(file);
    }
    const result = await this.productService.update(id, updateProductDto);
    await this.clearCache();
    return result;
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa sản phẩm (Admin)' })
  @ResponseMessage('Xóa sản phẩm thành công!')
  async remove(@Param('id') id: string) {
    const result = await this.productService.remove(id);
    await this.clearCache();
    return result;
  }
}
