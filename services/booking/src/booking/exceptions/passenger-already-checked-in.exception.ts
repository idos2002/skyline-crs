import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

/**
 * @openapi
 * components:
 *   examples:
 *     PassengerAlreadyCheckedInResponse:
 *       summary: Passenger Already Checked-in
 *       value:
 *         error: Passenger already checked-in
 *         message: One of the passengers has already checked in.
 *         details:
 *           - cause: body/passengers/0
 *             message: Passenger is already checked-in
 */
export default class PassengerAlreadyCheckedInException extends HttpException {
  constructor(passengerIndex: number) {
    super(
      StatusCodes.CONFLICT,
      'Passenger already checked-in',
      'One of the passengers has already checked in.',
      [
        {
          cause: `body/passengers/${passengerIndex}`,
          message: 'Passenger is already checked-in',
        },
      ],
    );
  }
}
