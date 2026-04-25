import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../decorators/roles.decorator';
import { ResponseMessage } from '../decorators/response-message.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Inventory (Quản lý kho)')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('receipts')
  @ResponseMessage('Nhập kho thành công!')
  @ApiOperation({ summary: 'Tạo phiếu nhập kho (Admin)' })
  create(@GetUser('id') userId: string, @Body() createReceiptDto: CreateReceiptDto) {
    return this.inventoryService.createReceipt(userId, createReceiptDto);
  }

  @Get('receipts')
  @ApiOperation({ summary: 'Lấy danh sách phiếu nhập kho (Admin)' })
  findAll() {
    return this.inventoryService.findAllReceipts();
  }

  @Get('receipts/:id')
  @ApiOperation({ summary: 'Xem chi tiết phiếu nhập kho (Admin)' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOneReceipt(id);
  }

  @Patch('receipts/:id')
  @ResponseMessage('Cập nhật phiếu nhập kho thành công!')
  @ApiOperation({ summary: 'Sửa giá nhập kho của một đợt (Admin)' })
  update(
    @Param('id') id: string,
    @Body() body: { note?: string; items: { id: string; costPrice: number }[] }
  ) {
    return this.inventoryService.updateReceipt(id, body);
  }
}
