import { ClassType, transformAndValidate } from 'class-transformer-validator';
import { ValidationError } from 'class-validator';
import { Middleware } from '@common/components';
import ValidationException from '@common/exceptions/validation.exception';

/**
 * Transforms and validates the request's body and replaces it with the transformed
 * and validated class object. Uses `class-transformer` for transforming the body and
 * `class-validator` for validating its contents.
 *
 * @param classType The class type of the body to transform and validate.
 * @returns The middleware function for that `classType`.
 */
export default function transformAndValidateBody(
  classType: ClassType<object>,
): Middleware {
  return async (req, res, next) => {
    try {
      const bodyObject = await transformAndValidate(classType, req.body);
      req.body = bodyObject;
    } catch (err) {
      if (
        Array.isArray(err) &&
        err.length > 0 &&
        err[0] instanceof ValidationError
      ) {
        throw new ValidationException(
          'body',
          err,
          `Request body must be of type ${classType}`,
        );
      }
    }

    next();
  };
}
