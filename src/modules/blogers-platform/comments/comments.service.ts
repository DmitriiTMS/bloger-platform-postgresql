import { Injectable } from '@nestjs/common';
import { CommentDataReaction, CommentUpdateDataReaction } from './types/types-comments';
import { CustomDomainException } from '../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../setup/exceptions/filters/constants';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentsService {
  constructor(private commentsRepository: CommentsRepository) {}

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
