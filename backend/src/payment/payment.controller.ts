import { Controller, Post, Body, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Giữ lại controller trống để không lỗi module, gỡ bỏ logic webhook SePay
  @Post('webhook')
  handleWebhook(@Body() body: any) {
    return { status: 'success' };
  }
}
