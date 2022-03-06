import express, { Router, RequestHandler } from 'express';
import { boundClass } from 'autobind-decorator';
import { Params } from 'express-serve-static-core';

export enum RequestMethod {
  ALL = 'all',
  CONNECT = 'connect',
  DELETE = 'delete',
  GET = 'get',
  HEAD = 'head',
  OPTIONS = 'options',
  POST = 'post',
  PUT = 'put',
  TRACE = 'trace',
}

export type Handler<
  ReqParams extends Params = any,
  ReqBody extends object = object,
  ReqQuery = qs.ParsedQs,
  Locals extends Record<string, any> = Record<string, any>,
> = RequestHandler<ReqParams, any, ReqBody, ReqQuery, Locals>;

export interface RouteInfo {
  path: string;
  method?: RequestMethod | RequestMethod[];
}

type AnyHandler = Handler<any, any, any, any>;

interface HandlerRouteInfo extends Required<RouteInfo> {
  name: string;
  middleware: AnyHandler[];
  handler: AnyHandler;
}

@boundClass // FIXME: Check if working with Jest!
export class Controller {
  private readonly _routes: HandlerRouteInfo[] = [];

  public createRouter(): Router {
    const router = express.Router();

    // Add routes to the router
    for (const route of this._routes) {
      let methods = route.method;

      if (!Array.isArray(methods)) {
        methods = [methods];
      }

      // Iterate over HTTP request methods for this route
      for (const method of methods) {
        // Register middleware fr this route
        for (const middleware of route.middleware) {
          router[method](route.path, middleware);
        }

        // Register handler for this route
        router[method](route.path, route.handler);
      }
    }

    return router;
  }

  public applyMiddleware<
    ReqParams extends Params = any,
    ReqBody extends object = object,
    ReqQuery = qs.ParsedQs,
    Locals extends Record<string, any> = Record<string, any>,
  >(
    middleware:
      | Handler<ReqParams, ReqBody, ReqQuery, Locals>
      | Handler<ReqParams, ReqBody, ReqQuery, Locals>[],
    handlerName?: string | string[],
    exclude = false,
  ) {
    if (!Array.isArray(middleware)) {
      middleware = [middleware];
    }

    if (handlerName === undefined) {
      for (const route of this._routes) {
        route.middleware.push(...middleware);
      }
      return;
    }

    if (!Array.isArray(handlerName)) {
      handlerName = [handlerName];
    }

    const handlerNameSet = new Set(handlerName);

    for (const route of this._routes) {
      const nameInSet = handlerNameSet.has(route.name);
      const shouldInclude = exclude ? !nameInSet : nameInSet;

      if (shouldInclude) {
        route.middleware.push(...middleware);
      }
    }
  }

  // TODO: Add addErrorHandler public method (like filters in NestJS)

  protected registerHandler<
    ReqParams extends Params = any,
    ReqBody extends object = object,
    ReqQuery = qs.ParsedQs,
    Locals extends Record<string, any> = Record<string, any>,
  >(
    name: string,
    method: RequestMethod | RequestMethod[],
    path: string,
    handler: Handler<ReqParams, ReqBody, ReqQuery, Locals>,
  ) {
    this._routes.push({ name, method, path, middleware: [], handler });
  }
}

export default Controller;
