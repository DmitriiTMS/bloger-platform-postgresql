import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokens } from '../auth/entyties/refresh-token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshTokenRepositoryTORM {
  constructor(
    @InjectRepository(RefreshTokens)
    private readonly refreshTokensRepository: Repository<RefreshTokens>,
  ) {}

  async addRefreshToken(refreshToken: { refreshToken: string }): Promise<void> {
    await this.refreshTokensRepository.save({
      refreshToken: refreshToken.refreshToken,
    });
  }

  //   async findByRefreshToken(refreshToken: string) {
  //     const query = 'SELECT * FROM "refresh_tokens" WHERE "refreshToken" = $1';
  //     const result = await this.dataSource.query(query, [refreshToken]);
  //     return result[0] || null;
  //   }

  //   async deleteRefreshToken(id: string) {
  //     const query = 'DELETE FROM "refresh_tokens" WHERE id = $1';
  //     await this.dataSource.query(query, [Number(id)]);
  //   }
}
