import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

export default function jsonBodySyntaxErrorHandler(): ErrorRequestHandler {
  return (err, _req, res, next) => {
    if (err instanceof SyntaxError) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        error: 'Validation error',
        message: 'Request has an invalid format.',
        details: [
          {
            cause: 'body',
            message: err.message,
          },
        ],
      });
      return;
    }

    next(err);
  };
}
