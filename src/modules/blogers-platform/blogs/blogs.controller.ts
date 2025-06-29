import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../modules/users/users/guards/basic-auth.guard';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './repositories/blogs-query.repository';
import { Blog } from './types/blogs-types';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreatePostDto } from '../posts/dto/create-post.dto';
import { IdParamBlogDto } from './dto/param/id-param.dto';
import { BlogIdParamDto } from './dto/param/blogId-param.dto';
import { PostsQueryRepository } from '../posts/repository/posts-query.repository';
import { UpdatePostDto } from '../posts/dto/update-post.dto';
import { UpdatePostParamsDto } from './dto/param/update-post-param.dto';
import { PostsService } from '../posts/posts.service';
import { UpdatePostByBlogId } from '../posts/types/posts-types';
import { GetBlogsQueryParams } from './paginate/get-blogs-query-params';
import { GetPostsQueryParams } from '../posts/paginate/get-posts-query-params.input-dto';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllBlogs(@Query() query: GetBlogsQueryParams) {
    return await this.blogsQueryRepository.getAll(query)
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  async getAllPostsForBlogId(
    @Param() param: BlogIdParamDto,
    @Query() query: GetPostsQueryParams,
  ) {
    await this.blogsQueryRepository.getBlogByIdOrNotFoundFail(param.blogId)
    return await this.postsQueryRepository.getAllPostsByblogId(param.blogId, query)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: CreateBlogDto): Promise<Blog> {
    const blogId = await this.blogsService.createBlog(body);
    return await this.blogsQueryRepository.getOne(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOneBlog(
    @Param() param: IdParamBlogDto,
    @Body() body: UpdateBlogDto,
  ) {
    return await this.blogsService.updateBlog(param.id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneBlog(@Param() param: IdParamBlogDto) {
    return await this.blogsService.deleteBlog(param.id);
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(
    @Param() param: BlogIdParamDto,
    @Body() body: CreatePostDto,
  ) {
    const postId = await this.blogsService.createPostByBlogId(
      param.blogId,
      body,
    );
    return await this.postsQueryRepository.getPostWithBlogData(postId);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlogId(
    @Param() param: UpdatePostParamsDto,
    @Body() body: UpdatePostDto,
  ) {
    const dataForUpdatePost: UpdatePostByBlogId = {
      title: body.title,
      shortDescription: body.shortDescription,
      content: body.content,
      blogId: param.blogId,
      postId: param.postId,
    };
    return await this.postsService.updatePostBYBlogId(dataForUpdatePost);
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlogId(
    @Param() param: UpdatePostParamsDto
  ) {
    const dataForDeletePost: UpdatePostParamsDto = {
      blogId: param.blogId,
      postId: param.postId,
    };
    return await this.postsService.deletePostByBlogId(dataForDeletePost);
  }
}
