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

@Controller('posts')
export class PublicPostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPosts(@Query() query: GetPostsQueryParams) {
    return await this.postsQueryRepository.getAllPosts(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param() param: IdParamPostDto) {
    await this.postsQueryRepository.getPostByIdOrNotFoundFail(param.id);
    return await this.postsQueryRepository.getPostWithBlogData(param.id);
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
    };

    await this.postsService.addReaction(postDataReactionDto);
  }

  mapCommentDBToCommentView(comment: NewCommentDB) {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
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
