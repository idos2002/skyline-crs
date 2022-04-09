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

function getOptionalSkylineEnv(name: string): string | undefined {
  return process.env[skylineEnvPrefix + name];
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

function getSkylineNumberEnv(name: string, defaultValue?: number): number {
  const stringValue = getSkylineEnv(name, defaultValue?.toString());
  const value = parseInt(stringValue);

  if (value === NaN) {
    throw new Error(`Configuration error: ${name} is not a number`);
  }

  return value;
}

function getOptionalSkylineNumberEnv(name: string): number | undefined {
  const stringValue = getOptionalSkylineEnv(name);

  if (stringValue === undefined) return undefined;

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
   * The prefetch count for the service. For more information, see:
   * {@link https://www.cloudamqp.com/blog/how-to-optimize-the-rabbitmq-prefetch-count.html}.
   */
  prefetchCount: number;

  /**
   * The RabbitMQ email topic exchange name.
   */
  emailExchangeName: string;

  /**
   * The RabbitMQ email queue name.
   */
  emailQueueName: string;

  /**
   * The binding key to use for binding the email queue to the email exchange.
   */
  emailBindingKey: string;

  /**
   * The message type used to queue booking confirmation emails in the RabbitMQ email exchange.
   */
  emailBookingConfirmationMessageType: string;

  /**
   * The message type used to queue flight ticket emails in the RabbitMQ email exchange.
   */
  emailFlightTicketMessageType: string;

  /**
   * The message type used to queue booking cancellation emails in the RabbitMQ email exchange.
   */
  emailBookingCancellationMessageType: string;

  /**
   * The message type used to queue boarding pass emails in the RabbitMQ email exchange.
   */
  emailBoardingPassMessageType: string;

  /**
   * The dead letter exchange to use for the email queue. For more information, see:
   * {@link https://www.rabbitmq.com/dlx.html}.
   */
  deadLetterExchangeName: string;

  /**
   * The routing key to use for for the dead letter exchange of the email queue. For more information, see:
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

  /**
   * URL for the inventory manager (Hasura GraphQL).
   */
  inventoryManagerUrl: string;

  /**
   * The IATA airline code of Skyline.
   */
  iataAirlineCode: string;

  /**
   * The email address to use for sending emails.
   */
  emailAddress: string;

  /**
   * The SMTP server host name to use for sending emails.
   */
  smtpHost?: string | undefined;

  /**
   * The port to use for connecting with the SMTP server.
   */
  smtpPort?: number | undefined;

  /**
   * The username for authenticating with the SMTP server.
   */
  smtpUsername?: string | undefined;

  /**
   * The password for authenticating with the SMTP server.
   */
  smtpPassword?: string | undefined;
}

function createConfig(): Config {
  try {
    return {
      logLevel: getSkylineLogLevelEnv('LOG_LEVEL', 'info'),
      rabbitmqUri: getSkylineEnv('RABBITMQ_URI'),
      prefetchCount: getSkylineNumberEnv('PREFETCH_COUNT', 1),
      emailExchangeName: getSkylineEnv('EMAIL_EXCHANGE_NAME'),
      emailQueueName: getSkylineEnv('EMAIL_QUEUE_NAME'),
      emailBindingKey: getSkylineEnv('EMAIL_BINDING_KEY'),
      emailBookingConfirmationMessageType: getSkylineEnv(
        'EMAIL_BOOKING_CONFIRMATION_MESSAGE_TYPE',
        'email.booking.confirmation',
      ),
      emailFlightTicketMessageType: getSkylineEnv(
        'EMAIL_FLIGHT_TICKET_MESSAGE_TYPE',
        'email.booking.ticket',
      ),
      emailBookingCancellationMessageType: getSkylineEnv(
        'EMAIL_BOOKING_CANCELLATION_MESSAGE_TYPE',
        'email.booking.cancel',
      ),
      emailBoardingPassMessageType: getSkylineEnv(
        'EMAIL_BOARDING_PASS_MESSAGE_TYPE',
        'email.boarding.ticket',
      ),
      deadLetterExchangeName: getSkylineEnv('DEAD_LETTER_EXCHANGE_NAME'),
      deadLetterRoutingKey: getSkylineEnv('DEAD_LETTER_ROUTING_KEY', 'email'),
      pnrDbUri: getSkylineEnv('PNR_DB_URI'),
      pnrDbName: getSkylineEnv('PNR_DB_NAME', 'pnr'),
      pnrDbCollectionName: getSkylineEnv('PNR_DB_COLLECTION_NAME', 'pnrs'),
      inventoryManagerUrl: getSkylineEnv('INVENTORY_MANAGER_URL'),
      iataAirlineCode: getSkylineEnv('IATA_AIRLINE_CODE', 'SK'),
      emailAddress: getSkylineEnv('EMAIL_ADDRESS'),
      smtpHost: getOptionalSkylineEnv('SMTP_HOST'),
      smtpPort: getOptionalSkylineNumberEnv('SMTP_PORT'),
      smtpUsername: getOptionalSkylineEnv('SMTP_USERNAME'),
      smtpPassword: getOptionalSkylineEnv('SMTP_PASSWORD'),
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
