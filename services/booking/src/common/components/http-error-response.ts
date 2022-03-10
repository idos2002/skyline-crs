/**
 * @openapi
 * components:
 *   schemas:
 *     ErrorCause:
 *       type: object
 *       required:
 *       - cause
 *       - message
 *       properties:
 *         cause:
 *           type: string
 *           title: Cause
 *           description: The part of the request that caused the error
 *         message:
 *           type: string
 *           title: Message
 *           description: Explanation about the error
 */
export interface HttpErrorDetail {
  cause: string;
  message: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     ErrorDetails:
 *       type: object
 *       required:
 *       - error
 *       - message
 *       properties:
 *         error:
 *           title: Error
 *           type: string
 *           description: Error summary
 *         message:
 *           type: string
 *           title: Message
 *           description: The error message
 *         details:
 *           type: array
 *           items:
 *             "$ref": "#/components/schemas/ErrorCause"
 *           title: Details
 *           description: The error details
 */
export interface HttpErrorResponse {
  error: string;
  message: string;
  details?: HttpErrorDetail[];
}

export default HttpErrorResponse;
