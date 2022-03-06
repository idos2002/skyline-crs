import { ValidationError } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorDetail } from '@common/components';
import HttpException from './http.exception';

export type ErrorsLocation = 'path' | 'query' | 'body';

function validationErrorToHttpErrorDetails(
  errors: ValidationError[],
): HttpErrorDetail[] {
  return errors.flatMap((error) => {
    // If no children
    if (error.children === undefined || error.children.length === 0) {
      return [
        {
          cause: error.property,
          message: Object.values(error.constraints ?? {}).join(', '),
        },
      ];
    }

    const children = validationErrorToHttpErrorDetails(error.children);

    return children.map((child) => ({
      cause: `${error.property}/${child.cause}`,
      message: child.message,
    }));
  });
}

export default class ValidationException extends HttpException {
  constructor(
    public location: ErrorsLocation,
    public errors: ValidationError[],
  ) {
    super(
      StatusCodes.UNPROCESSABLE_ENTITY,
      'Validation error',
      'Request has an invalid format.',
      validationErrorToHttpErrorDetails(errors).map((err) => {
        err.cause = `${location}/${err.cause}`;
        return err;
      }),
    );
  }
}
