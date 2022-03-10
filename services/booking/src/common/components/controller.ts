import express, { Router, RequestHandler, ErrorRequestHandler } from 'express';
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

export interface RouteInfo {
  path: string;
  method?: RequestMethod | RequestMethod[];
}

type AnyRequestHandler = RequestHandler<any, any, any, any, any>;

interface HandlerRouteInfo extends Required<RouteInfo> {
  name: string;
  middleware: AnyRequestHandler[];
  handler: AnyRequestHandler;
}

type AnyErrorHandler = ErrorRequestHandler<any, any, any, any, any>;

@boundClass // FIXME: Check if working with Jest!
export class Controller {
  private readonly _routes: HandlerRouteInfo[] = [];
  private readonly _errorHandlers: AnyErrorHandler[] = [];

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

    // Add error handlers to router
    for (const errorHandler of this._errorHandlers) {
      router.use(errorHandler);
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
      | RequestHandler<ReqParams, any, ReqBody, ReqQuery, Locals>
      | RequestHandler<ReqParams, any, ReqBody, ReqQuery, Locals>[],
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

  public addErrorHandler<
    ReqParams extends Params = any,
    ReqBody extends object = object,
    ReqQuery = qs.ParsedQs,
    Locals extends Record<string, any> = Record<string, any>,
  >(handler: ErrorRequestHandler<ReqParams, any, ReqBody, ReqQuery, Locals>) {
    this._errorHandlers.push(handler);
  }

  protected registerHandler<
    ReqParams extends Params = any,
    ReqBody extends object = object,
    ReqQuery = qs.ParsedQs,
    Locals extends Record<string, any> = Record<string, any>,
  >(
    name: string,
    method: RequestMethod | RequestMethod[],
    path: string,
    handler: RequestHandler<ReqParams, any, ReqBody, ReqQuery, Locals>,
  ) {
    this._routes.push({ name, method, path, middleware: [], handler });
  }
}

export default Controller;
