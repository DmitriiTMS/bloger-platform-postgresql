import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entitys/users.entity';
import { Repository } from 'typeorm';
import { UserViewDto } from '../../users/dto/user-view.dto';

@Injectable()
export class UsersQueryRepositoryTORM {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getByIdOrNotFoundFail(id: number) {
    //     const query = `
    //         SELECT * FROM "users"
    //         WHERE id = $1
    //       `;

    //     const parameters = [id];
    //     const result = await this.dataSource.query(query, parameters);

    //     if (result.length === 0) {
    //       throw new NotFoundException('user not found');
    //     }
    //     const user = result[0]; // Берём первую запись (если id уникален)
    //   return UserViewDto.mapToView(user);

    const result = await this.usersRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException('user not found');
    }
    return UserViewDto.mapToView(result);
  }
}
