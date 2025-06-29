import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { GetPostsQueryParams } from './paginate/get-posts-query-params.input-dto';
import { PostsQueryRepository } from './repository/posts-query.repository';
import { IdParamPostDto } from './dto/param/id-param.dto';

@Controller('posts')
export class PublicPostsController {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

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
}
