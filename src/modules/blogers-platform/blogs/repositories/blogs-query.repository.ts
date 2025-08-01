import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetBlogsQueryParams } from '../paginate/get-blogs-query-params';
import { BlogViewDto } from '../paginate/blog-view.dto';
import { PaginatedViewDto } from '../../../../core/paginate/base.paginate.view-dto';
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';
import { Blog } from '../types/blogs-types';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAll(query: GetBlogsQueryParams) {
    // Базовый запрос
    let baseSQLquery = 'SELECT * FROM "blogs"';
    const params: string[] = [];
    const conditions: string[] = [];

    // Добавляем условия поиска, если параметры переданы
    if (query.searchNameTerm) {
      conditions.push('name ILIKE $' + (params.length + 1));
      params.push(`%${query.searchNameTerm}%`);
    }

    // Добавляем WHERE только если есть условия
    if (conditions.length > 0) {
      baseSQLquery += ' WHERE ' + conditions.join(' OR ');
    }

    // Сортировка
    const sortBy = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection || 'ASC';
    baseSQLquery += ` ORDER BY "${sortBy}" ${sortDirection}`;

    // // Для сортировки по name используем LOWER
    // if (sortBy === 'name') {
    //   baseSQLquery += ` ORDER BY LOWER("name") ${sortDirection}`;
    // } else {
    //   baseSQLquery += ` ORDER BY "${sortBy}" ${sortDirection}`;
    // }

    // Пагинация
    if (query.pageSize && query.pageNumber) {
      const offset = (query.pageNumber - 1) * query.pageSize;
      baseSQLquery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(query.pageSize.toString(), offset.toString());
    }

    // Выполняем запрос
    const blogs = await this.dataSource.query(baseSQLquery, params);

    // Возвращем в нужном виде массив блогов
    const items = blogs.map(BlogViewDto.mapToView);

    let countQuery = 'SELECT COUNT(*) FROM "blogs"';
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

  async getAllTORM(query: GetBlogsQueryParams) {
      // Базовый запрос
    let baseSQLquery = 'SELECT * FROM "blogs"';
    const params: string[] = [];
    const conditions: string[] = [];

    // Условие поиска
    if (query.searchNameTerm) {
      conditions.push('name ILIKE $' + (params.length + 1));
      params.push(`%${query.searchNameTerm}%`);
    }

    if (conditions.length > 0) {
      baseSQLquery += ' WHERE ' + conditions.join(' OR ');
    }

    // Исправленная сортировка
    const sortBy = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection || 'ASC';

    if (sortBy === 'name') {
      // Используем COLLATE для правильной алфавитной сортировки
      baseSQLquery += ` ORDER BY "name" COLLATE "C" ${sortDirection}`;
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
    const blogs = await this.dataSource.query(baseSQLquery, params);
    const items = blogs.map(BlogViewDto.mapToView);

    // Запрос общего количества
    let countQuery = 'SELECT COUNT(*) FROM "blogs"';
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

  async getBlogByIdOrNotFoundFail(blogId: number): Promise<Blog> {
    const query = `SELECT id FROM "blogs" WHERE id = $1`;
    const blog = await this.dataSource.query(query, [blogId]);

    if (!blog || blog.length === 0) {
      throw new CustomDomainException({
        errorsMessages: `Blog by ${blogId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    return blog[0];
  }

  async getOne(blogId: number) {
    const query = `SELECT "id", "name", "description", "websiteUrl", "createdAt" , "isMembership" FROM "blogs" WHERE "id" = $1`;
    const result = await this.dataSource.query(query, [blogId]);

    if (!result || result.length === 0) {
      throw new CustomDomainException({
        errorsMessages: `Blog by ${blogId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    const { id, ...responseBlog } = result[0];
    return {
      id: String(result[0].id),
      ...responseBlog,
    };
  }
}
