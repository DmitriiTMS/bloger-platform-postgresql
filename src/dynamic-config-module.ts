import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

export const configModule = ConfigModule.forRoot({
  envFilePath: [
    join(__dirname, `env`, `.env.${process.env.NODE_ENV}.local`),
    join(__dirname, `env`, `.env.${process.env.NODE_ENV}`),
    join(__dirname, `env`, '.env.production'), // сначала берутся отсюда значение
  ],
  isGlobal: true,
});