import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../types/posts-types';
import { Injectable } from '@nestjs/common';
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(post: Post) {
    const query = `
        INSERT INTO "posts"
            ("title", "shortDescription", "content", "createdAt", "blogId")
        VALUES
            ($1, $2, $3, $4::timestamp with time zone, $5)
        RETURNING "id"
    `;

    const result = await this.dataSource.query(query, [
      post.title,
      post.shortDescription,
      post.content,
      post.createdAt,
      post.blogId,
    ]);

    if (!result || result.length === 0) {
      throw new Error('Failed to create post');
    }

    return result[0].id;
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

  async updatePost(postId: number, updatePostDto: UpdatePostDto) {
    const query = `
        UPDATE "posts"
        SET "title" = $1, "shortDescription" = $2, "content" = $3
        WHERE id = $4
    `;

    await this.dataSource.query(query, [
      updatePostDto.title,
      updatePostDto.shortDescription,
      updatePostDto.content,
      postId,
    ]);
  }

  async delete(postId: number) {
    const query = `DELETE FROM "posts" WHERE id = $1`;
    await this.dataSource.query(query, [postId]);
  }
}
