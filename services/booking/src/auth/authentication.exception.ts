import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

/**
 * @openapi
 * components:
 *   responses:
 *     UnauthorizedAccess:
 *       description: Unauthorized Access
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorDetails'
 *           example:
 *             error: Unauthorized access
 *             message: The Authorization header is missing or invalid.
 */
export default class AuthenticationException extends HttpException {
  constructor() {
    super(
      StatusCodes.UNAUTHORIZED,
      'Unauthorized access',
      'The Authorization header is missing or invalid.',
    );
  }
}
