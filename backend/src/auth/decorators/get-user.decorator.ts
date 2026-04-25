import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Nếu truyền vào key (ví dụ 'id' hoặc 'sub') thì trả về giá trị đó
    // Lưu ý: Trong JWT Strategy chúng ta hay dùng 'sub' làm ID
    if (data) {
      return user?.[data] || user?.['sub']; 
    }
    
    return user;
  },
);
