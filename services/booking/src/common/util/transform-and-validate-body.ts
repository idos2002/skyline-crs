import { Request } from 'express';
import { ClassType, transformAndValidate } from 'class-transformer-validator';
import { ValidationError } from 'class-validator';
import ValidationException from '@common/exceptions/validation.exception';

/**
 * Transforms and validates the request's body and returns it with the transformed
 * and validated class object. Uses `class-transformer` for transforming the body and
 * `class-validator` for validating its contents.
 *
 * @param classType The class type of the body to transform and validate.
 * @returns The middleware function for that `classType`.
 * @throws ValidationException If the validation has failed.
 */
export default async function transformAndValidateBody<T extends object>(
  req: Request,
  classType: ClassType<T>,
): Promise<T> {
  try {
    const bodyObject = await transformAndValidate(
      classType,
      req.body as object, // express.json() middleware is used
      { transformer: { excludeExtraneousValues: true } },
    );
    return bodyObject;
  } catch (err) {
    if (
      Array.isArray(err) &&
      err.length > 0 &&
      err[0] instanceof ValidationError
    ) {
      throw new ValidationException('body', err);
    }
  }

  throw new Error(
    'Unknown error occurred while transforming and validating body',
  );
}
