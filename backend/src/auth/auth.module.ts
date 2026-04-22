import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { GoogleAuthService } from './google-auth.service';

@Module({
    imports: [
        UsersModule,
        ConfigModule,
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [AuthService, GoogleAuthService],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
