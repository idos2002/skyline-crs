import createApp from './app';
import config from '@config';
import createLogger from '@common/log';

const log = createLogger(__filename);

async function main() {
  const log = createLogger(__filename);
  const app = await createApp();

  app.listen(config().port, '0.0.0.0', () => {
    log.info(`Listening for connections on 0.0.0.0:${config().port}`);
  });
}

main().catch((err) => log.error(err, 'An uncaught unknown error was thrown'));
