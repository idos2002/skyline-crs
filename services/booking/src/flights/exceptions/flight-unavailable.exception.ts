import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

/**
 * @openapi
 * components:
 *   responses:
 *     SeatsNotAvailable:
 *       description: Seats Not Available
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorDetails'
 *           example:
 *             error: Seats not available
 *             message: Could not book the requested seats, as they are already booked.
 */
export default class FlightUnavailableException extends HttpException {
  constructor() {
    super(
      StatusCodes.CONFLICT,
      'Seats not available',
      'Could not book the requested seats, as they are already booked',
    );
  }
}
