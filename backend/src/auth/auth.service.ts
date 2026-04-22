import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { USER_MESSAGES } from '../constants/messages';
import { MailService } from '../mail/mail.service';
import { GoogleAuthService } from './google-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private mailService: MailService,
    private googleAuthService: GoogleAuthService,
  ) { }

  // 1. Đăng ký tài khoản
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
      emailVerificationToken: verificationToken,
    });

    this.mailService.sendWelcomeEmail(user.email, user.name || 'Thành viên mới', verificationToken);

    const { password: _, emailVerificationToken: __, ...result } = user;
    return result;
  }

  // 2. Xác thực Email & Tự động đăng nhập
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Mã xác thực không hợp lệ hoặc đã hết hạn!');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    const tokens = await this.getTokens(updatedUser.id, updatedUser.email, updatedUser.role);
    await this.updateRefreshToken(updatedUser.id, tokens.refreshToken);

    return {
      message: 'Xác thực email thành công!',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
      ...tokens,
    };
  }

  // 3. Gửi lại mã xác thực
  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại!');
    }

    if (user.isEmailVerified) {
      throw new ConflictException('Tài khoản này đã được xác thực rồi!');
    }

    const newToken = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: newToken },
    });

    await this.mailService.sendWelcomeEmail(user.email, user.name || 'Thành viên mới', newToken);

    return { message: 'Mã xác thực mới đã được gửi thành công!' };
  }

  // 4. Đăng nhập & Cấp Token
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    if (user.password) {
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException(USER_MESSAGES.WRONG_PASSWORD);
      }
    } else {
      throw new UnauthorizedException('Tài khoản này được đăng ký qua mạng xã hội. Hãy sử dụng Đăng nhập Google!');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException({
        message: USER_MESSAGES.EMAIL_NOT_VERIFIED,
        email: user.email,
        statusCode: 401
      });
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  // 4b. Đăng nhập với Google (Manual Handshake)
  async loginWithGoogle(code: string) {
    const googleUser = await this.googleAuthService.getUserData(code);

    let user: any = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.googleId },
          { email: googleUser.email }
        ]
      }
    });

    if (!user) {
      try {
        user = await this.prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.googleId,
            isEmailVerified: true,
            role: 'CUSTOMER'
          }
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          user = await this.prisma.user.findFirst({
            where: { email: googleUser.email }
          });
        } else {
          throw error;
        }
      }
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.googleId, isEmailVerified: true }
      });
    }

    // Chốt chặn cuối cùng cho TypeScript
    if (!user) {
      throw new UnauthorizedException('Không thể xác thực thông tin người dùng!');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens
    };
  }

  // 5. Làm mới Token
  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException('Access Denied');

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { userId, expiresAt: { gt: new Date() } }
    });

    if (!storedToken) throw new UnauthorizedException('Session expired');

    const isMatched = await bcrypt.compare(refreshToken, storedToken.token);
    if (!isMatched) throw new UnauthorizedException('Invalid Token');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // 5b. Lấy URL đăng nhập Google
  getGoogleLoginUrl() {
    return this.googleAuthService.getAuthUrl();
  }

  // 6. Đăng xuất
  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { message: 'Logged out successfully' };
  }

  // 7. Lấy thông tin cá nhân
  async getMe(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    const { password: _, ...result } = user;
    return result;
  }

  // --- Helpers ---
  async getTokens(userId: string, email: string, role: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
        } as any,
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
        } as any,
      ),
    ]);

    return { accessToken: at, refreshToken: rt };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
