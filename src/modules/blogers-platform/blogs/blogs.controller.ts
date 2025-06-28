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
  getAllBlogs() {
    return 'getAllBlogs';
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
}
