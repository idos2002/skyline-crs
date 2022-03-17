import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

/**
 * @openapi
 * components:
 *   responses:
 *     FlightNotFound:
 *       description: Flight Not Found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorDetails'
 *           example:
 *             error: Flight not found
 *             message: Could not find flight with the requested flight ID.
 */
export default class FlightNotFoundException extends HttpException {
  constructor() {
    super(
      StatusCodes.NOT_FOUND,
      'Flight not found',
      'Could not find flight with the requested flight ID.',
    );
  }
}
