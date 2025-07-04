import { Injectable } from '@nestjs/common';
import {
  CommentDataReaction,
  CommentUpdateDataReaction,
} from './types/types-comments';
import { CustomDomainException } from '../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../setup/exceptions/filters/constants';
import { CommentsRepository } from './comments.repository';
import { CommentDataReactionDto } from './dto/comment-data-reaction.dto';
import { UsersRepository } from 'src/modules/users/users/users.repository';
import { CommentsReactionsRepository } from './comments-reactions.repository';
import { LikeStatus } from '../types-reaction';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
    private commentsReactionsRepository: CommentsReactionsRepository
  ) {}

  async updateOne(updateCommentDto: CommentUpdateDataReaction) {
    const { commentId } = updateCommentDto;

    await this.commentsRepository.getCommentByIdOrNotFoundFail(commentId);
    const isExistUserComment = await this.isExistUserComment(updateCommentDto);
    if (!isExistUserComment) {
      throw new CustomDomainException({
        errorsMessages: 'Пользователь пытается обновить не свой комментарий',
        customCode: DomainExceptionCode.Forbidden,
      });
    }
    await this.commentsRepository.updateComment(updateCommentDto);
  }

  async deleteOne(deleteCommentDto: CommentDataReaction) {
    const { commentId } = deleteCommentDto;

    const isExistUserComment = await this.isExistUserComment(deleteCommentDto);
    if (!isExistUserComment) {
      throw new CustomDomainException({
        errorsMessages: 'Пользователь пытается удалить не свой комментарий',
        customCode: DomainExceptionCode.Forbidden,
      });
    }
    await this.commentsRepository.deleteCommentById(commentId);
  }

  async addReaction(dataCommentReactionDto: CommentDataReactionDto) {
    const { status, commentId, userId } = dataCommentReactionDto;

    await this.commentsRepository.getCommentByIdOrNotFoundFail(commentId);
    
    const user = await this.usersRepository.findById(userId);
     
    if (!user[0]) {
      throw new CustomDomainException({
        errorsMessages: `User by id = ${userId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    const isReactionForCommentIdAndUserId =
      await this.commentsReactionsRepository.reactionForCommentIdAndUserId(
        commentId,
        userId,
      );

    if (!isReactionForCommentIdAndUserId) {
      await this.commentsReactionsRepository.saveInCommentReaction(dataCommentReactionDto);

      const [totalCountLike, totalCountDislike] = await Promise.all([
        this.commentsReactionsRepository.commentsLikeCount(
          commentId,
          LikeStatus.LIKE,
        ),
        this.commentsReactionsRepository.commentsDislikeCount(
          commentId,
          LikeStatus.DISLIKE,
        ),
      ]);
    
      
      await Promise.all([
        this.commentsRepository.likeCountUpdate(commentId, totalCountLike),
        this.commentsRepository.dislikeCountUpdate(
          commentId,
          totalCountDislike,
        ),
      ]);
      return;
    }

    if (status !== isReactionForCommentIdAndUserId.status) {
      await this.commentsReactionsRepository.updateCommentReaction(
        isReactionForCommentIdAndUserId.id,
        status,
      );
      const [totalCountLike, totalCountDislike] = await Promise.all([
        this.commentsReactionsRepository.commentsLikeCount(
          commentId,
          LikeStatus.LIKE,
        ),
        this.commentsReactionsRepository.commentsDislikeCount(
          commentId,
          LikeStatus.DISLIKE,
        ),
      ]);
      await Promise.all([
        this.commentsRepository.likeCountUpdate(commentId, totalCountLike),
        this.commentsRepository.dislikeCountUpdate(
          commentId,
          totalCountDislike,
        ),
      ]);
    }
  }

  async isExistUserComment(commentDto: CommentDataReaction): Promise<boolean> {
    const { commentId, userId } = commentDto;
    const comment =
      await this.commentsRepository.getCommentByIdOrNotFoundFail(commentId);

    if (comment.userId !== +userId) {
      return false;
    }
    return true;
  }
}
