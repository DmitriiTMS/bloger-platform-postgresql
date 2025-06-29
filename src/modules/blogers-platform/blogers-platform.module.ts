import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/repositories/blogs.repository';
import { BlogsQueryRepository } from './blogs/repositories/blogs-query.repository';
import { PublicPostsController } from './posts/public-posts.controller';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/repository/posts.repository';
import { PostsQueryRepository } from './posts/repository/posts-query.repository';
import { PublicBlogsController } from './blogs/public-blogs.controller';


@Module({
  controllers: [BlogsController, PublicBlogsController, PublicPostsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
  ],
})
export class BlogersPlatformModule {}
