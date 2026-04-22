import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer'; // Thêm Transform

export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email dùng để đăng nhập'
    })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @Transform(({ value }) => value?.trim()) // Tự động bỏ khoảng trắng đầu/cuối
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'Mật khẩu tối thiểu 6 ký tự'
    })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string;

    @ApiProperty({
        example: 'Nguyễn Văn A',
        description: 'Tên đầy đủ của người dùng'
    })
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @Transform(({ value }) => value?.trim()) // Tự động bỏ khoảng trắng đầu/cuối
    name: string;
}
