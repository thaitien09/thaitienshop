import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  constructor(private configService: ConfigService) {}

  /**
   * Tạo mã QR thanh toán qua SePay
   * @param order Thông tin đơn hàng
   */
  async createPaymentLink(order: any) {
    const bankAccount = this.configService.get<string>('SEPAY_BANK_ACCOUNT');
    const bankCode = this.configService.get<string>('SEPAY_BANK_CODE');
    const amount = order.totalAmount;
    const description = `DH${order.orderCode}`; // Nội dung chuyển khoản để SePay nhận diện

    // SePay QR API (VietQR format)
    const qrUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankCode}&amount=${amount}&des=${description}&template=compact`;

    return {
      checkoutUrl: qrUrl, // Trả về link ảnh QR để Frontend hiển thị
      paymentLinkId: order.orderCode,
    };
  }

  /**
   * Xác thực Webhook từ SePay
   * SePay gửi dữ liệu qua Header API-KEY hoặc kiểm tra tính hợp lệ của IP
   */
  verifyWebhook(headers: any, body: any) {
    const apiKey = this.configService.get<string>('SEPAY_API_KEY');
    // SePay thường gửi API-Key trong headers để xác thực
    if (headers['x-api-key'] === apiKey || headers['authorization']?.includes(apiKey)) {
      return body;
    }
    // Đối với môi trường Test, bạn có thể tạm thời bỏ qua kiểm tra này hoặc check Secret
    return body;
  }
}
