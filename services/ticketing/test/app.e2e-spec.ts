import { Collection, MongoClient } from 'mongodb';
import uuidMongodb from 'uuid-mongodb';
import amqp, { Connection, ConsumeMessage, Options } from 'amqplib';
import { mockConfirmChannel } from './mocks/amqplib';
import Application from '../src/app';
import config from '../src/config';
import Repository, { Booking, TicketStatus } from '../src/repository';

jest.mock('amqplib', () => ({
  ...jest.requireActual('./mocks/amqplib').default,
}));

const consumeMessageBase: ConsumeMessage = {
  fields: {
    consumerTag: 'consumer-tag',
    deliveryTag: 1,
    redelivered: false,
    exchange: config().ticketExchangeName,
    routingKey: 'ticket.booking',
  },
  properties: {
    type: 'ticket.booking',
    contentType: 'application/json',
    contentEncoding: 'utf-8',
    timestamp: 1648254851257,
    messageId: 1,
    clusterId: null,
    userId: null,
    appId: null,
    headers: {},
    deliveryMode: 2,
    priority: null,
    correlationId: null,
    replyTo: null,
    expiration: null,
  },
  content: Buffer.from(''),
};

describe('Ticketing Service', () => {
  let mongoClient: MongoClient;
  let pnrCollection: Collection<Booking>;
  let repository: Repository;
  let amqpConnection: Connection;
  let app: Application;

  beforeAll(async () => {
    mongoClient = await MongoClient.connect(config().pnrDbUri);
    pnrCollection = mongoClient
      .db(config().pnrDbName)
      .collection(config().pnrDbCollectionName);
    repository = await Repository.create(mongoClient);
    amqpConnection = await amqp.connect(config().rabbitmqUri);
  });

  beforeEach(async () => {
    await pnrCollection.deleteMany({});
    app = await Application.create(amqpConnection, repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConfirmChannel.consume.mockReset();
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  it('tickets the booking and queues the ticket to be emailed', async () => {
    const bookingId = '9878c03e-99ef-40b3-901b-72c8b95dc734';
    const bookingIdBinary = uuidMongodb.from(bookingId);
    await pnrCollection.insertOne({
      _id: bookingIdBinary,
      ticket: { status: TicketStatus.PENDING },
    });

    const message = JSON.stringify({ bookingId });
    const consumeMessage: ConsumeMessage = {
      ...consumeMessageBase,
      content: Buffer.from(message),
    };
    mockConfirmChannel.consume.mockImplementation(
      async (
        _queue: string,
        onMessage: (msg: ConsumeMessage | null) => void,
        _options?: Options.Consume,
      ) => onMessage(consumeMessage),
    );

    await app.start();

    await expect(
      pnrCollection.findOne({ _id: bookingIdBinary }),
    ).resolves.toMatchObject({
      _id: bookingIdBinary.toUUID(),
      ticket: { status: TicketStatus.ISSUED, issueTimestamp: expect.any(Date) },
    });
    expect(mockConfirmChannel.publish).toHaveBeenCalledWith(
      config().emailExchangeName,
      config().emailTicketRoutingKey,
      Buffer.from(JSON.stringify({ bookingId })),
      expect.objectContaining({
        persistent: true,
        type: config().emailTicketRoutingKey,
        contentType: 'application/json',
        contentEncoding: 'utf-8',
      }),
      expect.any(Function),
    );
  });

  it.each`
    problem               | messageType             | contentEncoding | contentType
    ${'message type'}     | ${'ticket.unsupported'} | ${'utf-8'}      | ${'application/json'}
    ${'content encoding'} | ${'ticket.booking'}     | ${'gzip'}       | ${'application/json'}
    ${'content type'}     | ${'ticket.booking'}     | ${'utf-8'}      | ${'text/plain'}
  `(
    'rejects message with unsupported $problem',
    async ({ messageType, contentEncoding, contentType }) => {
      const consumeMessage: ConsumeMessage = {
        ...consumeMessageBase,
        properties: {
          ...consumeMessageBase.properties,
          type: messageType,
          contentEncoding,
          contentType,
        },
        content: Buffer.from(''),
      };
      mockConfirmChannel.consume.mockImplementation(
        async (
          _queue: string,
          onMessage: (msg: ConsumeMessage | null) => void,
          _options?: Options.Consume,
        ) => onMessage(consumeMessage),
      );

      await app.start();

      // Validate the dead letter exchange was set for the queue
      expect(mockConfirmChannel.assertQueue).toHaveBeenCalledWith(
        config().ticketQueueName,
        expect.objectContaining({
          durable: true,
          deadLetterExchange: config().deadLetterExchangeName,
          deadLetterRoutingKey: config().deadLetterRoutingKey,
        }),
      );

      expect(mockConfirmChannel.reject).toHaveBeenCalledWith(
        consumeMessage,
        false,
      );
    },
  );

  it.each`
    problem       | status                   | issueTimestamp
    ${'ticketed'} | ${TicketStatus.ISSUED}   | ${new Date(2020, 1, 1, 1, 1, 1, 111)}
    ${'canceled'} | ${TicketStatus.CANCELED} | ${undefined}
  `(
    'rejects message for already $problem booking',
    async ({ status, issueTimestamp }) => {
      const bookingId = '9878c03e-99ef-40b3-901b-72c8b95dc734';
      const bookingIdBinary = uuidMongodb.from(bookingId);
      await pnrCollection.insertOne({
        _id: bookingIdBinary,
        ticket: { status, issueTimestamp },
      });

      const message = JSON.stringify({ bookingId });
      const consumeMessage: ConsumeMessage = {
        ...consumeMessageBase,
        content: Buffer.from(message),
      };
      mockConfirmChannel.consume.mockImplementation(
        async (
          _queue: string,
          onMessage: (msg: ConsumeMessage | null) => void,
          _options?: Options.Consume,
        ) => onMessage(consumeMessage),
      );

      await app.start();

      // Validate the dead letter exchange was set for the queue
      expect(mockConfirmChannel.assertQueue).toHaveBeenCalledWith(
        config().ticketQueueName,
        expect.objectContaining({
          durable: true,
          deadLetterExchange: config().deadLetterExchangeName,
          deadLetterRoutingKey: config().deadLetterRoutingKey,
        }),
      );

      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for reject to be called

      expect(mockConfirmChannel.reject).toHaveBeenCalledWith(
        consumeMessage,
        false,
      );
    },
  );
});
