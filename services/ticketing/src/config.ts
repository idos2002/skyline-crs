import { LogLevelString } from 'bunyan';

const skylineEnvPrefix = 'SKYLINE_';

function getSkylineEnv(name: string, defaultValue?: string): string {
  name = skylineEnvPrefix + name;
  const value = process.env[name] ?? defaultValue;

  if (value === undefined) {
    throw Error(
      `Configuration error: ${name} environment variable is required`,
    );
  }

  return value;
}

const validLogLevels: string[] = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
];

function getSkylineLogLevelEnv(
  name: string,
  defaultValue: LogLevelString,
): LogLevelString {
  const logLevel = getSkylineEnv(name, defaultValue);

  if (!validLogLevels.includes(logLevel.toLowerCase())) {
    throw new Error(
      `Configuration error: ${logLevel} is not a valid log level`,
    );
  }

  return logLevel as LogLevelString;
}

function getSkylineNumberEnv(name: string, defaultValue: number): number {
  const stringValue = getSkylineEnv(name, defaultValue.toString());
  const value = parseInt(stringValue);

  if (value === NaN) {
    throw new Error(`Configuration error: ${name} is not a number`);
  }

  return value;
}

export interface Config {
  /**
   * Log level of the service.
   */
  logLevel: LogLevelString;

  /**
   * URI for RabbitMQ (Skyline vhost).
   */
  rabbitmqUri: string;

  /**
   * The RabbitMQ ticket topic exchange name.
   */
  ticketExchangeName: string;

  /**
   * The RabbitMQ ticket queue name.
   */
  ticketQueueName: string;

  /**
   * The binding key to use for binding the RabbitMQ ticketing queue to the ticket exchange.
   */
  ticketBookingBindingKey: string;

  /**
   * The prefetch count for the service. For more information, see:
   * {@link https://www.cloudamqp.com/blog/how-to-optimize-the-rabbitmq-prefetch-count.html}.
   */
  prefetchCount: number;

  /**
   * The message type used to queue bookings to be ticketed in the RabbitMQ ticket exchange.
   */
  ticketBookingMessageType: string;

  /**
   * The RabbitMQ email topic exchange name.
   */
  emailExchangeName: string;

  /**
   * The routing key to use for queueing the ticket to be emailed to the RabbitMQ email exchange.
   */
  emailTicketRoutingKey: string;

  /**
   * The dead letter exchange to use for the ticket queue. For more information, see:
   * {@link https://www.rabbitmq.com/dlx.html}.
   */
  deadLetterExchangeName: string;

  /**
   * The routing key to use for for the dead letter exchange of the ticket queue. For more information, see:
   * {@link https://www.rabbitmq.com/dlx.html}.
   */
  deadLetterRoutingKey: string;

  /**
   * The PNR database URI for managing the booking details (PNRs).
   */
  pnrDbUri: string;

  /**
   * The name of the PNR database for the given database URI.
   */
  pnrDbName: string;

  /**
   * The name of the PNR database's PNR collection for the given database URI.
   */
  pnrDbCollectionName: string;
}

function createConfig(): Config {
  try {
    return {
      logLevel: getSkylineLogLevelEnv('LOG_LEVEL', 'info'),
      rabbitmqUri: getSkylineEnv('RABBITMQ_URI'),
      ticketExchangeName: getSkylineEnv('TICKET_EXCHANGE_NAME'),
      ticketQueueName: getSkylineEnv('TICKET_QUEUE_NAME'),
      ticketBookingBindingKey: getSkylineEnv('TICKET_BOOKING_BINDING_KEY'),
      prefetchCount: getSkylineNumberEnv('PREFETCH_COUNT', 1),
      ticketBookingMessageType: getSkylineEnv(
        'TICKET_BOOKING_MESSAGE_TYPE',
        'ticket.booking',
      ),
      emailExchangeName: getSkylineEnv('EMAIL_EXCHANGE_NAME'),
      emailTicketRoutingKey: getSkylineEnv(
        'EMAIL_TICKET_ROUTING_KEY',
        'email.booking.ticket',
      ),
      deadLetterExchangeName: getSkylineEnv('DEAD_LETTER_EXCHANGE_NAME'),
      deadLetterRoutingKey: getSkylineEnv(
        'DEAD_LETTER_ROUTING_KEY',
        'ticket.booking',
      ),
      pnrDbUri: getSkylineEnv('PNR_DB_URI'),
      pnrDbName: getSkylineEnv('PNR_DB_NAME', 'pnr'),
      pnrDbCollectionName: getSkylineEnv('PNR_DB_COLLECTION_NAME', 'pnrs'),
    };
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    process.exit(1);
  }
}

let cachedConfig: Config | null = null;

export function config(): Config {
  if (cachedConfig === null) {
    cachedConfig = createConfig();
  }

  return cachedConfig;
}

export default config;
