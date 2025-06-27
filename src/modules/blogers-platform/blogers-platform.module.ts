import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/repositories/blogs.repository';
import { BlogsQueryRepository } from './blogs/repositories/blogs-query.repository';

@Module({
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
})
export class BlogersPlatformModule {}
