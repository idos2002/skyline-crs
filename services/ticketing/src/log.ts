import bunyan from 'bunyan';
import config from './config';

let defaultLogger: bunyan | null = null;

export default function createLogger(module: string) {
  if (defaultLogger === null) {
    defaultLogger = bunyan.createLogger({
      name: 'ticketing',
      level: config().logLevel,
      serializers: bunyan.stdSerializers,
    });
  }

  return defaultLogger.child({ module });
}
