import { NextFunction, Request, Response } from 'express';

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => any;

export default Middleware;
