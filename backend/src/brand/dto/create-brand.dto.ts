import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class CreateBrandDto {
    @ApiProperty({
        example: 'Nike',
        description: 'Tên hiển thị của thương hiệu (phải là duy nhất)',
    })
    @IsNotEmpty({ message: 'Tên thương hiệu không được để trống' })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'nike',
        description: 'Đường dẫn định danh (slug) viết liền không dấu, dùng cho URL',
    })
    @IsNotEmpty({ message: 'Slug không được để trống' })
    @IsString()
    slug: string;
}
