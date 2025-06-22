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

  registerUserAndResendingEmail(email: string, code: string) {
    this.mailerService.sendMail({
      from: this.configService.get('EMAIL'),
      to: email,
      subject: 'Your code is here',
      html: emailExamples.registrationEmail(code),
    });
  }

  passwordRecovery(email: string, recoveryCode: string) {
    this.mailerService.sendMail({
      from: this.configService.get('EMAIL'),
      to: email,
      subject: 'Your code is here',
      html: emailPasswordRecovery.passwordEmail(recoveryCode),
    });
  }
}