import 'reflect-metadata';
import express, { Express, NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import createLogger from '@common/log';
import BookingController from '@booking/booking.controller';
import BookingService from '@booking/booking.service';
import swaggerUi from 'swagger-ui-express';
import openapiSpecification from '@config/openapi-spec';
import FlightsService from '@flights/flights.service';

const log = createLogger(__filename);

export default function createApp(): Express {
  const app = express();

  app.use(express.json());

  const flightsService = new FlightsService();
  const bookingService = new BookingService(flightsService);
  const bookingController = new BookingController(bookingService);
  // TODO: Apply JWT authentication middleware to the booking controller
  app.use('/booking', bookingController.createRouter());

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

  // Default error handler - should be registered last!
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    log.error(err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'The server has experienced an unrecoverable error.',
    });
  });

  return app;
}
