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

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
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
  async updateOneBlog(@Param('id') id: string, @Body() body: UpdateBlogDto) {
    return await this.blogsService.updateBlog(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneBlog(@Param('id') id: string) {
    return await this.blogsService.deleteBlog(id);
  }
}
