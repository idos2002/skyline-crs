import { Connection, ConfirmChannel, ConsumeMessage } from 'amqplib';
import { boundMethod } from 'autobind-decorator';
import config from './config';
import EmailService from './email/email.service';
import createLogger from './log';

export interface MessageMetadata {
  messageType: string;
  encoding: string;
  contentType: string;
}

export default class Application {
  private readonly log = createLogger(__filename);
  private readonly supportedMessageTypes = [
    config().emailBookingConfirmationMessageType,
    config().emailFlightTicketMessageType,
    config().emailBookingCancellationMessageType,
    config().emailBoardingPassMessageType,
  ];

  private constructor(
    private amqpChannel: ConfirmChannel,
    private readonly emailService: EmailService,
  ) {}

  public static async create(
    amqpConnection: Connection,
    emailService: EmailService,
  ): Promise<Application> {
    const log = createLogger(__filename);

    const amqpChannel = await amqpConnection.createConfirmChannel();
    amqpChannel.on('error', (err) => {
      log.error(err, 'AMQP channel error');
      process.exit(1);
    });
    await Application.configureChannel(amqpChannel);

    return new Application(amqpChannel, emailService);
  }

  private static async configureChannel(amqpChannel: ConfirmChannel) {
    await amqpChannel.checkExchange(config().emailExchangeName);
    await amqpChannel.assertExchange(config().deadLetterExchangeName, 'topic');
    await amqpChannel.assertQueue(config().emailQueueName, {
      durable: true,
      deadLetterExchange: config().deadLetterExchangeName,
      deadLetterRoutingKey: config().deadLetterRoutingKey,
    });
    await amqpChannel.bindQueue(
      config().emailQueueName,
      config().emailExchangeName,
      config().emailBindingKey,
    );
    await amqpChannel.prefetch(config().prefetchCount);
  }

  public async start() {
    await this.amqpChannel.consume(
      config().emailQueueName,
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

    this.handleMessage(message)
      .then(() => {
        this.amqpChannel.ack(message);
      })
      .catch((err) => {
        this.log.error(
          { err, message },
          "Unknown error while handling received message, responding with 'basic.reject' to the broker",
        );
        this.amqpChannel.reject(message, false);
      });
  }

  private isSupportedMessageFormat(message: ConsumeMessage): boolean {
    const messageMetadata = this.extractMessageMetadata(message);
    return (
      this.supportedMessageTypes.includes(messageMetadata.messageType) &&
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

  private async handleMessage(message: ConsumeMessage) {
    const parsedMessage = this.parseMessage(message);

    this.log.info(
      { message: { ...message, content: parsedMessage } },
      'Received message from broker',
    );

    switch (message.properties.type) {
      case config().emailBookingConfirmationMessageType:
        this.log.info(
          { bookingId: parsedMessage.bookingId },
          'Sending booking confirmation email',
        );
        await this.emailService.emailBookingConfirmation(parsedMessage);
        break;
      case config().emailFlightTicketMessageType:
        this.log.info(
          { bookingId: parsedMessage.bookingId },
          'Sending flight ticket email',
        );
        await this.emailService.emailFlightTicket(parsedMessage);
        break;
      case config().emailBookingCancellationMessageType:
        this.log.info(
          { bookingId: parsedMessage.bookingId },
          'Sending booking cancellation notice email',
        );
        await this.emailService.emailBookingCancellation(parsedMessage);
        break;
      case config().emailBoardingPassMessageType:
        this.log.info(
          { bookingId: parsedMessage.bookingId },
          'Sending boarding pass email',
        );
        await this.emailService.emailBoardingPass(parsedMessage);
        break;
      default:
        throw new Error(
          `Could not handle message with type ${message.properties.type}`,
        );
    }
  }

  private parseMessage(message: ConsumeMessage): any {
    const messageContent = message.content.toString('utf-8');
    return JSON.parse(messageContent);
  }
}
