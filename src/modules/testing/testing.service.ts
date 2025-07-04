import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteAll() {
    await this.dataSource.query('TRUNCATE TABLE "email_confirmations" CASCADE');
    await this.dataSource.query('TRUNCATE TABLE "users" CASCADE');
    await this.dataSource.query('TRUNCATE TABLE "devices"');
    await this.dataSource.query('TRUNCATE TABLE "refresh_tokens"');
    await this.dataSource.query('TRUNCATE TABLE "posts" CASCADE');
    await this.dataSource.query('TRUNCATE TABLE "blogs" CASCADE');
    await this.dataSource.query('TRUNCATE TABLE "comment_likes" CASCADE');
    await this.dataSource.query('TRUNCATE TABLE "comments" CASCADE');
  }
}
