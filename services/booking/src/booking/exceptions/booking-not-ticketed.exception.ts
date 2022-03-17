import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

/**
 * @openapi
 * components:
 *   examples:
 *     BookingNotTicketedResponse:
 *       summary: Booking Not Ticketed
 *       value:
 *         error: Booking not ticketed
 *         message: Could not check in for a booking that has not been ticketed.
 */
export default class BookingNotTicketedException extends HttpException {
  constructor() {
    super(
      StatusCodes.CONFLICT,
      'Booking not ticketed',
      'Could not check in for a booking that has not been ticketed.',
    );
  }
}
