import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Min } from "class-validator";
import { Type, Transform, plainToInstance } from "class-transformer";

// Bước 1: Định nghĩa cấu trúc cho từng Biến thể (Size, Giá, Kho)
export class CreateProductDto {
    @ApiProperty({ example: 'iPhone 15 Pro Max' })
    @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'iphone-15-pro-max' })
    @IsNotEmpty()
    @IsString()
    slug: string;

    @ApiProperty({ example: 'Sản phẩm cao cấp từ Apple...' })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ example: 'https://link-anh.jpg' })
    @IsOptional()
    @IsString()
    image: string;

    @ApiProperty({ example: 35000000 })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    @Type(() => Number)
    price: number;

    @ApiProperty({ example: 25000000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    costPrice: number;

    @ApiProperty({ example: 10 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    currentStock: number;

    @ApiProperty({ description: 'ID của thương hiệu' })
    @IsNotEmpty()
    @IsString()
    brandId: string;
}

