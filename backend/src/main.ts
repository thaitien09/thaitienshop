// src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Reflector } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 0. Bật CORS để Frontend gọi được API
  app.enableCors();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // 2. Kích hoạt Interceptor toàn cục
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // 3. Cấu hình Swagger 
  const config = new DocumentBuilder()
    .setTitle('Sneaker Store API')
    .setDescription('Tài liệu API dành cho dự án Sneaker Store Elite')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 1102;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}/api`);
  console.log(`📄 Swagger documentation: http://localhost:${port}/docs`);
}
bootstrap();
