import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

export default class CheckInValidationException extends HttpException {
  constructor(passengerIndex: number) {
    super(
      StatusCodes.CONFLICT,
      'Check-in validation error',
      'Check-in passenger details do not match those of the booking.',
      [
        {
          cause: `body/passengers/${passengerIndex}`,
          message: 'Passenger details do not match the booking',
        },
      ],
    );
  }
}
