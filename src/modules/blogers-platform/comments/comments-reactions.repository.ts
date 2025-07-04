import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentDataReactionDto } from './dto/comment-data-reaction.dto';
import { LikeStatus } from '../types-reaction';

@Injectable()
export class CommentsReactionsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async reactionForCommentIdAndUserId(commentId: number, userId: number) {
    const query = `SELECT * FROM "comment_likes" WHERE "comment_id" = $1 AND "user_id" = $2 LIMIT 1`;
    const result = await this.dataSource.query(query, [commentId, userId]);
    
    return result[0] || null;
  }

  async saveInCommentReaction(dataReaction: CommentDataReactionDto) {
    const query = `
        INSERT INTO "comment_likes"
            ("comment_id", "user_id", "status")
        VALUES
            ($1, $2, $3)
    `;

    await this.dataSource.query(query, [
      dataReaction.commentId,
      dataReaction.userId,
      dataReaction.status,
    ]);
  }

  async commentsLikeCount(commentId: number, status: LikeStatus.LIKE) {
    const query = `SELECT COUNT(*) 
      FROM "comment_likes"
      WHERE "comment_id" = $1 AND "status" = $2
  `;

    const result = await this.dataSource.query(query, [commentId, status]);
    return parseInt(result[0].count, 10);
  }

  async commentsDislikeCount(commentId: number, status: LikeStatus.DISLIKE) {
    const query = `SELECT COUNT(*) 
      FROM "comment_likes"
      WHERE "comment_id" = $1 AND "status" = $2
  `;

    const result = await this.dataSource.query(query, [commentId, status]);
    return parseInt(result[0].count, 10);
  }

  async updateCommentReaction(id: string, likeStatus: LikeStatus) {
    const query = `UPDATE "comment_likes"
        SET "status" = $1
        WHERE "id" = $2
      `;
    await this.dataSource.query(query, [likeStatus, id]);
  }
}
