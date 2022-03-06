import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

export default class BookingPassengersCountChangeException extends HttpException {
  constructor() {
    super(
      StatusCodes.CONFLICT,
      'Passenger count change',
      'Passenger additions or removals are not allowed.',
    );
  }
}
