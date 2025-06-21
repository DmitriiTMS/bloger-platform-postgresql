import { createParamDecorator, ExecutionContext } from '@nestjs/common';


export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new Error('there is no user in the request object!');
    }

    return user;
  },
);