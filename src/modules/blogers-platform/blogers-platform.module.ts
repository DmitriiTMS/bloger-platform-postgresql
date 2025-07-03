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
import { UsersModule } from '../users/users.module';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsQueryRepository } from './comments/comments-query.repository';
import { CommentsController } from './comments/comments.controller';
import { provideTokens } from '../users/auth/settings/provide-tokens';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CommentsService } from './comments/comments.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: '10m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    BlogsController,
    PublicBlogsController,
    PublicPostsController,
    CommentsController,
  ],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
  ],
})
export class BlogersPlatformModule {}
