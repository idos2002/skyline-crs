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

main().catch((err) => {
  // Usually happens when an error is thrown during the server startup
  log.fatal(err, 'A fatal error has occurred, shutting down server.');
  process.exit(1);
});
