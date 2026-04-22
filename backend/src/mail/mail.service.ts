import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async sendWelcomeEmail(email: string, name: string, token: string) {
    try {
      // In ra Console để test (Chỉ dùng trong môi trường Development)
      console.log(`[MailService] Email chào mừng đã được gửi tới ${email}`);
      console.log(`\x1b[36m%s\x1b[0m`, `[MailService] [DEVELOPMENT] Mã xác thực: ${token}`);

      await this.resend.emails.send({
        from: 'Sneaker Elite <onboarding@resend.dev>',
        to: email,
        subject: 'Xác thực tài khoản Sneaker Elite của bạn',
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; color: #000000; border: 1px solid #f0f0f0;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;">SNEAKER<span style="color: #666;">ELITE</span></h1>
            </div>
            
            <h2 style="font-size: 32px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; text-transform: uppercase; letter-spacing: -1px;">Xác thực tài khoản</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 32px;">
              Chào ${name},<br>
              Bạn vừa đăng ký tài khoản tại Sneaker Elite. Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất quy trình:
            </p>
            
            <div style="background-color: #f9f9f9; padding: 40px; text-align: center; margin-bottom: 32px; border-radius: 4px;">
              <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #000000; font-family: monospace;">${token}</span>
            </div>
            
            <p style="font-size: 13px; line-height: 1.6; color: #999; margin-bottom: 40px; text-align: center;">
              Mã xác thực này sẽ hết hạn sau 10 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
            </p>
            
            <div style="border-top: 1px solid #eeeeee; padding-top: 24px; text-align: center;">
              <p style="font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 Sneaker Elite. All Rights Reserved.</p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error('Lỗi khi gọi API Resend:', err);
    }
  }
}
