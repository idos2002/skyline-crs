import { Collection, MongoClient } from 'mongodb';
import uuidMongodb from 'uuid-mongodb';
import config from '../config';
import Booking from './interfaces/booking.interface';

export default class BookingService {
  private constructor(private readonly pnrCollection: Collection<Booking>) {}

  public static async create(
    mongoClient: MongoClient,
  ): Promise<BookingService> {
    const pnrCollection = mongoClient
      .db(config().pnrDbName)
      .collection<Booking>(config().pnrDbCollectionName);

    return new BookingService(pnrCollection);
  }

  public async findBooking(id: string): Promise<Booking> {
    const binaryId = uuidMongodb.from(id);
    const booking = await this.pnrCollection.findOne({ _id: binaryId });

    if (booking === null) {
      throw new Error(`Could not find booking with id ${id}`);
    }

    return booking;
  }
}
