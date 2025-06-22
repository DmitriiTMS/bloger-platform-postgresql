import { EmailConfirmationCodeDto } from "../dto/email-confirmation-code.dto";

export class EmailConfirmationCodeSchema {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
  createdAt: string

  static createInstance(dto: EmailConfirmationCodeDto): EmailConfirmationCodeSchema {
     const emailConfirmationCode = new this();

     emailConfirmationCode.confirmationCode = dto.confirmationCode
     emailConfirmationCode.expirationDate = dto.expirationDate
     emailConfirmationCode.isConfirmed = dto.isConfirmed
     emailConfirmationCode.createdAt = new Date().toISOString(); 

     return emailConfirmationCode

  }
}
