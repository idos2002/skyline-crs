import 'reflect-metadata';
import express, { Application as ExpressApplication } from 'express';
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

export default class Application {
  private constructor(
    private readonly bookingService: BookingService,
    private readonly ticketService: TicketService,
    private readonly emailService: EmailService,
  ) {}

  public static async create(
    flightsGraphqlClient: GraphQLClient,
    pnrMongooseConnection: mongoose.Connection,
    amqpConnection: amqp.Connection,
  ): Promise<Application> {
    const flightsService = await FlightsService.create(flightsGraphqlClient);

    const BookingModel = getModelForClass(Booking, {
      existingConnection: pnrMongooseConnection,
      schemaOptions: { collection: config().pnrDbCollectionName },
    });

    const bookingService = await BookingService.create(
      BookingModel,
      flightsService,
    );

    const amqpChannel = await amqpConnection.createConfirmChannel();
    const ticketService = await TicketService.create(amqpChannel);
    const emailService = await EmailService.create(amqpChannel);

    return new Application(bookingService, ticketService, emailService);
  }

  public async createExpressApplication(): Promise<ExpressApplication> {
    const app = express();

    app.use(express.json());

    const bookingController = await BookingController.create(
      this.bookingService,
      this.ticketService,
      this.emailService,
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
}
