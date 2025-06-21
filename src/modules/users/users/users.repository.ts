import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSchema } from './schemas/users.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(user: UserSchema) {
    const createdUser = await this.dataSource.query(
      `INSERT INTO "users"("login", "email", "hashPassword", "createdAt")
      VALUES ($1, $2, $3, $4::timestamp with time zone)
      RETURNING "id", "login", "email", "createdAt" `,
      [user.login, user.email, user.hashPassword, user.createdAt],
    );

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
}
