import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE } from '../decorators/response-message.decorator';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    // 1. Lấy thông báo từ Decorator @ResponseMessage
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE, [
        context.getHandler(),
        context.getClass(),
      ]) || 'Thành công';

    const statusCode = context.switchToHttp().getResponse().statusCode;

    // 2. Wrap dữ liệu trả về vào object chuẩn
    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message,
        data,
      })),
    );
  }
}
