import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentUpdateDataReaction, NewComment } from './types/types-comments';
import { CustomDomainException } from '../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../setup/exceptions/filters/constants';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(newComment: NewComment) {
    const query = `
        INSERT INTO "comments"
            ("post_id", "content", "user_id", "user_login", "created_at", "likes_count", "dislikes_count")
        VALUES
            ($1, $2, $3, $4, $5::timestamp with time zone, $6, $7)
        RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      newComment.postId,
      newComment.content,
      newComment.userId,
      newComment.userLogin,
      newComment.createdAt,
      newComment.likesCount,
      newComment.dislikesCount,
    ]);

    if (!result || result.length === 0) {
      throw new Error('Failed to create post');
    }

    const res = {
      id: result[0].id,
      postId: result[0].post_id,
      content: result[0].content,
      userId: result[0].user_id,
      userLogin: result[0].user_login,
      createdAt: result[0].created_at,
      likesCount: result[0].likes_count,
      dislikesCount: result[0].dislikes_count,
    };

    return res;
  }

  async getCommentByIdOrNotFoundFail(commentId: number) {
    const query = `SELECT * FROM "comments" WHERE id = $1`;
    const comment = await this.dataSource.query(query, [commentId]);

    if (!comment || comment.length === 0) {
      throw new CustomDomainException({
        errorsMessages: `Comments by id == ${commentId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    const res = {
      id: comment[0].id,
      postId: comment[0].post_id,
      content: comment[0].content,
      userId: comment[0].user_id,
      userLogin: comment[0].user_login,
      createdAt: comment[0].created_at,
      likesCount: comment[0].likes_count,
      dislikesCount: comment[0].dislikes_count,
    };

    return res;
  }

  async updateComment(updatePostDto: CommentUpdateDataReaction) {
    const query = `
          UPDATE "comments"
          SET "content" = $1
          WHERE id = $2
      `;

    await this.dataSource.query(query, [
      updatePostDto.content,
      updatePostDto.commentId,
    ]);
  }

  async deleteCommentById(commentId: number) {
    const query = `DELETE FROM "comments" WHERE id = $1`;
    await this.dataSource.query(query, [commentId]);
  }

  async likeCountUpdate(commentId: number, count: number) {
    const query = `UPDATE "comments"
        SET "likes_count" = $1
        WHERE "id" = $2
      `;     
    await this.dataSource.query(query, [count, commentId]);
  }

  async dislikeCountUpdate(commentId: number, count: number) {
    const query = `UPDATE "comments"
        SET "dislikes_count" = $1
        WHERE "id" = $2
      `;
    await this.dataSource.query(query, [count, commentId]);
  }
}
