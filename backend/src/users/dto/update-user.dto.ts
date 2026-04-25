import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  role?: string;
}
