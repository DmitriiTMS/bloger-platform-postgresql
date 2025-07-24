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
import { UsersTormRepository } from './typeOrmRepository/users-torm.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entitys/users.entity';
import { EmailConfirmation } from './users/entitys/email-confirmations.entity';
import { RefreshTokens } from './auth/entyties/refresh-token.entity';
import { RefreshTokenRepositoryTORM } from './typeOrmRepository/refresh-token-torm.repository';
import { Devices } from './devices/entities/devices.entity';
import { DevicesRepositoryTORM } from './typeOrmRepository/devices-torm.repository';
import { AuthQueryRepositoryTORM } from './typeOrmRepository/query-torm-repository/auth-query-torm.repository';
import { UsersQueryRepositoryTORM } from './typeOrmRepository/query-torm-repository/user-query-torm.repository';

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
  // Type ORM
  UsersTormRepository,
  RefreshTokenRepositoryTORM,
  DevicesRepositoryTORM,
  AuthQueryRepositoryTORM,
  UsersQueryRepositoryTORM
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
    // ThrottlerModule.forRoot({
    //   throttlers: [
    //     {
    //       ttl: 10000, // Время окна в секундах
    //       limit: 5, // Максимум 5 запросов
    //     },
    //   ],
    // }),
    TypeOrmModule.forFeature([User, EmailConfirmation, RefreshTokens, Devices])
  ],
  controllers: [UsersController, AuthController, DevicesController],
  providers: [
    ...adapters,
    {
      provide: provideTokens.ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (configService: ConfigService): JwtService => {
        return new JwtService({
          secret: configService.get('ACCESS_TOKEN_SECRET'),
          signOptions: { expiresIn: configService.get('TIME_ACCESS_TOKEN') },
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
          signOptions: { expiresIn: configService.get('TIME_REFRESH_TOKEN') },
          verifyOptions: { ignoreExpiration: false },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [UsersRepository],
})
export class UsersModule {}
