import { Injectable } from '@nestjs/common';
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
    });

    return result || null;
  }

  async updateUserPassword(userId: number, newPasswordHash: string) {
    await this.usersRepository.update(
      { id: userId },
      { hashPassword: newPasswordHash },
    );
  }
}
