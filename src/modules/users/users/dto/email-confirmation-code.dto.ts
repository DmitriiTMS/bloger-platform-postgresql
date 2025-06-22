export class EmailConfirmationCodeDto {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}
