import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../users/decorators/dto-decorators/trim.decorator';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  loginOrEmail: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  password: string;
}
