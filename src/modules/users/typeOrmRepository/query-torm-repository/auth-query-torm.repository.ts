import { Injectable } from "@nestjs/common";
import { UsersQueryRepositoryTORM } from "./user-query-torm.repository";
import { UserGetMeViewDto } from "../../auth/dto/getMe-view.dto";

@Injectable()
export class AuthQueryRepositoryTORM {
  constructor(private usersQueryRepositoryTORM: UsersQueryRepositoryTORM) {}
  
  async getMe(userId: number): Promise<UserGetMeViewDto> {
    const user = await this.usersQueryRepositoryTORM.getByIdOrNotFoundFail(userId)
    const userView = UserGetMeViewDto.mapToView(user);
    return userView
  }
}