import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { randomUUID } from 'crypto';
import { add } from 'date-fns/add';
import { UsersService } from '../users/users.service';
import { EmailService } from './other-service/email.service';
import { Bcrypt } from '../users/utils/bcrypt';
import { UsersRepository } from '../users/users.repository';
import { UserViewDto } from '../users/dto/user-view.dto';
import { provideTokens } from './settings/provide-tokens';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { DevicesRepository } from './repositories/devices.repository';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private usersRepository: UsersRepository,
    @Inject(provideTokens.ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessJwtService: JwtService,
    @Inject(provideTokens.REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshJwtService: JwtService,
    private refreshTokenRepository: RefreshTokenRepository,
    private devicesRepository: DevicesRepository
  ) {}

  async loginUser(
    userViewDto: { id: string; login: string },
    infoDevice: { ip?: string; title?: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.accessJwtService.sign({
      userId: userViewDto.id,
      userLogin: userViewDto.login,
    });

    const deviceId = randomUUID();
    const refreshToken = this.refreshJwtService.sign({
      userId: userViewDto.id,
      userLogin: userViewDto.login,
      deviceId: deviceId,
    });

    await this.refreshTokenRepository.addRefreshToken({ refreshToken });
    await this.createDeviceUsers(refreshToken, infoDevice.ip!, infoDevice.title!);

    return {
      accessToken,
      refreshToken,
    };
  }

  async registerUser(userCreateDto: CreateUserDto) {
    const code = randomUUID();
    const emailConfirmation = {
      confirmationCode: code,
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 30,
      }),
      isConfirmed: false,
    };

    await this.usersService.create(userCreateDto, emailConfirmation);
    await this.emailService.registerUserAndResendingEmail(
      userCreateDto.email,
      code,
    );
  }

  async createDeviceUsers(refreshToken: string, ip: string, title: string) {
    const decodeRefreshToken = await this.verifyAndDecodedRefreshToken(refreshToken);

    if (!ip || !title) {
      throw new BadRequestException('IP или title не переданы');
    }

    const session = {
      ip: ip === '::1' ? '127.0.0.1' : ip,
      title,
      lastActiveDate: new Date(decodeRefreshToken.iat! * 1000).toISOString(),
      deviceId: decodeRefreshToken?.deviceId,
      userId: decodeRefreshToken.userId,
      expirationDateRefreshToken: new Date(
        decodeRefreshToken.exp! * 1000,
      ).toISOString(),
      refreshToken,
      createdAt: new Date().toISOString(),
    };

    await this.devicesRepository.createSession(session);
    return true;
  }

async verifyAndDecodedRefreshToken(refreshToken: string) {
    try {
      // 1. Проверяем токен
      const decodeRefreshToken =
        await this.refreshJwtService.verify(refreshToken);

      // 2. Проверяем payload - ОПЦИОНАЛЬНО!!!!!!
      if (!decodeRefreshToken?.userId || !decodeRefreshToken?.userLogin) {
        throw new UnauthorizedException('INVALID_TOKEN_PAYLOAD');
      }
      return decodeRefreshToken;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
      }
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }
  }

  async validateUser(loginOrEmail: string, password: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await Bcrypt.comparePasswords({
      password,
      hash: user.hashPassword,
    });
    if (!isPasswordValid) {
      return null;
    }

    const userView = UserViewDto.mapToView(user);
    return userView;
  }
}
