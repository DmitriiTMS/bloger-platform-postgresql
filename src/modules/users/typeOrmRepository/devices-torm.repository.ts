import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Devices } from '../devices/entities/devices.entity';
import { Repository } from 'typeorm';

type SessionDevice = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  userId: number;
  expirationDateRefreshToken: string;
  refreshToken: string;
};

@Injectable()
export class DevicesRepositoryTORM {
  constructor(
    @InjectRepository(Devices)
    private readonly devicesRepository: Repository<Devices>,
  ) {}

  async createSession(session: SessionDevice) {
    const sessionItem = await this.devicesRepository.save({
      ip: session.ip,
      title: session.title,
      lastActiveDate: session.lastActiveDate,
      deviceId: session.deviceId,
      userId: session.userId,
      expirationDateRefreshToken: session.expirationDateRefreshToken,
      refreshToken: session.refreshToken,
    });

    console.log('sessionItem === ', sessionItem);
    

    return sessionItem
  }
}
