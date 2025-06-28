import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetPostsQueryParams } from '../paginate/get-posts-query-params.input-dto';
import { SortDirection } from 'src/core/paginate/base.query-params.dto';
import { PaginatedViewDto } from 'src/core/paginate/base.paginate.view-dto';
import { PostViewDto } from '../paginate/post.view-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllPostsByblogId(blogId: number, query: GetPostsQueryParams) {
    // Подготавливаем параметры пагинации
    const pageNumber = query.pageNumber;
    const pageSize = query.pageSize;
    const skip = query.calculateSkip();

    // Базовый запрос для постов блога
    let postsQuery = `
        SELECT * 
        FROM "posts"
        WHERE "blogId" = $1
    `;
    const params: (string | number)[] = [blogId];

    // Сортировка (используем enum для валидации допустимых полей)
    const sortDirection = query.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';
    postsQuery += ` ORDER BY "${query.sortBy}" ${sortDirection}`;

    // Пагинация
    postsQuery += ` LIMIT $2 OFFSET $3`;
    params.push(pageSize, skip);

    // Выполняем запрос постов
    const posts = await this.dataSource.query(postsQuery, params);

    // Запрос общего количества постов для блога
    const countQuery = `SELECT COUNT(*) FROM "posts" WHERE "blogId" = $1`;
    const totalCountResult = await this.dataSource.query<{ count: string }[]>(
      countQuery,
      [blogId],
    );
    const totalCount = Number(totalCountResult[0]?.count || 0);

    // ДЛЯ ПРИМЕРА
    const reactions = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    }

    // Преобразуем посты в DTO
    const items = posts.map((post) => {
      return PostViewDto.mapToView(post, reactions);
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: pageNumber,
      size: pageSize,
    });
  }

  async getPostWithBlogData(postId: number) {
    const query = `
      SELECT p.id, p.title, p."shortDescription", p.content, p."createdAt", p."blogId", b.name as "blogName"
      FROM "posts" as p
      LEFT JOIN "blogs" as b
      ON p."blogId" = b.id 
      WHERE p.id = $1
    `;
    const result = await this.dataSource.query(query, [postId]);
    return result[0];
  }
}
