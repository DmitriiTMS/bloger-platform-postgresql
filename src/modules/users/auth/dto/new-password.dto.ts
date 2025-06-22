import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { PasswordApplyDecorator } from '../../users/decorators/dto-decorators/password.apply-decoratot';
import { Trim } from '../../users/decorators/dto-decorators/trim.decorator';

export class NewPasswordDto {
  @PasswordApplyDecorator()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  recoveryCode: string;
}