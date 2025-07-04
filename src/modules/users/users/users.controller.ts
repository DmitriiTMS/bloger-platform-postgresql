import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { UsersQueryRepository } from './users.query-repository';
import { GetUsersQueryParams } from './dto/paginate/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/paginate/base.paginate.view-dto';
import { UserViewDto } from './dto/user-view.dto';

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
    return await this.usersQueryRepository.findAll(query)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
