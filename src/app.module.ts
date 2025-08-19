import { configModule } from './dynamic-config-module';
import { CoreModule } from './core/core.module';
import { DynamicModule, Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { CoreConfig } from './core/core.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { CustomDomainHttpExceptionsFilter } from './setup/exceptions/filters/custom-domain-exceptions.filter';
import { TestingModule } from './modules/testing/testing.module';
import { BlogersPlatformModule } from './modules/blogers-platform/blogers-platform.module';
import { User } from './modules/users/users/entitys/users.entity';
import { EmailConfirmation } from './modules/users/users/entitys/email-confirmations.entity';
import { RefreshTokens } from './modules/users/auth/entyties/refresh-token.entity';
import { Devices } from './modules/users/devices/entities/devices.entity';
import { Blog } from './modules/blogers-platform/blogs/entitys/blog.entity';
import { Post } from './modules/blogers-platform/posts/entity/post.entity';
import { PostsReactions } from './modules/blogers-platform/posts/entity/posts_reactions.entity';
import { Comments } from './modules/blogers-platform/comments/entitys/comments.entitys';
import { CommentLikes } from './modules/blogers-platform/comments/entitys/comments-likes.entity';
import { QuizModule } from './modules/quiz-module/quiz.module';
import { Questions } from './modules/quiz-module/entitys/questions.entitys';

@Module({
  imports: [CoreModule, configModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomDomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    const modules: any[] = [
      TypeOrmModule.forRootAsync({
        imports: [CoreModule],
        useFactory: (coreConfig: CoreConfig) => {
          return {
            type: 'postgres',
            host: coreConfig.db_host,
            port: coreConfig.db_port,
            username: coreConfig.db_username,
            password: coreConfig.db_password,
            database: coreConfig.db_name,
            entities: [
              User,
              EmailConfirmation,
              RefreshTokens,
              Devices,
              Blog,
              Post,
              PostsReactions,
              Comments,
              CommentLikes,
              Questions
            ],
            autoLoadEntities: true,
            synchronize: true,
            logging: true,
            logger: 'formatted-console',
            // ssl: true, ДЛЯ ПОДКЛЮЧЕНИЯ К Neon
            // extra: {
            //   ssl: {
            //     rejectUnauthorized: false
            //   }
            // }
          };
        },
        inject: [CoreConfig],
      }),
      BlogersPlatformModule,
      UsersModule,
      QuizModule,
      TestingModule,
    ];
    return {
      module: AppModule,
      imports: modules,
    };
  }
}
