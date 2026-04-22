import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor(private configService: ConfigService) {
    this.client = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_CALLBACK_URL'),
    );
  }

  // Senior: Hàm trích xuất thông tin người dùng từ mã code nhận được từ Frontend
  async getUserData(code: string) {
    try {
      const { tokens } = await this.client.getToken(code);
      this.client.setCredentials(tokens);

      if (!tokens.id_token) {
        throw new UnauthorizedException('Google không cung cấp ID Token!');
      }

      // Xác thực ID Token
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Không thể lấy thông tin từ Google!');
      }

      return {
        email: payload.email as string,
        name: payload.name as string,
        googleId: payload.sub,
        picture: payload.picture,
      };
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw new UnauthorizedException('Xác thực với Google thất bại!');
    }
  }

  getAuthUrl() {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['email', 'profile'],
      prompt: 'select_account'
    });
  }
}
