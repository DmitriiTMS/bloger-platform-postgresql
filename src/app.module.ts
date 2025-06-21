import { configModule } from './dynamic-config-module';
import { CoreModule } from './core/core.module';
import { DynamicModule, Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { CoreConfig } from './core/core.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { CustomDomainHttpExceptionsFilter } from './setup/exceptions/filters/custom-domain-exceptions.filter';
import { TestingModule } from './modules/testing/testing.module';


@Module({
  imports: [CoreModule, configModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomDomainHttpExceptionsFilter,
    }
  ],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule>{
    const modules: any[] = [
      TypeOrmModule.forRootAsync({
        imports:[CoreModule],
        useFactory: (coreConfig: CoreConfig) => {
          return {
            type: 'postgres',
            host: coreConfig.db_host,
            port: coreConfig.db_port,
            username: coreConfig.db_username,
            password: coreConfig.db_password,
            database: coreConfig.db_name,
            autoLoadEntities: false,
            synchronize: false,
            // ssl: true, ДЛЯ ПОДКЛЮЧЕНИЯ К Neon
            // extra: {
            //   ssl: {
            //     rejectUnauthorized: false
            //   }
            // }
          }
        },
        inject: [CoreConfig]
      }),
       UsersModule,
      TestingModule
    ]
    return {
      module: AppModule,
      imports: modules, 
    };
  }
}
