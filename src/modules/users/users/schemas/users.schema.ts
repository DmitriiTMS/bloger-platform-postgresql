import { CreateUserDto } from '../dto/create-user.dto';

export class UserSchema {
  login: string;
  hashPassword: string;
  email: string;
  createdAt: string;


  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };

  static createInstance(dto: CreateUserDto, emailConfirmation?: any): UserSchema {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.hashPassword = dto.password;
    user.createdAt = new Date().toISOString(); 
    user.emailConfirmation = emailConfirmation;
    return user;
  }
}
