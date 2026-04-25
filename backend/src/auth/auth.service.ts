import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
  private readonly logger = new Logger(AuthService.name);

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

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
      }
    });

    try {
      this.logger.log(`MÃ XÁC THỰC CHO ${user.email} LÀ: ${verificationToken}`);
      await this.mailService.sendWelcomeEmail(user.email, user.name || 'Thành viên mới', verificationToken);
    } catch (error) {
      // Rollback nếu gửi mail lỗi
      await this.prisma.user.delete({ where: { id: user.id } });
      throw new BadRequestException('Gửi email xác thực thất bại. Vui lòng thử lại!');
    }

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
      throw new UnauthorizedException(USER_MESSAGES.LOGIN_FAILED);
    }

    // 1. Kiểm tra xem tài khoản có đang bị khóa tạm thời không
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Tài khoản đang bị khóa tạm thời do nhập sai quá nhiều lần. Vui lòng thử lại sau ${remainingMinutes} phút!`);
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!');
    }

    if (user.password) {
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        // 2. Xử lý khi nhập sai mật khẩu
        const newFailedAttempts = user.failedLoginAttempts + 1;
        const updateData: any = { failedLoginAttempts: newFailedAttempts };

        if (newFailedAttempts >= 5) {
          updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Khóa 15 phút
          updateData.failedLoginAttempts = 0; // Reset số lần để sau 15p bắt đầu đếm lại từ đầu
        }

        await this.prisma.user.update({
          where: { id: user.id },
          data: updateData
        });

        const remaining = 5 - newFailedAttempts;
        if (remaining > 0) {
          throw new UnauthorizedException(`Sai mật khẩu! Bạn còn ${remaining} lần thử trước khi tài khoản bị khóa 15 phút.`);
        } else {
          throw new UnauthorizedException(`Tài khoản đã bị khóa 15 phút do nhập sai 5 lần!`);
        }
      }
    }

    // 3. Đăng nhập thành công -> Reset trạng thái lỗi
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockUntil: null }
      });
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

    if (user.isActive === false) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa!');
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
    if (!user || user.isActive === false) throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không tồn tại');

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

  // 7. Quên mật khẩu - Gửi mã xác thực
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Vì lý do bảo mật, chúng ta vẫn báo là đã gửi email ngay cả khi không tìm thấy user
      return { message: 'Nếu email tồn tại trong hệ thống, mã khôi phục sẽ được gửi đến bạn.' };
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expires
      }
    });

    await this.mailService.sendResetPasswordEmail(user.email, user.name || 'Thành viên', resetToken);

    return { message: 'Mã khôi phục đã được gửi đến email của bạn.' };
  }

  // 8. Đặt lại mật khẩu mới
  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Mã khôi phục không hợp lệ hoặc đã hết hạn!');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    return { message: 'Mật khẩu đã được cập nhật thành công!' };
  }

  // 10. Đổi mật khẩu (Khi đang đăng nhập)
  async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Không thể thực hiện đổi mật khẩu cho tài khoản này!');
    }

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác!');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: 'Đổi mật khẩu thành công!' };
  }

  // 11. Lấy thông tin cá nhân
  async getMe(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException(USER_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  // --- Helpers ---
  async getTokens(userId: string, email: string, role: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { id: userId, email, role },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
        } as any,
      ),
      this.jwtService.signAsync(
        { id: userId, email, role },
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
