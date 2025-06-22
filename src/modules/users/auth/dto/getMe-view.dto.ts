export type UserGetMeResponse = {
    id: string,
    email: string,
    login: string,
    createdAt: string
}

export class UserGetMeViewDto {
  userId: string;
  login: string;
  email: string;

  static mapToView(user: UserGetMeResponse): UserGetMeViewDto {
    const dto = new UserGetMeViewDto();

    dto.userId = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;

    return dto;
  }
}