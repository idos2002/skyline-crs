import { StatusCodes } from 'http-status-codes';
import { HttpErrorResponse, HttpErrorDetail } from '@common/components';

export default class HttpException extends Error {
  constructor(
    public status: StatusCodes,
    public title: string,
    message: string,
    public details?: HttpErrorDetail[],
  ) {
    super(message);
  }

  public get response(): HttpErrorResponse {
    return {
      error: this.title,
      message: this.message,
      details: this.details,
    };
  }
}
