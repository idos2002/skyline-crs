import { Request } from 'express';
import uuid from 'uuid';
import ValidationException from '@common/exceptions/validation.exception';

export default function validateUUID(req: Request, paramName: string): string {
  const param = req.params[paramName];

  if (param === undefined || !uuid.validate(param)) {
    throw new ValidationException(
      'path',
      [
        {
          property: paramName,
          value: param,
          constraints: {
            isUUID: `${paramName} must be a UUID`,
          },
        },
      ],
      `Path parameter ${param} must be a UUID.`,
    );
  }

  return param;
}
