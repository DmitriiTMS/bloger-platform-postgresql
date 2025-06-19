import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CoreConfig {
  port: number;

  db_host: string;
  db_port: number;
  db_username: string;
  db_password: string
  db_name: string;

  constructor(private configService: ConfigService<any, true>) {
    this.port = Number(this.configService.get('PORT'));
    this.db_host = this.configService.get('DB_HOST');
    this.db_port = this.configService.get('DB_PORT');
    this.db_username = this.configService.get('DB_USERNAME');
    this.db_password = this.configService.get('DB_PASSWORD');
    this.db_name = this.configService.get('DB_NAME');
  }
}
