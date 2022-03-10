import { ConfirmChannel, Options } from 'amqplib';
import createLogger from '@common/log';
import config from '@config';

export default class EmailService {
  private readonly log = createLogger(__filename);

  private readonly optionsBase: Options.Publish = {
    persistent: true,
    contentType: 'application/json',
    contentEncoding: 'utf-8',
  };

  private readonly queueConfirmationOptions: Options.Publish = {
    ...this.optionsBase,
    type: config().emailBookingConfirmationRoutingKey,
  };

  private readonly queueCancellationOptions: Options.Publish = {
    ...this.optionsBase,
    type: config().emailCancellationConfirmationRoutingKey,
  };

  constructor(private readonly amqpChannel: ConfirmChannel) {
    this.amqpChannel.assertExchange(config().emailExchangeName, 'topic');
  }

  public queueBookingConfirmationEmail(bookingId: string, retries = 10) {
    const message = JSON.stringify({ bookingId });

    const onConfirm = (err: any) => {
      if (err && retries > 0) {
        // Retry to queue if failed on previous attempt
        this.queueBookingConfirmationEmail(bookingId, retries - 1);
        return;
      }

      const logData = {
        bookingId,
        exchange: config().emailExchangeName,
        routingKey: config().emailBookingConfirmationRoutingKey,
      };

      if (err) {
        this.log.error(
          { err, ...logData },
          'Could not queue booking confirmation to be emailed',
        );
        return;
      }

      this.log.info(
        logData,
        'Successfully queued booking confirmation to be emailed',
      );
    };

    this.amqpChannel.publish(
      config().emailExchangeName,
      config().emailBookingConfirmationRoutingKey,
      Buffer.from(message),
      this.queueConfirmationOptions,
      onConfirm,
    );
  }

  public queueCancellationConfirmationEmail(bookingId: string, retries = 10) {
    const message = JSON.stringify({ bookingId });

    const onConfirm = (err: any) => {
      if (err && retries > 0) {
        // Retry to queue if failed on previous attempt
        this.queueCancellationConfirmationEmail(bookingId, retries - 1);
        return;
      }

      const logData = {
        bookingId,
        exchange: config().emailExchangeName,
        routingKey: config().emailCancellationConfirmationRoutingKey,
      };

      if (err) {
        this.log.error(
          { err, ...logData },
          'Could not queue cancellation confirmation to be emailed',
        );
        return;
      }

      this.log.info(
        logData,
        'Successfully queued cancellation confirmation to be emailed',
      );
    };

    this.amqpChannel.publish(
      config().emailExchangeName,
      config().emailCancellationConfirmationRoutingKey,
      Buffer.from(message),
      this.queueCancellationOptions,
      onConfirm,
    );
  }
}
