import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../types/posts-types';
import { Injectable } from '@nestjs/common';
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostDataReactionDto } from '../dto/reaction/post-reaction-data.dto';
import { LikeStatus } from '../../types-reaction';

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

  async reactionForPostIdAndUserId(postId: number, userId: number) {
    const query = `SELECT * FROM "posts_reactions" WHERE "postId" = $1 AND "userId" = $2 LIMIT 1`;
    const result = await this.dataSource.query(query, [postId, userId]);

    return result[0] || null;
  }

  async saveInPostReaction(postDataReactionDto: PostDataReactionDto) {
    const query = `INSERT INTO "posts_reactions"
              ("postId", "userId", "status")
          VALUES
              ($1, $2, $3)
      `;

    await this.dataSource.query(query, [
      postDataReactionDto.postId,
      postDataReactionDto.userId,
      postDataReactionDto.status,
    ]);
  }

  async postsLikeCount(postId: number, status: LikeStatus.LIKE) {
    const query = `SELECT COUNT(*) 
        FROM "posts_reactions"
        WHERE "postId" = $1 AND "status" = $2
    `;

    const result = await this.dataSource.query(query, [postId, status]);
    return parseInt(result[0].count, 10);
  }

  async postsDislikeCount(postId: number, status: LikeStatus.DISLIKE) {
    const query = `SELECT COUNT(*) 
        FROM "posts_reactions"
        WHERE "postId" = $1 AND "status" = $2
    `;

    const result = await this.dataSource.query(query, [postId, status]);
    return parseInt(result[0].count, 10);
  }

  async likeCountUpdate(postId: number, count: number) {
    const query = `UPDATE "posts"
        SET "likesCount" = $1
        WHERE "id" = $2
      `;
    await this.dataSource.query(query, [count, postId]);
  }

  async dislikeCountUpdate(postId: number, count: number) {
    const query = `UPDATE "posts"
        SET "dislikesCount" = $1
        WHERE "id" = $2
      `;
    await this.dataSource.query(query, [count, postId]);
  }

  async updatePostReaction(id: string, likeStatus: LikeStatus) {
    const query = `UPDATE "posts_reactions"
        SET "status" = $1
        WHERE "id" = $2
      `;
    await this.dataSource.query(query, [likeStatus, id]);
  }
}
