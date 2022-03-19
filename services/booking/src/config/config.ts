import bunyan from 'bunyan';

/**
 * Application configuration from environment variables.
 */
export interface Config {
  /**
   * Port number for the application to listen on.
   */
  port: number;

  /**
   * Log level for the application.
   */
  logLevel: bunyan.LogLevelString;

  /**
   * The secret used to sign access tokens for this API.
   */
  accessTokenSecret: string;

  /**
   * URI for the MongoDB PNR database.
   */
  pnrDbUri: string;

  /**
   * Name of the PNR database for the given PNR database URI.
   */
  pnrDbName: string;

  /**
   * Name of the PNRs collection in the PNR database.
   */
  pnrDbCollectionName: string;

  /**
   * URL for the inventory manager (Hasura GraphQL).
   */
  inventoryManagerUrl: string;

  /**
   * URI for RabbitMQ (Skyline vhost).
   */
  rabbitmqUri: string;

  /**
   * The RabbitMQ ticket topic exchange name.
   */
  ticketExchangeName: string;

  /**
   * The routing key to use for queueing booking IDs in the RabbitMQ ticket exchange.
   */
  ticketBookingRoutingKey: string;

  /**
   * The RabbitMQ email topic exchange name.
   */
  emailExchangeName: string;

  /**
   * The routing key to use for queueing booking confirmation emails in the RabbitMQ email exchange.
   */
  emailBookingConfirmationRoutingKey: string;

  /**
   * The routing key to use for queueing cancellation confirmation emails in the RabbitMQ email exchange.
   */
  emailCancellationConfirmationRoutingKey: string;

  /**
   * The routing key to use for queueing boarding pass emails in the RabbitMQ email exchange.
   */
  emailBoardingPassRoutingKey: string;
}

const logLevels: string[] = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
];

function convertLogLevel(
  logLevel: string | undefined,
  defaultLevel: bunyan.LogLevelString,
): bunyan.LogLevelString {
  if (logLevel !== undefined && logLevels.includes(logLevel.toLowerCase())) {
    return logLevel as bunyan.LogLevelString;
  }
  return defaultLevel;
}

let _config: Config | null = null;

function getEnvironmentVariable(name: string, defaultValue?: string): string {
  const env = process.env[name] ?? defaultValue;
  if (env === undefined) {
    console.error(
      `Configuration error: ${name} environment variable is required`,
    );
    // Make sure server stops running (an exception may be caught)
    process.exit(1);
  }
  return env;
}

export function config(): Config {
  if (_config === null) {
    _config = {
      port: parseInt(getEnvironmentVariable('SKYLINE_PORT', '80'), 10),
      logLevel: convertLogLevel(process.env.SKYLINE_LOG_LEVEL, 'info'),
      accessTokenSecret: getEnvironmentVariable('SKYLINE_ACCESS_TOKEN_SECRET'),
      pnrDbUri: getEnvironmentVariable('SKYLINE_PNR_DB_URI'),
      pnrDbName: getEnvironmentVariable('SKYLINE_PNR_DB_NAME', 'pnr'),
      pnrDbCollectionName: getEnvironmentVariable(
        'SKYLINE_PNR_DB_COLLECTION_NAME',
        'pnrs',
      ),
      inventoryManagerUrl: getEnvironmentVariable(
        'SKYLINE_INVENTORY_MANAGER_URL',
      ),
      rabbitmqUri: getEnvironmentVariable('SKYLINE_RABBITMQ_URI'),
      ticketExchangeName: getEnvironmentVariable(
        'SKYLINE_TICKET_EXCHANGE_NAME',
      ),
      ticketBookingRoutingKey: getEnvironmentVariable(
        'SKYLINE_TICKET_BOOKING_ROUTING_KEY',
        'ticket.booking',
      ),
      emailExchangeName: getEnvironmentVariable('SKYLINE_EMAIL_EXCHANGE_NAME'),
      emailBookingConfirmationRoutingKey: getEnvironmentVariable(
        'SKYLINE_EMAIL_BOOKING_CONFIRMATION_ROUTING_KEY',
        'email.booking.confirmation',
      ),
      emailCancellationConfirmationRoutingKey: getEnvironmentVariable(
        'SKYLINE_EMAIL_BOOKING_CANCELLATION_ROUTING_KEY',
        'email.booking.cancel',
      ),
      emailBoardingPassRoutingKey: getEnvironmentVariable(
        'SKYLINE_EMAIL_BOARDING_PASS_ROUTING_KEY',
        'email.boarding.ticket',
      ),
    };
  }

  return _config;
}

export default config;
