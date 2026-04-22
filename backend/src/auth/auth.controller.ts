// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseMessage } from '../decorators/response-message.decorator';
import { USER_MESSAGES } from '../constants/messages';
import { AuthGuard } from './guards/auth.guard';

@ApiTags('Xác thực (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('verify-email')
  @ApiOperation({ summary: 'Xác thực email bằng Token (6 chữ số)' })
  @ApiResponse({ status: 200, description: 'Xác thực thành công và trả về JWT Token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // Luồng Google Login (Manual)
  @Get('google-url')
  @ApiOperation({ summary: 'Lấy URL đăng nhập Google (Manual)' })
  async getGoogleUrl() {
    return { url: this.authService.getGoogleLoginUrl() };
  }

  @Post('google-login')
  @ApiOperation({ summary: 'Đăng nhập bằng mã code từ Google' })
  async googleLogin(@Body('code') code: string) {
    return this.authService.loginWithGoogle(code);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Gửi lại mã xác thực' })
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerification(email);
  }

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ResponseMessage(USER_MESSAGES.REGISTER_SUCCESS)
  @ApiResponse({ status: 201 })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập tài khoản' })
  @ResponseMessage(USER_MESSAGES.LOGIN_SUCCESS)
  @ApiResponse({ status: 200 })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(AuthGuard) // <--- SỬ DỤNG GUARD Ở ĐÂY
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Làm mới Access Token' })
  async refresh(@Req() req: any) {
    const userId = req.user.sub;
    const refreshToken = req.headers.authorization?.split(' ')[1];
    return this.authService.refresh(userId, refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard) // <--- SỬ DỤNG GUARD Ở ĐÂY
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất' })
  @ResponseMessage(USER_MESSAGES.LOGOUT_SUCCESS)
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.sub);
  }

  @Get('me')
  @UseGuards(AuthGuard) // <--- SỬ DỤNG GUARD Ở ĐÂY
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng đang đăng nhập' })
  async getMe(@Req() req: any) {
    // Thông tin sub (id) nằm trong req.user do Guard giải mã ra
    return this.authService.getMe(req.user.sub);
  }
}
