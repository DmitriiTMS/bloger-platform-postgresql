import { BaseEntity } from '../../../../modules/entitys/base.entyty';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { EmailConfirmationCodeDto } from '../dto/email-confirmation-code.dto';

@Entity({ name: 'email_confirmations' })
export class EmailConfirmation extends BaseEntity {
  @Column()
  confirmationCode: string;

  @Column()
  expirationDate: Date;

  @Column()
  isConfirmed: boolean;

  @OneToOne(() => User, (user) => user.emailConfirmation)
  @JoinColumn()
  public user: User;

  @Column()
  userId: number;

  static createInstance(dto: EmailConfirmationCodeDto): EmailConfirmation {
    const emailConfirmationCode = new this();

    emailConfirmationCode.confirmationCode = dto.confirmationCode;
    emailConfirmationCode.expirationDate = dto.expirationDate;
    emailConfirmationCode.isConfirmed = dto.isConfirmed;

    return emailConfirmationCode;
  }
}
