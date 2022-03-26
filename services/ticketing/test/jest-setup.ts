import bunyan from 'bunyan';
import { Config } from '../src/config';

jest.mock(
  '../src/config',
  () => (): Config => ({
    logLevel: 'trace',
    rabbitmqUri: '',
    ticketExchangeName: 'ticket',
    ticketQueueName: 'ticket',
    ticketBookingBindingKey: 'ticket.#',
    prefetchCount: 1,
    ticketBookingMessageType: 'ticket.booking',
    emailExchangeName: 'email',
    emailTicketRoutingKey: 'email.booking.ticket',
    deadLetterExchangeName: 'dlx',
    deadLetterRoutingKey: 'ticket.booking',
    pnrDbUri: (global as any).__MONGO_URI__,
    pnrDbName: (global as any).__MONGO_DB_NAME__,
    pnrDbCollectionName: 'pnrs',
  }),
);

jest.mock(
  '../src/log',
  () => () => bunyan.createLogger({ name: 'tests-logger', level: 'fatal' }),
);
