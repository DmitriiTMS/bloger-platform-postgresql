import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersRepository } from './users/users.repository';
import { UsersQueryRepository } from './users/users.query-repository';

@Module({
  controllers: [UsersController, AuthController],
  providers: [UsersService, UsersRepository, UsersQueryRepository, AuthService],
})
export class UsersModule {}
