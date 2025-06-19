import {
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import {
  CustomDomainException,
} from './exceptions/custom-domain.exception';


export const errorFormatter = (
  errors: ValidationError[],
  errorMessage?: any,
) => {
  const errorsForResponse = errorMessage || [];

  for (const error of errors) {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorsForResponse);
    } else if (error.constraints) {
      const constrainKeys = Object.keys(error.constraints);

      for (const key of constrainKeys) {
        errorsForResponse.push({
          message: error.constraints[key]
            ? `${error.constraints[key]}`
            // `${error.constraints[key]}`; Received value: ${error?.value}
            : '',
          field: error.property,
        });
      }
    }
  }

  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  //Глобальный пайп для валидации и трансформации входящих данных.
  app.useGlobalPipes(
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //и методы классов dto
      transform: true,
      stopAtFirstError: true,

      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);
        throw new CustomDomainException({errorsMessages: formattedErrors})
      },
    }),
  );
}