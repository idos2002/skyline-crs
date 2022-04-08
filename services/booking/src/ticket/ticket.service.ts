import { ConfirmChannel, Options } from 'amqplib';
import createLogger from '@common/log';
import config from '@config';

export default class TicketService {
  private readonly log = createLogger(__filename);

  private readonly queueBookingOptions: Options.Publish = {
    persistent: true,
    contentType: 'application/json',
    contentEncoding: 'utf-8',
    type: config().ticketBookingRoutingKey,
  };

  private constructor(private readonly amqpChannel: ConfirmChannel) {}

  public static async create(
    amqpChannel: ConfirmChannel,
  ): Promise<TicketService> {
    await amqpChannel.assertExchange(config().ticketExchangeName, 'topic');
    return new TicketService(amqpChannel);
  }

  public queueBooking(bookingId: string, retries = 10) {
    const message = JSON.stringify({ bookingId });

    const onConfirm = (err: any) => {
      if (err && retries > 0) {
        // Retry to queue if failed on previous attempt
        this.queueBooking(bookingId, retries - 1);
        return;
      }

      const logData = {
        bookingId,
        exchange: config().ticketExchangeName,
        routingKey: config().ticketBookingRoutingKey,
      };

      if (err) {
        this.log.error(
          { err, ...logData },
          'Could not queue booking to be ticketed',
        );
        return;
      }

      this.log.info(logData, 'Successfully queued booking to be ticketed');
    };

    this.amqpChannel.publish(
      config().ticketExchangeName,
      config().ticketBookingRoutingKey,
      Buffer.from(message),
      this.queueBookingOptions,
      onConfirm,
    );
  }
}
