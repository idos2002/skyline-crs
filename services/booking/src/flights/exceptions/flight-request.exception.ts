export default class FlightRequestException extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}
