import bunyan from 'bunyan';
import config from '@config';

let _defaultLogger: bunyan | null = null;

export default function createLogger(module: string) {
  if (_defaultLogger === null) {
    _defaultLogger = bunyan.createLogger({
      name: 'booking',
      level: config().logLevel,
    });
  }

  return _defaultLogger.child({ module });
}
