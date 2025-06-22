import { EmailApplyDecorator } from '../decorators/dto-decorators/email.apply-decorator';
import { LoginApplyDecorator } from '../decorators/dto-decorators/login.apply-decorator';
import { PasswordApplyDecorator } from '../decorators/dto-decorators/password.apply-decoratot';

export class CreateUserDto {
  @LoginApplyDecorator(/^[a-zA-Z0-9_-]*$/)
  login: string;

  @PasswordApplyDecorator()
  password: string;

  @EmailApplyDecorator(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}
