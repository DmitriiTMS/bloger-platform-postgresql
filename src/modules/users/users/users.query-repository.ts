import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetUsersQueryParams } from './dto/paginate/get-users-query-params.input-dto';
import { UserViewDto } from './dto/user-view.dto';
import { PaginatedViewDto } from '../../../core/paginate/base.paginate.view-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    // Базовый запрос
    let baseSQLquery = 'SELECT * FROM "users"';
    const params: string[] = [];
    const conditions: string[] = [];

    // Добавляем условия поиска, если параметры переданы
    if (query.searchLoginTerm) {
      conditions.push('login ILIKE $' + (params.length + 1));
      params.push(`%${query.searchLoginTerm}%`);
    }

    if (query.searchEmailTerm) {
      conditions.push('email ILIKE $' + (params.length + 1));
      params.push(`%${query.searchEmailTerm}%`);
    }

    // Добавляем WHERE только если есть условия
    if (conditions.length > 0) {
      baseSQLquery += ' WHERE ' + conditions.join(' OR ');
    }

    // Сортировка
    const sortBy = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection || 'ASC';
    // baseSQLquery += ` ORDER BY "${sortBy}" ${sortDirection}`;

    if (sortBy === 'login' || sortBy === 'email') {
      baseSQLquery += ` ORDER BY "${sortBy}" COLLATE "C" ${sortDirection}`;
    } else {
      baseSQLquery += ` ORDER BY "${sortBy}" ${sortDirection}`;
    }

    // Пагинация
    if (query.pageSize && query.pageNumber) {
      const offset = (query.pageNumber - 1) * query.pageSize;
      baseSQLquery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(query.pageSize.toString(), offset.toString());
    }

    // Выполняем запрос
    const users = await this.dataSource.query(baseSQLquery, params);

    // Возвращем в нужном виде массив пользователей
    const items = users.map(UserViewDto.mapToView);

    let countQuery = 'SELECT COUNT(*) FROM "users"';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' OR ');
    }
    const totalCount = await this.dataSource.query(
      countQuery,
      params.slice(0, conditions.length),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount: Number(totalCount[0].count),
      page: query.pageNumber || 1,
      size: query.pageSize || Number(totalCount[0].count),
    });
  }

  async getByIdOrNotFoundFail(id: string) {
    const query = `
    SELECT * FROM "users"
    WHERE id = $1
  `;

    const parameters = [id];
    const result = await this.dataSource.query(query, parameters);

    if (result.length === 0) {
      throw new NotFoundException('user not found');
    }
    const user = result[0]; // Берём первую запись (если id уникален)
    return UserViewDto.mapToView(user);
  }
}
