import { Controller, Post, Body, Get, Param, UseGuards, Req, Patch, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../decorators/roles.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const userId = req.user.id;
    return this.orderService.create(createOrderDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 9,
  ) {
    return this.orderService.findAll(page, limit);
  }

  @Get('my-orders')
  @UseGuards(AuthGuard)
  findMyOrders(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 9,
  ) {
    return this.orderService.findAll(page, limit, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.orderService.updateStatus(id, status);
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard)
  cancelOrder(@Param('id') id: string, @Req() req: any) {
    return this.orderService.cancelOrder(id, req.user.id);
  }
}
