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

  async create(
    user: User,
    emailConfirmation?: EmailConfirmation,
  ) {
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
}
