import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

/**
 * @openapi
 * components:
 *   examples:
 *     PassengerCountChangeResponse:
 *       summary: Passenger Count Change
 *       value:
 *         error: Passenger count change
 *         message: Passenger additions or removals are not allowed.
 */
export default class BookingPassengersCountChangeException extends HttpException {
  constructor() {
    super(
      StatusCodes.CONFLICT,
      'Passenger count change',
      'Passenger additions or removals are not allowed.',
    );
  }
}
