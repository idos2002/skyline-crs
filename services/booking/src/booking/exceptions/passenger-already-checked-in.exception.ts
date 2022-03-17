import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

export default class PassengerAlreadyCheckedInException extends HttpException {
  constructor(passengerIndex: number) {
    super(
      StatusCodes.CONFLICT,
      'Passenger already checked in',
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
