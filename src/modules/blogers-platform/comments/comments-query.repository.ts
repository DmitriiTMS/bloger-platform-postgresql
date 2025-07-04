import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { CustomDomainException } from '../../../setup/exceptions/custom-domain.exception';
import { DataSource } from 'typeorm';
import { DomainExceptionCode } from '../../../setup/exceptions/filters/constants';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

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

  async reactionForCommentIdAndUserId(commentId: number, userId: number) {
    const query = `SELECT * FROM "comment_likes" WHERE "comment_id" = $1 AND "user_id" = $2 LIMIT 1`;
    const result = await this.dataSource.query(query, [commentId, userId]);

    return result[0] || null;
  }
}
