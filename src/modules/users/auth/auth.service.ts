import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import { DevicesRepository } from '../devices/devices.repository';
import { RegistrationConfirmationDto } from './dto/registration-confirmation.dto';
import { CustomDomainException } from '../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../setup/exceptions/filters/constants';
import { EmailConfirmationCodeSchema } from '../users/schemas/email-confirmations.schema';
import { RegistrationEmailEesendingDto } from './dto/registration-email-resending.dto';
import { NewPasswordDto } from './dto/new-password.dto';

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
    private devicesRepository: DevicesRepository,
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

  async registrationConfirmation(regConfirmDto: RegistrationConfirmationDto) {
    const user = await this.usersRepository.findBYCodeEmail(regConfirmDto.code);

    if (!user) {
      throw new CustomDomainException({
        errorsMessages: `User by ${regConfirmDto.code} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    if (user.isConfirmed) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: 'Confirmation code confirmed',
            field: 'code',
          },
        ],
      });
    }

    if (user.expirationDate < new Date()) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: 'Confirmation recoveryCode expired',
            field: 'code',
          },
        ],
      });
    }

    await this.usersRepository.updateUserIsConfirmed(user.userId);
  }

  async registerUser(userCreateDto: CreateUserDto) {
    const code = randomUUID();

    const emailConfirmation = EmailConfirmationCodeSchema.createInstance({
      confirmationCode: code,
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 30,
      }),
      isConfirmed: false,
    });

    await this.usersService.create(userCreateDto, emailConfirmation);
    this.emailService.registerUserAndResendingEmail(userCreateDto.email, code);
  }

  async registrationEmailResending(
    regEmailResDto: RegistrationEmailEesendingDto,
  ) {
    const user = await this.usersRepository.findByEmail(regEmailResDto.email);
    if (user.length === 0) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: `User by ${regEmailResDto.email} not found`,
            field: 'email',
          },
        ],
      });
    }

    const isConfirmCode = await this.usersRepository.findBYUserIdCodeEmail(
      user[0].id,
    );

    if (isConfirmCode.isConfirmed) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: 'Confirmation code confirmed',
            field: 'email',
          },
        ],
      });
    }

    const newConfirmationCode = randomUUID();
    await this.usersRepository.updateUserСonfirmationCode(
      user[0].id,
      newConfirmationCode,
    );
    this.emailService.registerUserAndResendingEmail(
      regEmailResDto.email,
      newConfirmationCode,
    );
  }

  async passwordRecovery(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (user.length === 0) {
      throw new CustomDomainException({
        errorsMessages: `User by ${email} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    const recoveryCode = randomUUID();
    await this.usersRepository.updateUserСonfirmationCode(
      user[0].id,
      recoveryCode,
    );
    await this.emailService.passwordRecovery(email, recoveryCode);
  }

  async newPassword(newPasswordDto: NewPasswordDto) {
    const user = await this.usersRepository.findBYCodeEmail(
      newPasswordDto.recoveryCode,
    );
    if (!user) {
      throw new CustomDomainException({
        errorsMessages: `User by ${newPasswordDto.recoveryCode} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    if (user.expirationDate < new Date()) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: 'Confirmation recoveryCode expired',
            field: 'recoveryCode',
          },
        ],
      });
    }

    const passwordHash = await Bcrypt.generateHash(newPasswordDto.newPassword);
    await this.usersRepository.updateUserPassword(user.userId, passwordHash);
  }

  async createDeviceUsers(refreshToken: string, ip: string, title: string) {
    const decodeRefreshToken =
      await this.verifyAndDecodedRefreshToken(refreshToken);

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

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token не передан в cookies');
    }

    const verifyRefreshToken = await this.verifyAndDecodedRefreshToken(refreshToken);

    const newAccessToken = this.accessJwtService.sign({
      userId: verifyRefreshToken.userId,
      userLogin: verifyRefreshToken.userLogin,
    });

    const newRefreshToken = this.refreshJwtService.sign({
      userId: verifyRefreshToken.userId,
      userLogin: verifyRefreshToken.userLogin,
      deviceId: verifyRefreshToken.deviceId,
    });

    const token = await this.refreshTokenRepository.findByRefreshToken(refreshToken);
    if (!token) {
      throw new UnauthorizedException('REFRESH_TOKEN_NOT_FOUND');
    }

    await this.refreshTokenRepository.deleteRefreshToken(token.id);
    await this.refreshTokenRepository.addRefreshToken({
      refreshToken: newRefreshToken,
    });

    const deviceIdByRefreshTokenDb = await this.devicesRepository.findByDevice(
      verifyRefreshToken.deviceId,
    );
    if (!deviceIdByRefreshTokenDb) {
      throw new UnauthorizedException('Не найден deviceId');
    }

    const decodeNewRefreshToken = await this.refreshJwtService.decode(newRefreshToken);
    await this.devicesRepository.updateSessionLastActiveDate(
      verifyRefreshToken.deviceId!,
      new Date(decodeNewRefreshToken.exp! * 1000).toISOString(), // новый срок истечения
      new Date(decodeNewRefreshToken.iat! * 1000).toISOString(), // новое lastActiveDate
      refreshToken,
      newRefreshToken,
    );

    return { newAccessToken, newRefreshToken };
  }

   async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token не передан в cookies');
    }

    const decodedRefreshToken = await this.verifyAndDecodedRefreshToken(refreshToken);

    const token = await this.refreshTokenRepository.findByRefreshToken(refreshToken);
    if (!token) {
      throw new UnauthorizedException('REFRESH_TOKEN_NOT_FOUND');
    }

    await this.refreshTokenRepository.deleteRefreshToken(token.id);
    await this.devicesRepository.deleteSessionByDeviceId(decodedRefreshToken.deviceId)
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
