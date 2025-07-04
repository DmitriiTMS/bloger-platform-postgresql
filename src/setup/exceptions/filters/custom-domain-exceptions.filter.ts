import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

import { Response } from 'express';
import {
  CustomDomainException,
  ErrorCustomDomain,
} from '../custom-domain.exception';
import { DomainExceptionCode } from './constants';

export type CustomDomainResponseBody = {
  errorsMessages: string | ErrorCustomDomain[];
  customCode?: DomainExceptionCode | null;
};

@Catch(CustomDomainException)
export class CustomDomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: CustomDomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.mapToHttpStatus(exception.customCode ? exception.customCode : DomainExceptionCode.BadRequest);
    const responseBody = this.buildResponseBody(exception);

    response.status(status).json(responseBody);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
        return HttpStatus.BAD_REQUEST;
      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;
      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }

  private buildResponseBody(
    exception: CustomDomainException,
  ): CustomDomainResponseBody {
    return {
      errorsMessages: exception.errorsMessages,
      customCode: exception.customCode && exception.customCode,
    };
  }
}