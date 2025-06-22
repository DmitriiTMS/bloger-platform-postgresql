import { DomainExceptionCode } from "./filters/constants";


export type ErrorCustomDomain = {
  message: string,
  field: string
}

export class CustomDomainException {
  customCode?: DomainExceptionCode;
  errorsMessages: string | ErrorCustomDomain[];

  constructor(infoError: {errorsMessages: string | ErrorCustomDomain[], customCode?: DomainExceptionCode}) {
    this.customCode = infoError.customCode,
    this.errorsMessages = infoError.errorsMessages
  }
}