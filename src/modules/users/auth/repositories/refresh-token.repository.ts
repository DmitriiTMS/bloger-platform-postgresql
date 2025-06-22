import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class RefreshTokenRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async addRefreshToken(refreshToken: { refreshToken: string }): Promise<void> {
    const query = `INSERT INTO "refresh_tokens" ("refreshToken", "createdAt") VALUES ($1, NOW())`;
    await this.dataSource.query(query, [refreshToken.refreshToken]);
  }

  async findByRefreshToken(refreshToken: string) {
    const query = 'SELECT * FROM "refresh_tokens" WHERE "refreshToken" = $1';
    const result = await this.dataSource.query(query, [refreshToken]);
    return result[0] || null;
  }

  async deleteRefreshToken(id: string) {
    const query = 'DELETE FROM "refresh_tokens" WHERE id = $1';
    await this.dataSource.query(query, [Number(id)]);
  }
}
