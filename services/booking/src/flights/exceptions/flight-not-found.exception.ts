import HttpException from '@common/exceptions/http.exception';
import { StatusCodes } from 'http-status-codes';

export default class FlightNotFoundException extends HttpException {
  constructor() {
    super(
      StatusCodes.NOT_FOUND,
      'Flight not found',
      'Could not find flight with the requested flight ID.',
    );
  }
}
