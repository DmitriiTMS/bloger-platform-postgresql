import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestUserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

     if (!request.user) {
      throw new Error('there is no user in the request object! RequestUserDecorator!!!!');
    }
    return request.user;
  },
);