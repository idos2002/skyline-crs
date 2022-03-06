import 'reflect-metadata';
import express, { Express } from 'express';
import 'express-async-errors';
import BookingController from '@booking/booking.controller';
import BookingService from '@booking/booking.service';
import swaggerUi from 'swagger-ui-express';
import openapiSpecification from '@config/openapi-spec';
import FlightsService from '@flights/flights.service';
import defaultErrorHandler from '@common/defaults/default.error-handler';

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
  app.use(defaultErrorHandler());

  return app;
}
