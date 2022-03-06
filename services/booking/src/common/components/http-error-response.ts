export interface HttpErrorDetail {
  cause: string;
  message: string;
}

export interface HttpErrorResponse {
  error: string;
  message: string;
  details?: HttpErrorDetail[];
}

export default HttpErrorResponse;
