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
   * URL for the MongoDB PNR database.
   */
  pnrDbUrl: string;

  /**
   * URL for the inventory manager (Hasura GraphQL).
   */
  inventoryManagerUrl: string;
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
  if (logLevel !== undefined && logLevels.includes(logLevel)) {
    return logLevel as bunyan.LogLevelString;
  }
  return defaultLevel;
}

let _config: Config | null = null;

function getEnvironmentVariable(name: string, defaultValue?: string): string {
  const env = process.env[name] ?? defaultValue;
  if (env === undefined) {
    throw new Error(
      `Configuration error: ${name} environment variable is required`,
    );
  }
  return env;
}

export function config(): Config {
  if (_config === null) {
    _config = {
      port: parseInt(getEnvironmentVariable('SKYLINE_PORT', '80'), 10),
      logLevel: convertLogLevel(process.env.SKYLINE_LOG_LEVEL, 'info'),
      pnrDbUrl: getEnvironmentVariable('SKYLINE_PNR_DB_URL'),
      inventoryManagerUrl: getEnvironmentVariable(
        'SKYLINE_INVENTORY_MANAGER_URl',
      ),
    };
  }

  return _config;
}

export default config;
