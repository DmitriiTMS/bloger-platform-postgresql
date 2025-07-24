import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entitys/users.entity';
import { Repository } from 'typeorm';
import { EmailConfirmation } from '../users/entitys/email-confirmations.entity';

@Injectable()
export class UsersTormRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(EmailConfirmation)
    private readonly emailConfirmationRepository: Repository<EmailConfirmation>,
  ) {}

  async create(user: User, emailConfirmation?: EmailConfirmation) {
    // Сохраняем пользователя
    const createdUser = await this.usersRepository.save({
      login: user.login,
      email: user.email,
      hashPassword: user.hashPassword,
    });

    // Если есть данные для подтверждения email, сохраняем их
    if (emailConfirmation) {
      await this.emailConfirmationRepository.save({
        userId: createdUser.id,
        confirmationCode: emailConfirmation.confirmationCode,
        expirationDate: emailConfirmation.expirationDate,
        isConfirmed: emailConfirmation.isConfirmed,
      });
    }

    const { id, login, email, createdAt } = createdUser;

    return {
      id: String(id),
      login,
      email,
      createdAt,
    };
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async updateUserСonfirmationCode(userId: number, code: string) {
    await this.emailConfirmationRepository.update(
      { userId },
      {
        confirmationCode: code,
        expirationDate: () => "NOW() + INTERVAL '1 hour 30 minutes'",
      },
    );
  }

  async findBYCodeEmail(code: string) {
    const result = await this.emailConfirmationRepository.findOne({
      where: { confirmationCode: code },
      relations: ['user']
    });

    return result || null;
     }

  async updateUserPassword(userId: number, newPasswordHash: string) {
    await this.usersRepository.update(
      { id: userId },
      { hashPassword: newPasswordHash },
    );
  }

  async updateUserIsConfirmed(userId: number) {
    await this.emailConfirmationRepository.update(
      { userId },
      { isConfirmed: true },
    );
  }

  async findBYUserIdCodeEmail(userId: number) {
    const result = await this.emailConfirmationRepository.findOne({
      where: { userId },
    });
    return result;
  }

  async findById(id: number) {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    const userById = await this.findById(id);
    if (!userById) {
      throw new NotFoundException(`User с ${id} не найден`);
    }
    return await this.usersRepository.delete({ id });
  }
}
