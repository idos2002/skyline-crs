import amqp from 'amqplib';
import config from './config';
import createLogger from './log';
import Application from './app';
import { MongoClient } from 'mongodb';
import Repository from './repository';

const log = createLogger(__filename);

async function main() {
  log.info({ rabbitmqUri: config().rabbitmqUri }, 'Connecting to the broker');
  const amqpConnection = await amqp.connect(config().rabbitmqUri);
  amqpConnection.on('error', (err) =>
    log.error(err, 'Broker connection error'),
  );

  log.info({ pnrDbUri: config().pnrDbUri }, 'Connecting to the PNR database');
  const mongoClient = await MongoClient.connect(config().pnrDbUri, {
    authSource: 'admin',
  });
  const repository = await Repository.create(mongoClient);

  log.info('Initializing application');
  const app: Application = await Application.create(amqpConnection, repository);

  log.info('Starting consumer');
  await app.start();
}

main().catch((err) => {
  // Happens when an unhandled error is thrown
  log.fatal(err, 'A fatal error has occurred, shutting down server.');
  process.exit(1);
});
