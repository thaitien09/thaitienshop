import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiOperation, ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorators/response-message.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles, Role } from 'src/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from '../upload/upload.service';

const imageUploadOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // Giới hạn 2MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp)!'), false);
    }
  },
};

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly uploadService: UploadService
  ) { }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        currentStock: { type: 'number' },
        brandId: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        }
      },
    },
  })
  @ApiOperation({ summary: 'Tạo sản phẩm mới và Ảnh (Admin)' })
  @ResponseMessage('Tạo sản phẩm thành công!')
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    // Nếu có file, chúng ta gán đường dẫn file vào dto trước khi gửi xuống service
    if (file) {
      createProductDto.image = await this.uploadService.uploadFile(file);
    }
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả sản phẩm' })
  findAll() {
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
    // Nếu có file ảnh mới, upload và cập nhật đường dẫn
    if (file) {
      updateProductDto.image = await this.uploadService.uploadFile(file);
    }
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa sản phẩm (Admin)' })
  @ResponseMessage('Xóa sản phẩm thành công!')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
