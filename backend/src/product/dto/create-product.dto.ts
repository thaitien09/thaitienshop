import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
    @ApiProperty({ example: 'Reuzel Blue Strong Hold Water Soluble Pomade' })
    @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'reuzel-blue-pomade' })
    @IsNotEmpty({ message: 'Slug không được để trống' })
    @IsString()
    slug: string;

    @ApiProperty({ example: 'Dòng Pomade gốc nước cao cấp, giữ nếp cực tốt và độ bóng cao...' })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ example: 'https://thaitienshop.id.vn/uploads/reuzel-blue.jpg' })
    @IsOptional()
    @IsString()
    image: string;

    @ApiProperty({ example: 450000 })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    @Type(() => Number)
    price: number;

    @ApiProperty({ example: 320000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    costPrice: number;

    @ApiProperty({ example: 50 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    currentStock: number;

    @ApiProperty({ description: 'ID của thương hiệu (ví dụ ID của Reuzel)' })
    @IsNotEmpty()
    @IsString()
    brandId: string;
}
