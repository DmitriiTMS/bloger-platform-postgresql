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

  async findByRefreshToken(refreshToken: string) {
    const result = await this.refreshTokensRepository.findOne({
      where: { refreshToken },
    });
    return result || null;
  }

  async deleteRefreshToken(id: number) {
    await this.refreshTokensRepository.softDelete({ id });
  }
}
