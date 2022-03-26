import bunyan from 'bunyan';

jest.mock('./config');
jest.mock('./log', () => () => bunyan.createLogger({ name: 'tests-logger' }));
