import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'Email dùng để đăng nhập',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  @IsNotEmpty({ message: 'Email không được để trống!' })
  @Transform(({ value }) => value?.trim().toLowerCase()) // Senior: Tự động trim và viết thường email
  readonly email: string;

  @ApiProperty({
    example: '123456',
    description: 'Mật khẩu tài khoản',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống!' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự!' })
  readonly password: string;
}
