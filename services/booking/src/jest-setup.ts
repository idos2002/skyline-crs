import 'reflect-metadata';
import bunyan from 'bunyan';

jest.mock('@config/config');
jest.mock(
  '@common/log',
  () => () => bunyan.createLogger({ name: 'tests-logger' }),
);
