import { Middleware } from '@common/components';

export default function authenticateJWT(): Middleware {
  return (req, res, next) => {
    next();
  };
}
