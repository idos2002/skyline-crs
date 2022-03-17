import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

/**
 * @openapi
 * components:
 *   examples:
 *     BookingAlreadyCanceledResponse:
 *       summary: Booking Already Canceled
 *       value:
 *         error: Booking already canceled
 *         message: Could not update or cancel a booking which is already canceled.
 */
export default class BookingAlreadyCanceledException extends HttpException {
  constructor() {
    super(
      StatusCodes.CONFLICT,
      'Booking already canceled',
      'Could not update or cancel a booking which is already canceled.',
    );
  }
}
