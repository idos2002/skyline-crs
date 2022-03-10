import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

export default class AuthenticationException extends HttpException {
  constructor() {
    super(
      StatusCodes.UNAUTHORIZED,
      'Unauthorized access',
      'The Authorization header is missing or invalid.',
    );
  }
}
