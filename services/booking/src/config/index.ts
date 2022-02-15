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

const config: Config = {
  port: parseInt(process.env.SKYLINE_PORT ?? '80', 10),
  logLevel: convertLogLevel(process.env.SKYLINE_LOG_LEVEL, 'info'),
};

export default config;
