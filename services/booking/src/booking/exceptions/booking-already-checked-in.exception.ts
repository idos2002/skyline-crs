import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

export default class BookingAlreadyCheckedInException extends HttpException {
  constructor() {
    super(
      StatusCodes.CONFLICT,
      'Already checked in',
      'Could not cancel a booking which all or some of its passengers have already checked in.',
    );
  }
}
