import { configModule } from './dynamic-config-module';
import { CoreModule } from './core/core.module';
import { DynamicModule, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CoreConfig } from './core/core.config';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [CoreModule, configModule],
  providers: [],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule>{
    const modules: any[] = [
      UsersModule,
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
          }
        },
        inject: [CoreConfig]
      })
    ]
    return {
      module: AppModule,
      imports: modules, 
    };
  }
}
