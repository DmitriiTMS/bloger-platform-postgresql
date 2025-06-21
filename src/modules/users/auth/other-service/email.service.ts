import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { emailExamples, emailPasswordRecovery } from '../email/email-text';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
) {}

  async registerUserAndResendingEmail(email: string, code: string) {
    await this.mailerService.sendMail({
      from: this.configService.get('EMAIL'),
      to: email,
      subject: 'Your code is here',
      html: emailExamples.registrationEmail(code),
    });
  }

  async passwordRecovery(email: string, recoveryCode: string) {
    await this.mailerService.sendMail({
      from: this.configService.get('EMAIL'),
      to: email,
      subject: 'Your code is here',
      html: emailPasswordRecovery.passwordEmail(recoveryCode),
    });
  }
}