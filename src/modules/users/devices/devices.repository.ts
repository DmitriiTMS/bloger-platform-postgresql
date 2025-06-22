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
  createdAt: string;
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

  async findByDevice(deviceId: string) {
    const query = `
      SELECT * FROM "devices"
      WHERE "deviceId" = $1
      LIMIT 1
    `;
    const result = await this.dataSource.query(query, [deviceId]);
    return result[0] || null;
  }

  async updateSessionLastActiveDate(
    deviceId: string,
    dateExpired: string,
    lastActiveDate: string,
    oldRefreshToken: string,
    newRefreshToken: string,
  ) {
    const query = `
    UPDATE devices
    SET 
      "expirationDateRefreshToken" = $1,
      "lastActiveDate" = $2,
      "refreshToken" = $3
    WHERE 
      "deviceId" = $4 AND 
      "refreshToken" = $5
  `;

    const parameters = [
      dateExpired,
      lastActiveDate,
      newRefreshToken,
      deviceId,
      oldRefreshToken,
    ];

    await this.dataSource.query(query, parameters);
  }

  async deleteSessionsExceptCurrent(
    userId: string,
    currentRefreshToken: string,
  ) {
    const query = `
    DELETE FROM "devices"
    WHERE 
      "userId" = $1 AND
      "refreshToken" != $2
  `;

    const parameters = [userId, currentRefreshToken];
    await this.dataSource.query(query, parameters);
  }

  async getAllSessions(userId: string) {
    const query = `
    SELECT 
      ip,
      title,
      "lastActiveDate",
      "deviceId"
    FROM "devices"
    WHERE "userId" = $1
  `;

    const parameters = [userId];
    const sessions = await this.dataSource.query(query, parameters);

    return sessions;
  }

  async deleteSessionByDeviceId(deviceId: string) {
    const query = `
    DELETE FROM "devices"
    WHERE "deviceId" = $1
  `;
    const parameters = [deviceId];
    await this.dataSource.query(query, parameters);
  }
}
