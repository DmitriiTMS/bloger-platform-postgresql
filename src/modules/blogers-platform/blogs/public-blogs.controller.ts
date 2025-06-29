import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { GetBlogsQueryParams } from './paginate/get-blogs-query-params';
import { BlogsQueryRepository } from './repositories/blogs-query.repository';
import { BlogIdParamDto } from './dto/param/blogId-param.dto';
import { GetPostsQueryParams } from '../posts/paginate/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../posts/repository/posts-query.repository';
import { IdParamBlogDto } from './dto/param/id-param.dto';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllBlogs(@Query() query: GetBlogsQueryParams) {
    return await this.blogsQueryRepository.getAll(query);
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  async getAllPostsForBlogId(
    @Param() param: BlogIdParamDto,
    @Query() query: GetPostsQueryParams,
  ) {
    await this.blogsQueryRepository.getBlogByIdOrNotFoundFail(param.blogId);
    return await this.postsQueryRepository.getAllPostsByblogId(
      param.blogId,
      query,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlogById(@Param() param: IdParamBlogDto) {
    return await this.blogsQueryRepository.getOne(param.id);
  }
}
