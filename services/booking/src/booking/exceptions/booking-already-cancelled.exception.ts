import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

export default class BookingAlreadyCancelledException extends HttpException {
  constructor() {
    super(
      StatusCodes.CONFLICT,
      'Booking already canceled',
      'Could not cancel a booking which is already canceled.',
    );
  }
}
