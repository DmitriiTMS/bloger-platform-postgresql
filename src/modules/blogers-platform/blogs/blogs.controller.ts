import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../modules/users/users/guards/basic-auth.guard';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './repositories/blogs-query.repository';
import { Blog } from './types/blogs-types';

@Controller('sa/blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository
  ) {}

  @Get()
  getAllBlogs() {
    return 'getAllBlogs';
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: CreateBlogDto): Promise<Blog> {
    const blogId = await this.blogsService.createBlog(body);
    return await this.blogsQueryRepository.getOne(blogId)
  }
}
