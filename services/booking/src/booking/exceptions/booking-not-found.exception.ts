import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

/**
 * @openapi
 * components:
 *   responses:
 *     BookingNotFound:
 *       description: Booking Not Found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorDetails'
 *           example:
 *             error: Booking not found
 *             message: Could not find a booking with the given PNR ID.
 */
export default class BookingNotFoundException extends HttpException {
  constructor() {
    super(
      StatusCodes.NOT_FOUND,
      'Booking not found',
      'Could not find a booking with the given PNR ID.',
    );
  }
}
