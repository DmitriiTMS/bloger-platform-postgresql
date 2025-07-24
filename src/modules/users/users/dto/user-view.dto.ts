import { User } from '../entitys/users.entity';
import { UserSchema } from '../schemas/users.schema';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToView(user: any) {
    const dto = new UserViewDto();

    dto.id = String(user.id);
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt
    return dto;
  }
}