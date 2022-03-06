import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

export default class BookingNotFoundException extends HttpException {
  constructor() {
    super(
      StatusCodes.NOT_FOUND,
      'Booking not found',
      'Could not find a booking with the given PNR ID.',
    );
  }
}
