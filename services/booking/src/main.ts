import { GraphQLClient } from 'graphql-request';
import { mongoose } from '@typegoose/typegoose';
import amqp from 'amqplib';
import config from '@config';
import createLogger from '@common/log';
import Application from './app';

const log = createLogger(__filename);

async function main() {
  const flightsGraphQLClient = new GraphQLClient(config().inventoryManagerUrl);

  const pnrMongooseConnection = mongoose.createConnection(config().pnrDbUri, {
    dbName: config().pnrDbName,
    authSource: 'admin',
  });

  const amqpConnection = await amqp.connect(config().rabbitmqUri);

  const app = await Application.create(
    flightsGraphQLClient,
    pnrMongooseConnection,
    amqpConnection,
  );

  const expressApp = await app.createExpressApplication();

  expressApp.listen(config().port, '0.0.0.0', () => {
    log.info(`Listening for connections on 0.0.0.0:${config().port}`);
  });
}

main().catch((err) => {
  // Usually happens when an error is thrown during the server startup
  log.fatal(err, 'A fatal error has occurred, shutting down server.');
  process.exit(1);
});
