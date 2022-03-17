import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

export default class BookingNotTicketedException extends HttpException {
  constructor() {
    super(
      StatusCodes.CONFLICT,
      'Booking not ticketed',
      'Could not check in for a booking that has not been ticketed.',
    );
  }
}
