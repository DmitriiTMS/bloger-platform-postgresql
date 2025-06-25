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

@Controller('sa/blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @Get()
  getAllBlogs() {
    return 'getAllBlogs';
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: CreateBlogDto) {
    const cretedBlog = await this.blogsService.createBlog(body);
    return cretedBlog
  }
}
