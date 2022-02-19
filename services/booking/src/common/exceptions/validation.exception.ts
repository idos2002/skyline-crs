import { ValidationError } from 'class-validator';

export type ErrorsLocation = 'path' | 'query' | 'body';

export default class ValidationException extends Error {
  constructor(
    public location: ErrorsLocation,
    public errors: ValidationError[],
    message?: string,
  ) {
    super(message);
  }
}
