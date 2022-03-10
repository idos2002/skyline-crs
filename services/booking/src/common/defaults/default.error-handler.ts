import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpException from '@common/exceptions/http.exception';
import InternalException from '@common/exceptions/internal.exception';
import createLogger from '@common/log';

export default function defaultErrorHandler(): ErrorRequestHandler {
  const log = createLogger(__filename);

  return (err, _req, res, _next) => {
    if (err instanceof HttpException) {
      res.status(err.status).json(err.response);
      return;
    }

    if (err instanceof InternalException) {
      log.error({ err, cause: err.cause }, 'An internal exception was thrown');
    } else {
      log.error(err, 'An unknown exception was thrown');
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Internal server error',
      message: 'The server has experienced an internal error.',
    });
  };
}
