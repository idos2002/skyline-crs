export default class InternalException extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}
