import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSchema } from './schemas/users.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailConfirmationCodeSchema } from './schemas/email-confirmations.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(
    user: UserSchema,
    emailConfirmation?: EmailConfirmationCodeSchema,
  ) {
    const createdUser = await this.dataSource.query(
      `INSERT INTO "users"("login", "email", "hashPassword", "createdAt")
      VALUES ($1, $2, $3, $4::timestamp with time zone)
      RETURNING "id", "login", "email", "createdAt" `,
      [user.login, user.email, user.hashPassword, user.createdAt],
    );

    const userId = createdUser[0].id;
    const confirmationInsertQuery = `  
            INSERT INTO "email_confirmations" (  
                "userId",  
                "confirmationCode",  
                "expirationDate",  
                "isConfirmed",
                "createdAt"
            ) VALUES ($1, $2, $3, $4, $5::timestamp with time zone);  
        `;

    const confirmationValues = [
      userId,
      emailConfirmation?.confirmationCode || null,
      emailConfirmation?.expirationDate || null,
      emailConfirmation?.isConfirmed,
      emailConfirmation?.createdAt || null,
    ];

    await this.dataSource.query(confirmationInsertQuery, confirmationValues);
    return {
      id: createdUser[0]['id'],
      login: createdUser[0]['login'],
      email: createdUser[0]['email'],
      createdAt: createdUser[0]['createdAt'],
    };
  }

  async findByLogin(login: string) {
    return await this.dataSource.query(
      `SELECT * FROM "users" WHERE login = ($1)`,
      [login],
    );
  }

  async findByEmail(email: string) {
    return await this.dataSource.query(
      `SELECT * FROM "users" WHERE email = ($1)`,
      [email],
    );
  }

  async findById(id: string) {
    return await this.dataSource.query(
      `SELECT * FROM "users" WHERE id = ($1)`,
      [id],
    );
  }

  async delete(id: string) {
    const userById = await this.findById(id);
    if (userById.length == 0) {
      throw new NotFoundException(`User с ${id} не найден`);
    }

    return await this.dataSource.query(`DELETE FROM "users" WHERE id = ($1)`, [
      id,
    ]);
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const query = `SELECT * FROM "users" WHERE email = $1 OR login = $1 LIMIT 1`;
    const result = await this.dataSource.query(query, [loginOrEmail]);
    return result[0] || null;
  }

  async findBYCodeEmail(code: string) {
    const query = `SELECT * FROM "email_confirmations" WHERE "confirmationCode" = $1`;
    const result = await this.dataSource.query(query, [code]);
    return result[0] || null;
  }

   async findBYUserIdCodeEmail(userId: string) {
    const query = `SELECT * FROM "email_confirmations" WHERE "userId" = $1`;
    const result = await this.dataSource.query(query, [userId]);
    return result[0] || null;
  }

  async updateUserIsConfirmed(userId: string) {
    return await this.dataSource.query(
      `UPDATE "email_confirmations" 
      SET "isConfirmed" = true 
      WHERE "userId" = $1`,
      [userId],
    );
  }

  async updateUserСonfirmationCode(userId: string, code: string) {
    return await this.dataSource.query(
      `UPDATE "email_confirmations"
     SET 
       "confirmationCode" = $1,
       "expirationDate" = NOW() + INTERVAL '1 hour 30 minutes'  -- Обновляем срок действия
     WHERE "userId" = $2`,
      [code, userId],
    );
  }

  async updateUserPassword(userId: string, newPasswordHash: string) {
    // 1. Выполняем обновление пароля
    return await this.dataSource.query(
      `UPDATE "users"
     SET "hashPassword" = $1
     WHERE id = $2`, [newPasswordHash, userId],
    );
  }
}
