import { Collection, Document, MongoClient } from 'mongodb';
import uuidMongodb from 'uuid-mongodb';
import config from './config';

export enum TicketStatus {
  PENDING = 'pending',
  ISSUED = 'issued',
  CANCELED = 'canceled',
}

export interface Booking extends Document {
  _id: uuidMongodb.MUUID;
  ticket: {
    status: TicketStatus;
    issueTimestamp?: Date;
  };
}

export default class Repository {
  private constructor(private pnrCollection: Collection<Booking>) {}

  public static async create(mongoClient: MongoClient): Promise<Repository> {
    const pnrCollection = mongoClient
      .db(config().pnrDbName)
      .collection<Booking>(config().pnrDbCollectionName);

    return new Repository(pnrCollection);
  }

  public async ticketBooking(bookingId: string) {
    const bookingUuid = uuidMongodb.from(bookingId);

    const updateResult = await this.pnrCollection.updateOne(
      { _id: bookingUuid, 'ticket.status': TicketStatus.PENDING },
      {
        $set: {
          ticket: { status: TicketStatus.ISSUED, issueTimestamp: new Date() },
        },
      },
    );

    if (updateResult.matchedCount !== 1 || updateResult.modifiedCount !== 1) {
      throw new Error(
        `Booking with id ${bookingId} could not be found or is already ticketed or canceled`,
      );
    }
  }
}
