import uuid from 'uuid';
import { Middleware } from '@common/components';
import ValidationException from '@common/exceptions/validation.exception';
import { ValidationError } from 'class-validator';

export default function validateUUID(...params: string[]): Middleware {
  return (req, res, next) => {
    const errors: ValidationError[] = [];

    for (const paramName in params) {
      const param = req.params[paramName];

      if (param === undefined || !uuid.validate(param)) {
        errors.push({
          property: paramName,
          value: param,
          constraints: {
            isUUID: `${paramName} must be a UUID`,
          },
        });
      }
    }

    if (errors.length > 0) {
      throw new ValidationException(
        'path',
        errors,
        `Path parameters "${params.join(', ')}" must be a UUID.`,
      );
    }

    next();
  };
}
