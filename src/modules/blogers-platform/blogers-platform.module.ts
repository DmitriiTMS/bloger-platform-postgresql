import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/repositories/blogs.repository';

@Module({
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository],
})
export class BlogersPlatformModule {}
