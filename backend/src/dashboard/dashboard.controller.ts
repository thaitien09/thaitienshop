import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Báo cáo & Thống kê (Dashboard)')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Lấy thống kê doanh thu, lợi nhuận (Admin)' })
  @ApiQuery({ name: 'period', required: false, enum: ['all', 'today', '7days', 'thisMonth', 'thisYear', 'custom'] })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD' })
  async getStats(
    @Query('period') period: string = 'all',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dashboardService.getStats(period, from, to);
  }
}
