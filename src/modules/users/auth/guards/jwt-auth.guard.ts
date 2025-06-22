import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../../setup/exceptions/filters/constants';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException({
        message: 'Token expired',
        error: 'TokenExpiredError',
      });
    }
    
     if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException({
        message: 'Invalid token',
        error: 'JsonWebTokenError',
        statusCode: 401,
      });
    }

    if (err || !user) {
      throw new CustomDomainException({
        errorsMessages: DomainExceptionCode.Unauthorized,
        customCode: DomainExceptionCode.Unauthorized,
      });
    }
    return user;
  }
}

// Как JwtStrategy работает в связке с JwtAuthGuard?
// 1) Запрос приходит с заголовком Authorization: Bearer <token>.
// 2) JwtAuthGuard активирует JwtStrategy.
// 3) JwtStrategy:
//      - Извлекает токен из заголовка.
//      - Проверяет его подпись и срок действия.
//      - Если токен валидный – вызывает validate(payload).
// 4) Результат validate сохраняется в req.user.
// 5) JwtAuthGuard проверяет:
//      - Если req.user есть – пропускает запрос.
//      - Если нет – выбрасывает ошибку 401 Unauthorized.