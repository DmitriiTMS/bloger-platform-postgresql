import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { DevicesRepository } from './devices.repository';
import { DevicesRepositoryTORM } from '../typeOrmRepository/devices-torm.repository';

@Injectable()
export class DevicesService {
  constructor(
    private authService: AuthService,
    private devicesRepository: DevicesRepository,
    private devicesRepositoryTORM: DevicesRepositoryTORM
  ) {}

  async getAll(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token не передан в cookies');
    }

     const verifyRefreshToken = await this.authService.verifyAndDecodedRefreshToken(refreshToken);
    //  const sessions = await this.devicesRepository.getAllSessions(verifyRefreshToken.userId)
    const sessions = await this.devicesRepositoryTORM.getAllSessions(verifyRefreshToken.userId)
     return sessions
  }

  async closeAllSessionsExceptCurrent(refreshToken: string) {
     if (!refreshToken) {
      throw new UnauthorizedException('Refresh token не передан в cookies');
    }
     const verifyRefreshToken = await this.authService.verifyAndDecodedRefreshToken(refreshToken);
    //  await this.devicesRepository.deleteSessionsExceptCurrent(
    //     verifyRefreshToken.userId,
    //     refreshToken
    //  )
     await this.devicesRepositoryTORM.deleteSessionsExceptCurrent(
        verifyRefreshToken.userId,
        refreshToken
     )
  }

  async closeOneSession(deviceId: string, refreshToken: string) {
    // const session = await this.devicesRepository.findByDevice(deviceId);
    const session = await this.devicesRepositoryTORM.findByDevice(deviceId);
    if (!session) {
      throw new NotFoundException("Session not found")
    }

    const verifyRefreshToken = await this.authService.verifyAndDecodedRefreshToken(refreshToken);
    if(session.user.id !== Number(verifyRefreshToken.userId)) {
        throw new ForbiddenException("Пользователь пытается удалить не свою сессию")
    }

    // await this.devicesRepository.deleteSessionByDeviceId(deviceId)
    await this.devicesRepositoryTORM.deleteSessionByDeviceId(deviceId)
  }
}