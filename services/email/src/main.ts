import amqp from 'amqplib';
import { MongoClient } from 'mongodb';
import { GraphQLClient } from 'graphql-request';
import createLogger from './log';
import config from './config';
import Application from './app';
import EmailService from './email/email.service';
import BookingService from './booking/booking.service';
import FlightsService from './flights/flights.service';
import QrCodeService from './qr-code/qr-code.service';

const log = createLogger(__filename);

async function main() {
  log.info({ rabbitmqUri: config().rabbitmqUri }, 'Connecting to the broker');
  const amqpConnection = await amqp.connect(config().rabbitmqUri);
  amqpConnection.on('error', (err) => {
    log.fatal(err, 'Broker connection error');
    process.exit(1);
  });

  log.info({ pnrDbUri: config().pnrDbUri }, 'Connecting to the PNR database');
  const pnrMongoClient = await MongoClient.connect(config().pnrDbUri, {
    authSource: 'admin',
  });
  const bookingService = await BookingService.create(pnrMongoClient);

  const flightsGraphQLClient = new GraphQLClient(config().inventoryManagerUrl);
  const flightsService = await FlightsService.create(flightsGraphQLClient);

  const qrCodeService = await QrCodeService.create();

  const emailService = await EmailService.create(
    bookingService,
    flightsService,
    qrCodeService,
  );

  const app = await Application.create(amqpConnection, emailService);
  app.start();
}

main().catch((err) => {
  // Happens when an unhandled error is thrown
  log.fatal(err, 'A fatal error has occurred, shutting down server.');
  process.exit(1);
});
