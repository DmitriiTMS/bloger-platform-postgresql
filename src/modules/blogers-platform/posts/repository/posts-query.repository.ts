import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { GetPostsQueryParams } from '../paginate/get-posts-query-params.input-dto';
import { SortDirection } from 'src/core/paginate/base.query-params.dto';
import { PaginatedViewDto } from 'src/core/paginate/base.paginate.view-dto';
import { PostViewDto, PostViewDto1111 } from '../paginate/post.view-dto';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../../setup/exceptions/filters/constants';
import { LikeStatus } from '../../types-reaction';
import { Post } from '../entity/post.entity';
import { Blog } from '../../blogs/entitys/blog.entity';
import { PostsReactions } from '../entity/posts_reactions.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(PostsReactions)
    private readonly postReactionRepository: Repository<PostsReactions>,
  ) {}

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
        `SELECT "postId", status FROM "posts_reactions" WHERE "userId" = $1 AND "postId" = ANY($2)`,
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
        WHERE "postId" = ANY($1) AND status = 'Like'
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
      const likes = await this.dataSource.query(likesQuery, [postIds]);

      likes.forEach((like) => {
        if (!newestLikesByPost[like.postId]) {
          newestLikesByPost[like.postId] = [];
        }
        newestLikesByPost[like.postId].push({
          addedAt: like.createdAt,
          userId: like.userId.toString(),
          login: like.login,
        });
      });
    }

    // 5. Формируем результат
    const items = posts.map((post) => {
      return {
        id: post.id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId.toString(),
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: Number(post.likesCount), // Преобразуем в число
          dislikesCount: Number(post.dislikesCount), // Преобразуем в число
          myStatus: reactionDictionary[post.id] || LikeStatus.NONE,
          newestLikes: newestLikesByPost[post.id] || []
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

  async getAllPostsByblogIdTORM(
    blogId: number,
    query: GetPostsQueryParams,
    userId?: number,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // 1. Проверяем существование блога
    // 1. Проверяем существование блога и получаем его имя
    const blog = await this.blogRepository.findOne({
      where: { id: blogId },
      select: ['name'], // Получаем только имя блога
    });
    if (!blog) throw new NotFoundException(`Blog by ${blogId} not found`);

    // 2. Получаем посты с пагинацией
    const [posts, totalCount] = await this.postRepository.findAndCount({
      where: { blogId },
      order: { [query.sortBy]: query.sortDirection === 'asc' ? 'ASC' : 'DESC' },
      skip: query.calculateSkip(),
      take: query.pageSize,
      relations: ['blog'],
    });

    // 3. Получаем ID постов для дополнительных запросов
    const postIds = posts.map((p) => p.id);

    // 4. Получаем реакции пользователя
    const userReactions =
      userId && postIds.length > 0
        ? await this.postReactionRepository.find({
            where: { userId, postId: In(postIds) },
          })
        : [];

    const reactionMap = userReactions.reduce((acc, reaction) => {
      acc[reaction.postId] = reaction.status;
      return acc;
    }, {});

    // 5. Получаем последние 3 лайка для каждого поста
    const newestLikesMap = {};
    if (postIds.length > 0) {
      const newestLikes = await this.postReactionRepository
        .createQueryBuilder('pr')
        .select([
          'pr.postId as postId',
          'pr.userId as userId',
          'pr.createdAt as addedAt',
          'u.login as login',
        ])
        .innerJoin('pr.user', 'u')
        .where('pr.postId IN (:...postIds)', { postIds })
        .andWhere('pr.status = :status', { status: 'Like' })
        .orderBy('pr.createdAt', 'DESC')
        .limit(3 * postIds.length)
        .getRawMany();

      newestLikes.forEach((like) => {
        if (!newestLikesMap[like.postId]) {
          newestLikesMap[like.postId] = [];
        }
        newestLikesMap[like.postId].push({
          addedAt: like.addedAt,
          userId: String(like.userId), // Преобразуем в строку
          login: like.login,
        });
      });
    }

    // 6. Получаем количество лайков/дизлайков для каждого поста
    const likesCounts = await this.postReactionRepository
      .createQueryBuilder('pr')
      .select([
        'pr.postId as postId',
        'SUM(CASE WHEN pr.status = :like THEN 1 ELSE 0 END) as likes',
        'SUM(CASE WHEN pr.status = :dislike THEN 1 ELSE 0 END) as dislikes',
      ])
      .where('pr.postId IN (:...postIds)', { postIds })
      .groupBy('pr.postId')
      .setParameters({ like: 'Like', dislike: 'Dislike' })
      .getRawMany();

    const likesMap = likesCounts.reduce((acc, { postId, likes, dislikes }) => {
      acc[postId] = { likes: Number(likes), dislikes: Number(dislikes) };
      return acc;
    }, {});

    // 7. Формируем финальный результат
    const items = posts.map((post) => {
      const postLikes = likesMap[post.id] || { likes: 0, dislikes: 0 };

      return {
        id: String(post.id), // Преобразуем в строку
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: String(post.blogId), // Преобразуем в строку
        blogName: blog.name, // Используем имя из первого запроса
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: postLikes.likes,
          dislikesCount: postLikes.dislikes,
          myStatus: reactionMap[post.id] || 'None',
          newestLikes: newestLikesMap[post.id] || [], // Гарантированно массив
        },
      };
    });

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
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
        pl."createdAt"
      FROM (
        SELECT 
          "postId", 
          "userId", 
          "createdAt",
          ROW_NUMBER() OVER (PARTITION BY "postId" ORDER BY "createdAt" DESC) as rn
        FROM posts_reactions
        WHERE "postId" = ANY($1::bigint[]) AND status = $2
      ) pl
      JOIN users u ON pl."userId" = u.id
      WHERE pl.rn <= 3`,
        [postIds, LikeStatus.LIKE],
      );

      likes.forEach((like) => {
        if (!newestLikesByPost[like.postId]) {
          newestLikesByPost[like.postId] = [];
        }
        newestLikesByPost[like.postId].push({
          addedAt: like.createdAt,
          userId: like.userId.toString(),
          login: like.login,
        });
      });
    }

    // 7. Формируем результат
    const items = posts.map((post) => ({
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: parseInt(post.likesCount),
        dislikesCount: parseInt(post.dislikesCount),
        myStatus: reactionDictionary[post.id] || LikeStatus.NONE,
        newestLikes: newestLikesByPost[post.id] || []
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

    console.log(post);

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
        pr."createdAt" as "addedAt"
      FROM posts_reactions pr
      JOIN users u ON pr."userId" = u.id
      WHERE pr."postId" = $1 AND pr.status = $2
      ORDER BY pr."createdAt" DESC
      LIMIT 3
    `;
    const newestLikes = await this.dataSource.query(newestLikesQuery, [
      id,
      LikeStatus.LIKE,
    ]);

    // 4. Формируем результат
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: +post.likesCount,
        dislikesCount: +post.dislikesCount,
        myStatus,
        newestLikes: newestLikes.map((like) => ({
          addedAt: like.addedAt,
          userId: like.userId.toString(),
          login: like.login,
        })),
      },
    };
  }

  async getOneWithReactionsTORM(
    id: number,
    userId?: number,
  ): Promise<PostViewDto> {
    // 1. Получаем пост с данными блога и счетчиками реакций
    const post = await this.postRepository
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.title',
        'p.shortDescription',
        'p.content',
        'p.createdAt',
        'p.blogId',
        'b.name',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'likesCount')
          .from('posts_reactions', 'pr')
          .where('pr.postId = p.id AND pr.status = :likeStatus', {
            likeStatus: LikeStatus.LIKE,
          });
      }, 'likesCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'dislikesCount')
          .from('posts_reactions', 'pr')
          .where('pr.postId = p.id AND pr.status = :dislikeStatus', {
            dislikeStatus: LikeStatus.DISLIKE,
          });
      }, 'dislikesCount')
      .leftJoin('p.blog', 'b')
      .where('p.id = :id', { id })
      .getRawOne();

    console.log(post);

    if (!post) {
      throw new CustomDomainException({
        errorsMessages: `Post by ${id} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    // 2. Получаем статус текущего пользователя
    let myStatus = LikeStatus.NONE;
    if (userId) {
      const reaction = await this.postRepository.manager
        .createQueryBuilder()
        .select('pr.status')
        .from('posts_reactions', 'pr')
        .where('pr.postId = :postId AND pr.userId = :userId', {
          postId: id,
          userId,
        })
        .getRawOne();

      myStatus = reaction?.status || LikeStatus.NONE;
    }

    // 3. Получаем последние 3 лайка для поста
    const newestLikes = await this.postRepository.manager
      .createQueryBuilder()
      .select(['pr.userId', 'u.login', 'pr.createdAt AS addedAt'])
      .from('posts_reactions', 'pr')
      .innerJoin('users', 'u', 'pr.userId = u.id')
      .where('pr.postId = :postId AND pr.status = :status', {
        postId: id,
        status: LikeStatus.LIKE,
      })
      .orderBy('pr.createdAt', 'DESC')
      .limit(3)
      .getRawMany();

    // 4. Формируем результат
    return {
      id: post.p_id.toString(),
      title: post.p_title,
      shortDescription: post.p_shortDescription,
      content: post.p_content,
      blogId: post.p_blogId.toString(),
      blogName: post.b_name,
      createdAt: post.p_createdAt,
      extendedLikesInfo: {
        likesCount: parseInt(post.likesCount) || 0,
        dislikesCount: parseInt(post.dislikesCount) || 0,
        myStatus,
        newestLikes: newestLikes.map((like) => ({
                addedAt: like.addedAt,
                userId: like.userId.toString(),
                login: like.login,
              }))
        
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
        `SELECT "comment_id", "status" FROM "comment_likes"
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
      "createdAt" as "createdAt",
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
      id: comment.id.toString(),
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
      createdAt: '"createdAt"',
      userId: 'user_id',
      userLogin: 'user_login',
      likesCount: 'likes_count',
      dislikesCount: 'dislikesCount',

      // Дополнительные поля, если используются
      updatedAt: 'updatedAt',
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
