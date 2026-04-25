import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.error('CRITICAL: RESEND_API_KEY is not defined in environment variables!');
    }
    this.resend = new Resend(apiKey);
  }

  async sendWelcomeEmail(email: string, name: string, token: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Thai Tien Shop <no-reply@thaitienshop.id.vn>',
        to: [email],
        subject: 'Xác thực tài khoản Thai Tien Shop của bạn',
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; color: #000000; border: 1px solid #f0f0f0;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;">THAI TIEN<span style="color: #666;"> SHOP</span></h1>
            </div>
            
            <h2 style="font-size: 32px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; text-transform: uppercase; letter-spacing: -1px;">Xác thực tài khoản</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 32px;">
              Chào ${name},<br>
              Bạn vừa đăng ký tài khoản tại Thai Tien Shop. Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất quy trình:
            </p>
            
            <div style="background-color: #f9f9f9; padding: 40px; text-align: center; margin-bottom: 32px; border-radius: 4px;">
              <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #000000; font-family: monospace;">${token}</span>
            </div>
            
            <p style="font-size: 13px; line-height: 1.6; color: #999; margin-bottom: 40px; text-align: center;">
              Mã xác thực này sẽ hết hạn sau 10 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
            </p>
            
            <div style="border-top: 1px solid #eeeeee; padding-top: 24px; text-align: center;">
              <p style="font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 Thai Tien Shop. All Rights Reserved.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        this.logger.error('LỖI TỪ RESEND API (Welcome):', JSON.stringify(error, null, 2));
        throw error;
      }

      this.logger.log(`Email xác thực đã được Resend chấp nhận. ID: ${data?.id}`);
    } catch (err) {
      this.logger.error('Lỗi hệ thống khi gửi mail:', JSON.stringify(err, null, 2));
      throw err;
    }
  }

  async sendResetPasswordEmail(email: string, name: string, token: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Thai Tien Shop <no-reply@thaitienshop.id.vn>',
        to: [email],
        subject: 'Yêu cầu khôi phục mật khẩu - Thai Tien Shop',
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; color: #000000; border: 1px solid #f0f0f0;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;">THAI TIEN<span style="color: #666;"> SHOP</span></h1>
            </div>
            
            <h2 style="font-size: 32px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; text-transform: uppercase; letter-spacing: -1px;">Khôi phục mật khẩu</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 32px;">
              Chào ${name},<br>
              Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản Thai Tien Shop. Vui lòng sử dụng mã xác thực 6 số bên dưới:
            </p>
            
            <div style="background-color: #000000; color: #ffffff; padding: 40px; text-align: center; margin-bottom: 32px; border-radius: 4px;">
              <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; font-family: monospace;">${token}</span>
            </div>
            
            <p style="font-size: 13px; line-height: 1.6; color: #999; margin-bottom: 40px; text-align: center;">
              Mã này có hiệu lực trong vòng 10 phút. Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này để giữ an toàn cho tài khoản.
            </p>
            
            <div style="border-top: 1px solid #eeeeee; padding-top: 24px; text-align: center;">
              <p style="font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 Thai Tien Shop. All Rights Reserved.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        this.logger.error('LỖI TỪ RESEND API (Reset):', JSON.stringify(error, null, 2));
        throw error;
      }

      this.logger.log(`Email khôi phục đã được Resend chấp nhận. ID: ${data?.id}`);
    } catch (err) {
      this.logger.error('Lỗi khi gửi email khôi phục:', JSON.stringify(err, null, 2));
      throw err;
    }
  }
}
