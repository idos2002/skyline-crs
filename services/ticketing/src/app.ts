import { ConfirmChannel, Connection, ConsumeMessage } from 'amqplib';
import { boundMethod } from 'autobind-decorator';
import config from './config';
import Repository from './repository';
import createLogger from './log';

export interface TicketBookingMessage {
  bookingId: string;
}

export interface MessageMetadata {
  messageType: string;
  encoding: string;
  contentType: string;
}

export default class Application {
  private readonly log = createLogger(__filename);

  private constructor(
    private amqpChannel: ConfirmChannel,
    private repository: Repository,
  ) {}

  public static async create(
    amqpConnection: Connection,
    repository: Repository,
  ): Promise<Application> {
    const log = createLogger(__filename);

    const amqpChannel = await amqpConnection.createConfirmChannel();
    amqpChannel.on('error', (err) => log.error(err, 'AMQP channel error'));
    await Application.configureChannel(amqpChannel);

    return new Application(amqpChannel, repository);
  }

  private static async configureChannel(amqpChannel: ConfirmChannel) {
    await amqpChannel.checkExchange(config().ticketExchangeName);
    await amqpChannel.assertExchange(config().deadLetterExchangeName, 'topic');
    await amqpChannel.assertQueue(config().ticketQueueName, {
      durable: true,
      deadLetterExchange: config().deadLetterExchangeName,
      deadLetterRoutingKey: config().deadLetterRoutingKey,
    });
    await amqpChannel.bindQueue(
      config().ticketQueueName,
      config().ticketExchangeName,
      config().ticketBookingBindingKey,
    );
    await amqpChannel.prefetch(config().prefetchCount);
  }

  public async start() {
    await this.amqpChannel.consume(
      config().ticketQueueName,
      this.consumeMessage,
    );
  }

  @boundMethod
  public consumeMessage(message: ConsumeMessage | null) {
    // If this consumer was canceled by the broker
    if (message === null) {
      throw Error('Consumer was canceled by the broker');
    }

    if (!this.isSupportedMessageFormat(message)) {
      this.log.error(
        { receiveMessage: message },
        "Received unsupported message format, responding with 'basic.reject' to the broker",
      );
      this.amqpChannel.reject(message, false);
      return;
    }

    const ticketBookingMessage = this.parseMessage(message);
    const bookingId = ticketBookingMessage.bookingId;

    this.log.info(
      { message: { ...message, content: ticketBookingMessage } },
      'Received message from broker',
    );

    this.log.trace({ bookingId }, "Updating the booking's PNR ticket details");

    this.repository
      .ticketBooking(bookingId)
      .then(() => {
        this.log.trace({ bookingId }, 'Queuing ticket to be emailed');
        this.queueTicketEmail(bookingId);
        this.amqpChannel.ack(message);
      })
      .catch((err) => {
        this.log.error(
          { err, bookingId },
          'Error ticketing booking with received booking ID',
        );
        this.amqpChannel.reject(message, false);
      });
  }

  private isSupportedMessageFormat(message: ConsumeMessage): boolean {
    const messageMetadata = this.extractMessageMetadata(message);
    return (
      messageMetadata.messageType === config().ticketBookingMessageType &&
      messageMetadata.encoding === 'utf-8' &&
      messageMetadata.contentType === 'application/json'
    );
  }

  private extractMessageMetadata(message: ConsumeMessage): MessageMetadata {
    let messageType = message.properties.type;
    if (!messageType) {
      this.log.warn(
        { receivedMessage: message },
        'Received message without type property, using routing key instead',
      );
      messageType = message.fields.routingKey;
    }

    let encoding = message.properties.contentEncoding;
    if (!encoding) {
      this.log.warn(
        { receivedMessage: message },
        "Received message without content encoding, assuming 'utf-8' instead",
      );
      encoding = 'utf-8';
    }

    let contentType = message.properties.contentType;
    if (!contentType) {
      this.log.warn(
        { receivedMessage: message },
        "Received message without content type, assuming 'application/json' instead",
      );
      contentType = 'application/json';
    }

    return { messageType, encoding, contentType };
  }

  private parseMessage(message: ConsumeMessage): TicketBookingMessage {
    const messageContent = message.content.toString('utf-8');
    return JSON.parse(messageContent);
  }

  private queueTicketEmail(bookingId: string, retries = 10) {
    const message = JSON.stringify({ bookingId });

    this.amqpChannel.publish(
      config().emailExchangeName,
      config().emailTicketRoutingKey,
      Buffer.from(message),
      {
        persistent: true,
        type: config().emailTicketRoutingKey,
        contentType: 'application/json',
        contentEncoding: 'utf-8',
      },
      (err) => {
        if (err && retries > 0) {
          this.log.error(
            { bookingId, err },
            'Error queueing the ticket to be emailed, retrying',
          );
          this.queueTicketEmail(bookingId, retries - 1);
        } else if (err) {
          this.log.error(
            { bookingId, err },
            'Failed to queue the ticket to be emailed',
          );
        }
      },
    );
  }
}
