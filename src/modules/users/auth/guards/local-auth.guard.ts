import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { errorFormatter } from '../../../../setup/pipes.setup';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { UserLoginDto } from '../dto/user-login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    // Валидация DTO через подкл. глобальный pipes
    const login = plainToClass(UserLoginDto, body);
    const errors = await validate(login);
    const formattedErrors = errorFormatter(errors);

    if (errors.length > 0) {
      throw new CustomDomainException({ errorsMessages: formattedErrors });
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}