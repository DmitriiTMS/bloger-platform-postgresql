export enum DomainExceptionCode {
  NotFound = 'NotFound',
  BadRequest = 'BadRequest',
  InternalServerError = 'InternalServerError',
  Forbidden = 'Forbidden',
  ValidationError = 'ValidationError',
  Unauthorized = 'Unauthorized',
  EmailNotConfirmed = 'EmailNotConfirmed',
  ConfirmationCodeExpired = 'ConfirmationCodeExpired',
  PasswordRecoveryCodeExpired = 'PasswordRecoveryCodeExpired',
}