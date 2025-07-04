import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetPostsQueryParams } from '../paginate/get-posts-query-params.input-dto';
import { SortDirection } from 'src/core/paginate/base.query-params.dto';
import { PaginatedViewDto } from 'src/core/paginate/base.paginate.view-dto';
import { PostViewDto, PostViewDto1111 } from '../paginate/post.view-dto';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../../setup/exceptions/filters/constants';
import { LikeStatus } from '../../types-reaction';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  // Исправленный метод getAllPostsByblogId
  async getAllPostsByblogId(
    blogId: number,
    query: GetPostsQueryParams,
    userId?: number,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // 1. Проверяем существование блога
    const blogQuery = `SELECT id, name FROM blogs WHERE id = $1`;
    const [blog] = await this.dataSource.query(blogQuery, [blogId]);
    if (!blog) throw new NotFoundException(`Blog by ${blogId} not found`);

    // 2. Получаем посты с пагинацией
    const postsQuery = `
    SELECT 
      p.id,
      p.title,
      p."shortDescription",
      p.content,
      p."createdAt",
      p."blogId",
      b.name as "blogName",
      (
        SELECT COUNT(*) 
        FROM posts_reactions pr 
        WHERE pr."postId" = p.id AND pr.status = 'Like'
      ) as "likesCount",
      (
        SELECT COUNT(*) 
        FROM posts_reactions pr 
        WHERE pr."postId" = p.id AND pr.status = 'Dislike'
      ) as "dislikesCount"
    FROM posts p
    LEFT JOIN blogs b ON p."blogId" = b.id
    WHERE p."blogId" = $1
    ORDER BY p."${query.sortBy}" ${query.sortDirection === 'asc' ? 'ASC' : 'DESC'}
    LIMIT $2 OFFSET $3
  `;
    const posts = await this.dataSource.query(postsQuery, [
      blogId,
      query.pageSize,
      query.calculateSkip(),
    ]);

    const postIds = posts.map((p) => p.id);

    // 3. Получаем реакции текущего пользователя
    let reactionDictionary: Record<string, LikeStatus> = {};
    if (userId && postIds.length > 0) {
      const userReactions = await this.dataSource.query(
        `SELECT "postId", status FROM posts_reactions WHERE "userId" = $1 AND "postId" = ANY($2)`,
        [userId, postIds],
      );
      reactionDictionary = userReactions.reduce((acc, reaction) => {
        acc[reaction.postId] = reaction.status;
        return acc;
      }, {});
    }

    // 4. Получаем последние 3 лайка для каждого поста
    const newestLikesByPost: Record<string, any[]> = {};
    if (postIds.length > 0) {
      const likesQuery = `
      WITH ranked_likes AS (
        SELECT 
          "postId",
          "userId",
          "created_at",
          ROW_NUMBER() OVER (PARTITION BY "postId" ORDER BY "created_at" DESC) as rn
        FROM posts_reactions
        WHERE "postId" = ANY($1) AND status = 'Like'
      )
      SELECT 
        r."postId",
        r."userId",
        u.login,
        r."created_at"
      FROM ranked_likes r
      JOIN users u ON r."userId" = u.id
      WHERE r.rn <= 3
    `;
      const likes = await this.dataSource.query(likesQuery, [postIds]);

      likes.forEach((like) => {
        if (!newestLikesByPost[like.postId]) {
          newestLikesByPost[like.postId] = [];
        }
        newestLikesByPost[like.postId].push({
          addedAt: like.created_at,
          userId: like.userId,
          login: like.login,
        });
      });
    }

    // 5. Формируем результат
    const items = posts.map((post) => {
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: Number(post.likesCount), // Преобразуем в число
          dislikesCount: Number(post.dislikesCount), // Преобразуем в число
          myStatus: reactionDictionary[post.id] || LikeStatus.NONE,
          newestLikes: newestLikesByPost[post.id] || [],
        },
      };
    });

    // 6. Получаем общее количество постов
    const totalCountQuery = `SELECT COUNT(*) FROM posts WHERE "blogId" = $1`;
    const [{ count }] = await this.dataSource.query(totalCountQuery, [blogId]);

    // 7. Возвращаем результат с правильным порядком полей
    return {
      pagesCount: Math.ceil(Number(count) / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(count),
      items,
    };
  }

  async getAllPostsByblogIdPrivate(blogId: number, query: GetPostsQueryParams) {
    // Подготавливаем параметры пагинации
    const pageNumber = query.pageNumber;
    const pageSize = query.pageSize;
    const skip = query.calculateSkip();

    // Базовый запрос для постов блога
    let postsQuery = `
      SELECT p.id, p.title, p."shortDescription", p.content, p."createdAt", p."blogId", b.name as "blogName"
      FROM "posts" as p
      LEFT JOIN "blogs" as b
      ON p."blogId" = b.id
      WHERE p."blogId" = $1
    `;
    const params: (string | number)[] = [blogId];

    // Сортировка (используем enum для валидации допустимых полей)
    const sortDirection =
      query.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';
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

    // Преобразуем посты в DTO
    const items = posts.map((post) => {
      return PostViewDto.mapToView(post);
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: pageNumber,
      size: pageSize,
    });
  }

  async getAllPosts(
    query: GetPostsQueryParams,
    userId?: number,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // 1. Формируем базовый запрос для постов
    let baseQuery = `
    SELECT 
      p.id,
      p.title,
      p.content,
      p."shortDescription",
      p."blogId",
      b.name as "blogName",
      p."createdAt",
      COALESCE(p."likesCount", 0) as "likesCount",
      COALESCE(p."dislikesCount", 0) as "dislikesCount"
    FROM posts p
    LEFT JOIN blogs b ON p."blogId" = b.id
  `;
    const params: any[] = [];

    // 2. Добавляем сортировку
    const sortBy = this.getColumnNameGetAll(query.sortBy || 'createdAt');
    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';
    baseQuery += ` ORDER BY "${sortBy}" ${sortDirection}`;

    // 3. Добавляем пагинацию
    baseQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(query.pageSize, (query.pageNumber - 1) * query.pageSize);

    // 4. Выполняем запрос для получения постов
    const posts = await this.dataSource.query(baseQuery, params);
    const postIds = posts.map((p) => p.id);

    // 5. Получаем реакции пользователя (если userId передан)
    let reactionDictionary: Record<string, LikeStatus> = {};
    if (userId && postIds.length > 0) {
      const userReactions = await this.dataSource.query(
        `SELECT "postId", status 
       FROM posts_reactions 
       WHERE "userId" = $1 AND "postId" = ANY($2::bigint[])`,
        [userId, postIds],
      );

      reactionDictionary = userReactions.reduce((acc, reaction) => {
        acc[reaction.postId] = reaction.status;
        return acc;
      }, {});
    }

    // 6. Получаем последние 3 лайка для каждого поста
    const newestLikesByPost: Record<string, any[]> = {};
    if (postIds.length > 0) {
      const likes = await this.dataSource.query(
        `SELECT 
        pl."postId",
        pl."userId",
        u.login,
        pl."created_at"
      FROM (
        SELECT 
          "postId", 
          "userId", 
          "created_at",
          ROW_NUMBER() OVER (PARTITION BY "postId" ORDER BY "created_at" DESC) as rn
        FROM posts_reactions
        WHERE "postId" = ANY($1::bigint[]) AND status = $2
      ) pl
      JOIN users u ON pl."userId" = u.id
      WHERE pl.rn <= 3`,
        [postIds, LikeStatus.LIKE],
      );

      likes.forEach((like) => {
        console.log(like);

        if (!newestLikesByPost[like.postId]) {
          newestLikesByPost[like.postId] = [];
        }
        newestLikesByPost[like.postId].push({
          addedAt: like.created_at,
          userId: like.userId,
          login: like.login,
        });
      });
    }

    // 7. Формируем результат
    const items = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      shortDescription: post.shortDescription,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: reactionDictionary[post.id] || LikeStatus.NONE,
        newestLikes: newestLikesByPost[post.id] || [],
      },
    }));

    // 8. Получаем общее количество постов
    const totalCountResult = await this.dataSource.query(
      `SELECT COUNT(*) FROM posts`,
    );
    const totalCount = parseInt(totalCountResult[0].count, 10);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getPostByIdOrNotFoundFail(postId: number) {
    const query = `SELECT id FROM "posts" WHERE id = $1`;
    const post = await this.dataSource.query(query, [postId]);

    if (!post || post.length === 0) {
      throw new CustomDomainException({
        errorsMessages: `Post by id == ${postId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    return post[0];
  }

  async getOneWithReactions(id: number, userId?: number): Promise<PostViewDto> {
    // 1. Получаем пост с данными блога
    const postQuery = `
      SELECT 
        p.id,
        p.title,
        p."shortDescription",
        p.content,
        p."createdAt",
        p."blogId",
        b.name as "blogName",
        COALESCE((
          SELECT COUNT(*) 
          FROM posts_reactions pr 
          WHERE pr."postId" = p.id AND pr.status = 'Like'
        ), 0) as "likesCount",
        COALESCE((
          SELECT COUNT(*) 
          FROM posts_reactions pr 
          WHERE pr."postId" = p.id AND pr.status = 'Dislike'
        ), 0) as "dislikesCount"
      FROM posts p
      LEFT JOIN blogs b ON p."blogId" = b.id
      WHERE p.id = $1
    `;
    const [post] = await this.dataSource.query(postQuery, [id]);

    if (!post) {
      throw new CustomDomainException({
        errorsMessages: `Post by ${id} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    // 2. Получаем статус текущего пользователя (если userId передан)
    let myStatus = LikeStatus.NONE;
    if (userId) {
      const userReactionQuery = `
        SELECT status 
        FROM posts_reactions 
        WHERE "postId" = $1 AND "userId" = $2
      `;
      const [reaction] = await this.dataSource.query(userReactionQuery, [
        id,
        userId,
      ]);
      myStatus = reaction?.status || LikeStatus.NONE;
    }

    // 3. Получаем последние 3 лайка для поста
    const newestLikesQuery = `
      SELECT 
        pr."userId",
        u.login,
        pr."created_at" as "addedAt"
      FROM posts_reactions pr
      JOIN users u ON pr."userId" = u.id
      WHERE pr."postId" = $1 AND pr.status = $2
      ORDER BY pr."created_at" DESC
      LIMIT 3
    `;
    const newestLikes = await this.dataSource.query(newestLikesQuery, [
      id,
      LikeStatus.LIKE,
    ]);

    // 4. Формируем результат
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: +post.likesCount,
        dislikesCount: +post.dislikesCount,
        myStatus,
        newestLikes: newestLikes.map((like) => ({
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login,
        })),
      },
    };
  }

  async getAllCommentsByPostId(
    postId: number,
    query: GetPostsQueryParams,
    userId?: number,
  ) {
    // 1. Проверить существование поста
    const postExists = await this.dataSource.query(
      `SELECT 1 FROM "posts" WHERE id = $1 LIMIT 1`,
      [postId],
    );

    if (!postExists.length) {
      throw new CustomDomainException({
        errorsMessages: `Post by id == ${postId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    // 2. Получить реакции пользователя (если userId указан)
    let reactionDictionary: Record<string, LikeStatus> = {};
    if (userId) {
      const userReactions = await this.dataSource.query(
        `SELECT "comment_id", status FROM "comment_likes"
        WHERE "user_id" = $1 AND "comment_id" IN (
        SELECT id FROM comments WHERE "post_id" = $2
      )`,
        [userId, postId],
      );

      reactionDictionary = userReactions.reduce((acc, reaction) => {
        acc[reaction.comment_id] = reaction.status;
        return acc;
      }, {});
    }

    // 3. Получить пагинированные комментарии
    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const comments = await this.dataSource.query(
      `SELECT 
      id,
      content,
      user_id as "userId",
      user_login as "userLogin",
      created_at as "createdAt",
      likes_count as "likesCount",
      dislikes_count as "dislikesCount"
    FROM comments
    WHERE post_id = $1
    ORDER BY ${this.getColumnName(query.sortBy)} ${sortDirection}
    LIMIT $2 OFFSET $3`,
      [postId, query.pageSize, (query.pageNumber - 1) * query.pageSize],
    );

    // 4. Добавить статус реакции пользователя
    const items = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: String(comment.userId), // Преобразуем в строку
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt, // Добавляем дату создания
      likesInfo: {
        likesCount: Number(comment.likesCount), // Преобразуем в число
        dislikesCount: Number(comment.dislikesCount), // Преобразуем в число
        myStatus: reactionDictionary[comment.id] || LikeStatus.NONE,
      },
    }));

    // 5. Получить общее количество комментариев
    const totalCountResult = await this.dataSource.query(
      `SELECT COUNT(*) FROM "comments" WHERE "post_id" = $1`,
      [postId],
    );
    const totalCount = parseInt(totalCountResult[0].count, 10);

    // 6. Формируем ответ с правильным порядком полей
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    };
  }

  async getAllWithReactions11111111111111111(
    blogId: string,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto1111[]>> {
    // 1. Проверка существования блога
    const blog = await this.dataSource.query(
      `SELECT id FROM blogs WHERE id = $1 LIMIT 1`,
      [blogId],
    );
    if (!blog.length)
      throw new NotFoundException(`Blog by ${blogId} not found`);

    // 2. Получаем посты с пагинацией
    const postsQuery = `
    SELECT 
      p.id,
      p.title,
      p."shortDescription",
      p.content,
      p."createdAt",
      p."blogId",
      b.name as "blogName",
      (
        SELECT COUNT(*) 
        FROM posts_reactions pr 
        WHERE pr."postId" = p.id AND pr.status = 'Like'
      ) as "likesCount",
      (
        SELECT COUNT(*) 
        FROM posts_reactions pr 
        WHERE pr."postId" = p.id AND pr.status = 'Dislike'
      ) as "dislikesCount"
    FROM posts p
    LEFT JOIN blogs b ON p."blogId" = b.id
    WHERE p."blogId" = $1
    ORDER BY p."${query.sortBy}" ${query.sortDirection === 'asc' ? 'ASC' : 'DESC'}
    LIMIT $2 OFFSET $3
  `;

    const posts = await this.dataSource.query(postsQuery, [
      blogId,
      query.pageSize,
      query.calculateSkip(),
    ]);

    const postIds = posts.map((p) => p.id);

    // 3. Получаем реакции текущего пользователя
    let reactionDictionary: Record<string, LikeStatus> = {};
    if (userId && postIds.length > 0) {
      const userReactions = await this.dataSource.query(
        `SELECT "postId", status FROM posts_reactions WHERE "userId" = $1 AND "postId" = ANY($2)`,
        [userId, postIds],
      );
      reactionDictionary = userReactions.reduce((acc, reaction) => {
        acc[reaction.postId] = reaction.status;
        return acc;
      }, {});
    }

    // 4. Получаем последние 3 лайка для каждого поста
    const newestLikesByPost: Record<string, any[]> = {};
    if (postIds.length > 0) {
      const likesQuery = `
      WITH ranked_likes AS (
        SELECT 
          "postId",
          "userId",
          "createdAt",
          ROW_NUMBER() OVER (PARTITION BY "postId" ORDER BY "createdAt" DESC) as rn
        FROM posts_reactions
        WHERE "postId" = ANY($1) AND status = $2
      )
      SELECT 
        r."postId",
        r."userId",
        u.login,
        r."createdAt"
      FROM ranked_likes r
      JOIN users u ON r."userId" = u.id
      WHERE r.rn <= 3
    `;
      const likes = await this.dataSource.query(likesQuery, [
        postIds,
        LikeStatus.LIKE,
      ]);

      likes.forEach((like) => {
        if (!newestLikesByPost[like.postId]) {
          newestLikesByPost[like.postId] = [];
        }
        newestLikesByPost[like.postId].push({
          addedAt: like.createdAt,
          userId: like.userId,
          login: like.login,
        });
      });
    }

    // 5. Формируем результат
    const items = posts.map((post) => {
      return PostViewDto1111.mapToView(
        post,
        newestLikesByPost[post.id] || [],
        reactionDictionary[post.id] || LikeStatus.NONE,
        post.likesCount,
        post.dislikesCount,
      );
    });

    // 6. Получаем общее количество постов
    const totalCountResult = await this.dataSource.query(
      `SELECT COUNT(*) FROM posts WHERE "blogId" = $1`,
      [blogId],
    );
    const totalCount = parseInt(totalCountResult[0].count, 10);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  // Вспомогательный метод для преобразования имен полей

  private getColumnName(field: string): string {
    // Соответствие между camelCase (из API) и snake_case (в БД)
    const columnMapping: Record<string, string> = {
      // Основные поля комментариев
      id: 'id',
      content: 'content',
      createdAt: 'created_at',
      userId: 'user_id',
      userLogin: 'user_login',
      likesCount: 'likes_count',
      dislikesCount: 'dislikesCount',

      // Дополнительные поля, если используются
      updatedAt: 'updated_at',
      postId: 'post_id',
    };

    // Возвращаем соответствующее имя колонки или исходное значение
    return columnMapping[field] || field;
  }

  private getColumnNameGetAll(field: string): string {
    const columnMap: Record<string, string> = {
      id: 'id',
      title: 'title',
      content: 'content',
      shortDescription: 'shortDescription',
      blogId: 'blogId',
      blogName: 'blogName',
      createdAt: 'createdAt',
      likesCount: 'likesCount',
      dislikesCount: 'dislikesCount',
    };

    return columnMap[field] || field;
  }
}
