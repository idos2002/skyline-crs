import bunyan from 'bunyan';
import config from './config';

let baseLogger: bunyan | null = null;

export default function createLogger(module: string) {
  if (baseLogger === null) {
    baseLogger = bunyan.createLogger({
      name: 'ticketing',
      level: config().logLevel,
      serializers: bunyan.stdSerializers,
    });
  }

  return baseLogger.child({ module });
}
