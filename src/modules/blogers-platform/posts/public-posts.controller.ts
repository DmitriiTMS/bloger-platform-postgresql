import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetPostsQueryParams } from './paginate/get-posts-query-params.input-dto';
import { PostsQueryRepository } from './repository/posts-query.repository';
import { IdParamPostDto } from './dto/param/id-param.dto';
import { JwtAuthGuard } from '../../../modules/users/auth/guards/jwt-auth.guard';
import { PostCommentCreateDto } from './dto/post-comment-create.dto';
import { PostIdParamDto } from './dto/param/postId-param.dto';
import { ExtractUserIfExistsFromRequest } from '../../../modules/users/users/decorators/extract-user-if-exists-from-request.decorator';
import { PostDataCommentCreateDto } from './dto/post-data-comment-create.dto';
import { PostsService } from './posts.service';
import { NewCommentDB } from '../comments/types/types-comments';
import { LikeStatus } from '../types-reaction';
import { PostReactionBodyDto } from './dto/reaction/post-reaction-body.dto';
import { PostDataReactionDto } from './dto/reaction/post-reaction-data.dto';
import { AuthorizationCheckGuard } from '../../../modules/users/auth/guards/authorization-check.guard';

@Controller('posts')
export class PublicPostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  @Get()
  @UseGuards(AuthorizationCheckGuard)
  @HttpCode(HttpStatus.OK)
  async getAllPosts( 
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: { userId: number }) {
    return await this.postsQueryRepository.getAllPosts(query, user?.userId);
  }

  @Get(':id')
  @UseGuards(AuthorizationCheckGuard)
  @HttpCode(HttpStatus.OK)
  async getPostById(
    @Param() param: IdParamPostDto,
     @ExtractUserIfExistsFromRequest() user: { userId: number }
  ) {
    await this.postsQueryRepository.getPostByIdOrNotFoundFail(param.id);
    return await this.postsQueryRepository.getOneWithReactions(param.id, user?.userId);
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommentsByPostId(
    @Body() body: PostCommentCreateDto,
    @Param() param: PostIdParamDto,
    @ExtractUserIfExistsFromRequest() user: { userId: number },
  ) {
    const data: PostDataCommentCreateDto = {
      content: body.content,
      postId: param.postId,
      userId: user.userId,
    };
    const newComment = await this.postsService.createCommentsByPostId(data);
    return this.mapCommentDBToCommentView(newComment);
  }

  @Put(':postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async addReactionPost(
    @Body() body: PostReactionBodyDto,
    @Param() param: PostIdParamDto,
    @ExtractUserIfExistsFromRequest() user: { userId: number },
  ) {
    const postDataReactionDto: PostDataReactionDto = {
      status: body.likeStatus,
      postId: param.postId,
      userId: user.userId,
      created_at: new Date().toISOString()
    };

    await this.postsService.addReaction(postDataReactionDto);
  }

  
  @Get(':postId/comments')
  @UseGuards(AuthorizationCheckGuard)
  @HttpCode(HttpStatus.OK)
  async getAllCommentsByPostId(
    @Param() param: PostIdParamDto,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: { userId: number }
  ) {

    return await this.postsQueryRepository.getAllCommentsByPostId(
      param.postId,
      query,
      user?.userId
    );
  }

  mapCommentDBToCommentView(comment: NewCommentDB) {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: String(comment.userId),
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: LikeStatus.NONE,
      },
    };
  }
}
