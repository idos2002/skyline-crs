import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

export default class FlightUnavailableException extends HttpException {
  constructor() {
    super(
      StatusCodes.CONFLICT,
      'Seats not available',
      'Could not book the requested seats, as they are already booked',
    );
  }
}
