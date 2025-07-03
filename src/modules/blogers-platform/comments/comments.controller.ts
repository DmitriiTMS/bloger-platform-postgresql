import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthorizationCheckGuard } from '../../../modules/users/auth/guards/authorization-check.guard';
import { IdParamCommentDto } from './dto/id-param.dto';
import { ExtractUserIfExistsFromRequest } from '../../../modules/users/users/decorators/extract-user-if-exists-from-request.decorator';
import { LikeStatus } from '../types-reaction';
import { CommentsQueryRepository } from './comments-query.repository';
import {
  CommentDataReaction,
  CommentUpdateDataReaction,
  NewCommentDB,
} from './types/types-comments';
import { JwtAuthGuard } from '../../../modules/users/auth/guards/jwt-auth.guard';
import { CommentIdParamDto } from './dto/comment-id-param';
import { CommentsService } from './comments.service';
import { CommentUpdateDto } from './dto/comment-update.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
  ) {}

  @Get(':id')
  @UseGuards(AuthorizationCheckGuard)
  @HttpCode(HttpStatus.OK)
  async getOneComment(
    @Param() param: IdParamCommentDto,
    @ExtractUserIfExistsFromRequest() user: { userId: number },
  ) {
    const comment =
      await this.commentsQueryRepository.getCommentByIdOrNotFoundFail(param.id);
    let userStatus = LikeStatus.NONE;

    // if (user?.userId) {
    //   const reactionUser = await this.commentsQueryReactionsRepository.reactionForCommentIdAndUserId(id, user.userId);
    //   userStatus = reactionUser?.status || LikeStatus.NONE;
    // }
    // return this.mapToViewComment(comment, userStatus);
    return this.mapToViewComment(comment, userStatus);
  }

  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOneComment(
    @Body() body: CommentUpdateDto,
    @Param() param: CommentIdParamDto,
    @ExtractUserIfExistsFromRequest() user: { userId: number },
  ) {
    const dataUpdateComment: CommentUpdateDataReaction = {
      content: body.content,
      commentId: param.commentId,
      userId: user.userId,
    };
    await this.commentsService.updateOne(dataUpdateComment);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneComment(
    @Param() param: CommentIdParamDto,
    @ExtractUserIfExistsFromRequest() user: { userId: number },
  ) {
    const dataDeleteComment: CommentDataReaction = {
      commentId: param.commentId,
      userId: user.userId,
    };

    await this.commentsService.deleteOne(dataDeleteComment);
  }

  mapToViewComment(commentDB: NewCommentDB, status: LikeStatus) {
    return {
      id: commentDB.id,
      content: commentDB.content,
      commentatorInfo: {
        userId: commentDB.userId,
        userLogin: commentDB.userLogin,
      },
      createdAt: commentDB.createdAt,
      likesInfo: {
        likesCount: commentDB.likesCount,
        dislikesCount: commentDB.dislikesCount,
        myStatus: status,
      },
    };
  }
}
