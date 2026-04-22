// src/users/dto/create-user.dto.ts
import { RegisterDto } from '../../auth/dto/register.dto';

// CreateUserDto bây giờ sẽ có đầy đủ email, password, name giống RegisterDto
export class CreateUserDto extends RegisterDto { }
