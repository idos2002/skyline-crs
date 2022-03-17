import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import config from '@config';
import AuthenticationException from './authentication.exception';

/**
 * Creates a middleware that authenticates requests by their `Authorization` header,
 * using the `Bearer` authentication scheme.
 *
 * @param subjectParamName An optional path param name to validate its value against
 *   the JWT's sub field.
 * @returns The middleware for the requested subject param name, if supplied.\
 *
 * @openapi
 * components:
 *   securitySchemes:
 *     accessToken:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Obtained by logging in at the Skyline API's `/login` endpoint.
 */
export default function authenticateJWT(
  subjectParamName?: string,
): RequestHandler {
  return (req, res, next) => {
    const [scheme, token] = req.headers.authorization?.split(' ') ?? [];

    try {
      if (scheme?.toLowerCase() !== 'bearer') throw new Error();

      const payload = jwt.verify(token ?? '', config().accessTokenSecret, {
        subject: subjectParamName ? req.params[subjectParamName] : undefined,
      });
      if (typeof payload === 'string') throw new Error();

      res.locals.authSubject = payload.sub;
    } catch (err) {
      throw new AuthenticationException();
    }

    next();
  };
}
