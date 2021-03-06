import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

/**
 * @openapi
 * components:
 *   examples:
 *     AlreadyCheckedInResponse:
 *       summary: Already Checked In
 *       value:
 *         error: Already checked in
 *         message: Could not update or cancel a booking which all or some of its passengers have already checked in.
 */
export default class BookingAlreadyCheckedInException extends HttpException {
  constructor() {
    super(
      StatusCodes.CONFLICT,
      'Already checked in',
      'Could not update or cancel a booking which all or some of its passengers have already checked in.',
    );
  }
}
