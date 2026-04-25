import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateReceiptItemDto {
  @ApiProperty({ example: 'cmobh...' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 1500000 })
  @IsNumber()
  @Min(0)
  costPrice: number;
}

export class CreateReceiptDto {
  @ApiProperty({ example: 'Nhập hàng đợt tháng 4' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ type: [CreateReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  items: CreateReceiptItemDto[];
}
