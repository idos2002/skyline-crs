import autoBind from 'auto-bind';
import { Router } from 'express';

export abstract class Controller {
  constructor() {
    autoBind(this);
  }

  public abstract createRouter(): Router;
}

export default Controller;
