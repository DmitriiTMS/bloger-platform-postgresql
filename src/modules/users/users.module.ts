import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersRepository } from './users/users.repository';
import { UsersQueryRepository } from './users/users.query-repository';
import { AuthRepository } from './auth/auth.repository';
import { EmailService } from './auth/other-service/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { provideTokens } from './auth/settings/provide-tokens';
import { RefreshTokenRepository } from './auth/repositories/refresh-token.repository';
import { DevicesRepository } from './devices/devices.repository';
import { LocalStrategy } from './auth/strategy/local.strategy';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { AuthQueryRepository } from './auth/auth-query.repository';
import { ThrottlerModule } from '@nestjs/throttler';
import { DevicesController } from './devices/devices.controller';
import { DevicesService } from './devices/devices.service';

const adapters = [
  UsersService,
  UsersRepository,
  UsersQueryRepository,
  AuthService,
  AuthRepository,
  AuthQueryRepository,
  EmailService,
  RefreshTokenRepository,
  DevicesService,
  DevicesRepository,
  LocalStrategy,
  JwtStrategy,
];

@Module({
  imports: [
    PassportModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
              user: configService.get('EMAIL'),
              pass: configService.get('EMAIL_PASSWORD'),
            },
            tls: {
              rejectUnauthorized: false, // Только для тестов! В продакшене должно быть true
              minVersion: 'TLSv1.2',
              ciphers: 'SSLv3',
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000, // Время окна в секундах
          limit: 5, // Максимум 5 запросов
        },
      ],
    }),
  ],
  controllers: [UsersController, AuthController, DevicesController],
  providers: [
    ...adapters,
    {
      provide: provideTokens.ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (configService: ConfigService): JwtService => {
        return new JwtService({
          secret: configService.get('ACCESS_TOKEN_SECRET'),
          signOptions: { expiresIn: '10s' },
          verifyOptions: { ignoreExpiration: false },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: provideTokens.REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (configService: ConfigService): JwtService => {
        return new JwtService({
          secret: configService.get('REFRESH_TOKEN_SECRET'),
          signOptions: { expiresIn: '20s' },
          verifyOptions: { ignoreExpiration: false },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class UsersModule {}
