import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsNumber, validateSync } from 'class-validator';

@Injectable()
export class CoreConfig {
  @IsNotEmpty({ message: 'Port не может быть пустым' })
  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 4200',
    },
  )
  port: number;

  @IsNotEmpty({ message: 'DB_HOST не может быть пустым' })
  db_host: string;

  @IsNotEmpty({ message: 'DB_PORT не может быть пустым' })
  db_port: number;

  @IsNotEmpty({ message: 'DB_USERNAME не может быть пустым' })
  db_username: string;

  @IsNotEmpty({ message: 'DB_PASSWORD не может быть пустым' })
  db_password: string;

  @IsNotEmpty({ message: 'DB_NAME не может быть пустым' })
  db_name: string;

  constructor(private configService: ConfigService<any, true>) {
    this.port = Number(this.configService.get('PORT'));
    this.db_host = this.configService.get('DB_HOST');
    this.db_port = this.configService.get('DB_PORT');
    this.db_username = this.configService.get('DB_USERNAME');
    this.db_password = this.configService.get('DB_PASSWORD');
    this.db_name = this.configService.get('DB_NAME');

    const errors = validateSync(this);
    if (errors.length > 0) {
      const sortedMessages = errors
        .map((error) => {
          const currentValue = error.value;
          const constraints = Object.values(error.constraints || {}).join(', ');
          return `😵 ${constraints} (current value: ${currentValue})`;
        })
        .join('; ');
      throw new Error('❌ Validation failed: ' + sortedMessages);
    }
  }
}
