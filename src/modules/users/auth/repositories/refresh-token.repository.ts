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

  //    async findByRefreshToken(refreshToken: string) {
  //     return await this.refreshTokensModel.findOne({ refreshToken });
  //   }

  //    async deleteRefreshToken(id: string) {
  //     return await this.refreshTokensModel.deleteOne({ _id: id });
  //   }
}
