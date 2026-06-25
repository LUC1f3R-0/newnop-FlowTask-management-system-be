import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

type FormattedValidationError = {
  field: string;
  messages: string[];
};

function formatValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): FormattedValidationError[] {
  return errors.flatMap((error) => {
    const fieldPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    const currentErrors: FormattedValidationError[] = error.constraints
      ? [
          {
            field: fieldPath,
            messages: Object.values(error.constraints),
          },
        ]
      : [];

    const childErrors = error.children?.length
      ? formatValidationErrors(error.children, fieldPath)
      : [];

    return [...currentErrors, ...childErrors];
  });
}

const appValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  stopAtFirstError: false,

  exceptionFactory: (errors: ValidationError[]) => {
    return new BadRequestException({
      success: false,
      message: 'Validation failed',
      data: null,
      meta: null,
      errors: formatValidationErrors(errors),
    });
  },
});

export { appValidationPipe };
