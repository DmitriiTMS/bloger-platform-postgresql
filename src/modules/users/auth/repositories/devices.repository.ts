import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

type SessionDevice = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  userId: string;
  expirationDateRefreshToken: string;
  refreshToken: string;
  createdAt: string
};

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createSession(session: SessionDevice) {
    const query = `INSERT INTO "devices" (
      "ip",
      "title",
      "lastActiveDate",
      "deviceId",
      "userId",
      "expirationDateRefreshToken",
      "refreshToken",
      "createdAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING 
      "ip",
      "title",
      "lastActiveDate" AS "lastActiveDate",
      "deviceId" AS "deviceId",
      "userId" AS "userId",
      "expirationDateRefreshToken" AS "expirationDateRefreshToken",
      "refreshToken" AS "refreshToken",
      "createdAt" AS "createdAt"
  `;

    const result = await this.dataSource.query(query, [
      session.ip,
      session.title,
      session.lastActiveDate,
      session.deviceId,
      session.userId,
      session.expirationDateRefreshToken,
      session.refreshToken,
      session.createdAt,
    ]);

    return result[0];
  }

  //   async findByDevice(deviceId: string) {
  //     return await this.devicesModel.findOne({ deviceId });
  //   }

  //   async updateSessionLastActiveDate(
  //     deviceId: string,
  //     dateExpired: string,
  //     lastActiveDate: string,
  //     oldRefreshToken: string,
  //     newRefreshToken: string,
  //   ) {
  //     return await this.devicesModel.updateOne(
  //       { deviceId, refreshToken: oldRefreshToken },
  //       {
  //         $set: {
  //           expirationDateRefreshToken: dateExpired,
  //           lastActiveDate,
  //           refreshToken: newRefreshToken,
  //         },
  //       },
  //     );
  //   }

  //   async deleteSessionsExceptCurrent(
  //     userId: string,
  //     currentRefreshToken: string,
  //   ) {
  //     return await this.devicesModel.deleteMany({
  //       userId,
  //       refreshToken: { $ne: currentRefreshToken },
  //     });
  //   }

  //   async getAllSessions(userId: string) {
  //     return await this.devicesModel
  //       .find({ userId })
  //       .select('ip title lastActiveDate deviceId')
  //       .lean();
  //   }

  //   async deleteSessionByDeviceId(deviceId: string) {
  //     return await this.devicesModel.deleteOne({ deviceId });
  //   }
}
