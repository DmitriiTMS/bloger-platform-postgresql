import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteAll() {
    await this.dataSource.query('TRUNCATE TABLE "users"');
    await this.dataSource.query('TRUNCATE TABLE "devices"');
    await this.dataSource.query('TRUNCATE TABLE "refresh_tokens"');
  }
}
