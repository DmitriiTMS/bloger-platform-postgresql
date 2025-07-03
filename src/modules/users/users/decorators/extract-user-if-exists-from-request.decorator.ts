import { createParamDecorator, ExecutionContext } from '@nestjs/common';


export const ExtractUserIfExistsFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): {userId: string} | null => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      return null;
    }

    return user;
  },
);