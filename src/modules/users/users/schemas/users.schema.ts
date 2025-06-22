import { CreateUserDto } from '../dto/create-user.dto';

export class UserSchema {
  id: string;
  login: string;
  hashPassword: string;
  email: string;
  createdAt: string;

  static createInstance(dto: CreateUserDto, emailConfirmation?: any): UserSchema {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.hashPassword = dto.password;
    user.createdAt = new Date().toISOString(); 

    return user;
  }
}
