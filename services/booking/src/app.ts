import 'reflect-metadata';
import express, { Express } from 'express';
import 'express-async-errors';
import { GraphQLClient } from 'graphql-request';
import { getModelForClass, mongoose } from '@typegoose/typegoose';
import amqp from 'amqplib';
import swaggerUi from 'swagger-ui-express';
import config, { openapiSpecification, swaggerUiOptions } from '@config';
import BookingController from '@booking/booking.controller';
import Booking from '@booking/entities/booking.entity';
import BookingService from '@booking/booking.service';
import FlightsService from '@flights/flights.service';
import defaultErrorHandler from '@common/defaults/default.error-handler';
import TicketService from '@ticket/ticket.service';
import EmailService from '@email/email.service';
import jsonBodySyntaxErrorHandler from '@common/defaults/json-body-syntax.error-handler';
import authenticateJWT from '@auth/jwt-auth.middleware';

export default async function createApp(): Promise<Express> {
  const app = express();

  app.use(express.json());

  const flightsGraphQLClient = new GraphQLClient(config().inventoryManagerUrl);
  const flightsService = new FlightsService(flightsGraphQLClient);

  const pnrMongooseConnection = mongoose.createConnection(config().pnrDbUri, {
    authSource: 'admin',
  });
  const BookingModel = getModelForClass(Booking, {
    existingConnection: pnrMongooseConnection,
    schemaOptions: { collection: 'pnrs' },
  });
  const bookingService = new BookingService(BookingModel, flightsService);

  const amqpConnection = await amqp.connect(config().rabbitmqUri);
  const amqpChannel = await amqpConnection.createConfirmChannel();
  const ticketService = new TicketService(amqpChannel);
  const emailService = new EmailService(amqpChannel);

  const bookingController = new BookingController(
    bookingService,
    ticketService,
    emailService,
  );
  bookingController.applyMiddleware(authenticateJWT('id'), [
    'find',
    'update',
    'cancel',
    'checkIn',
  ]);

  app.use('/booking', bookingController.createRouter());

  app.use('/openapi.json', (_req, res) => res.json(openapiSpecification));
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiSpecification, swaggerUiOptions),
  );

  app.use(jsonBodySyntaxErrorHandler());

  // Default error handler - should be registered last!
  app.use(defaultErrorHandler());

  return app;
}
