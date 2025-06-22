import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { CoreConfig } from './core/core.config';
import { appSetup } from './setup/app.setup';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // из-за того, что нам нужно донастроить динамический AppModule, мы не можем сразу создавать приложение
  // а создаём сначала контекст
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  // как бы вручную инжектим в инициализацию модуля нужную зависимость, донастраивая динамический модуль
  const DynamicAppModule = await AppModule.forRoot(coreConfig);
  // и уже потом создаём на основе донастроенного модуля наше приложение
  const app = await NestFactory.create(DynamicAppModule);

  // Закрываем контекст, если он больше не нужен
  await appContext.close();

  console.log('process.env.PORT: ', coreConfig.port);
  appSetup(app);
  app.enableCors()
  app.use(cookieParser());
  await app.listen(coreConfig.port);
}
bootstrap();
