import bunyan from 'bunyan';
import config from '@config';

const defaultLogger = bunyan.createLogger({
  name: 'booking',
  level: config.logLevel,
});

export default function createLogger(module: string) {
  return defaultLogger.child({ module });
}
