import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JwtService, TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class AuthorizationCheckGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private accessJwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // Если токена нет, пропускаем (например, для публичных эндпоинтов)
    if (!authHeader || authHeader?.startsWith('Basic ')) {
      return true;
    }


    const [authType, token] = authHeader.split(' ');

    if (authType !== 'Bearer') {
      throw new UnauthorizedException('Invalid token type');
    }

    try {
      const payload = this.accessJwtService.verify(token, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      });
      request.user = {
        userId: payload.userId,
        userLogin: payload.userLogin,
      };
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.log('Token expired');
        return true;
      }
      console.log('Invalid token');
      return true;
    }
   
  }
}