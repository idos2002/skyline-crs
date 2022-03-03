import {
  mongoose,
  getModelForClass,
  ReturnModelType,
} from '@typegoose/typegoose';
import { instanceToPlain } from 'class-transformer';
import config from '@config';
import Booking from './entities/booking.entity';
import BookingNotFoundException from './booking-not-found.exception';
import CreateBookingDto from './dto/create-booking.dto';
import UpdateBookingDto from './dto/update-booking.dto';
import TicketStatus from './enums/ticket-status.enum';
import FlightsService from '@flights/flights.service';

export default class BookingService {
  private readonly _mongooseConnection: mongoose.Connection;
  private readonly BookingModel: ReturnModelType<typeof Booking>;

  constructor(private readonly flightsService: FlightsService) {
    this._mongooseConnection = mongoose.createConnection(config().pnrDbUrl);
    this.BookingModel = getModelForClass(Booking, {
      existingConnection: this._mongooseConnection,
      schemaOptions: { collection: 'pnrs' },
    });
  }

  public async create(bookingDto: CreateBookingDto): Promise<Booking> {
    const bookedSeats = await this.flightsService.bookSeats(
      bookingDto.flightId,
      bookingDto.passengers.map((p) => p.seat),
    );

    const bookingDtoPlain = instanceToPlain(bookingDto, {
      exposeUnsetFields: false,
    });

    // change seat property to bookedSeatId for saving in the PNR database
    for (const passenger of bookingDtoPlain.passengers) {
      const seat = bookedSeats.find(
        (s) =>
          s.row === passenger.seat.row && s.column === passenger.seat.column,
      );

      if (seat === undefined) {
        throw Error(
          `Booking failed for seat ${passenger.seat.row}${passenger.seat.column} on flight ${bookingDto.flightId}`,
        );
      }

      passenger.bookedSeatId = seat.id;
      delete passenger.seat;
    }

    return await this.BookingModel.create(bookingDtoPlain);
  }

  public async find(id: string): Promise<Booking> {
    const booking = await this.BookingModel.findById(id);

    if (booking === null) {
      throw new BookingNotFoundException(
        `Could not find booking with ID ${id}`,
      );
    }

    return booking;
  }

  public async update(
    id: string,
    bookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const bookingDtoPlain = instanceToPlain(bookingDto, {
      exposeUnsetFields: false,
    });

    const booking = await this.BookingModel.findOneAndUpdate(
      { _id: id },
      bookingDtoPlain,
      { new: true },
    );

    if (booking === null) {
      throw new BookingNotFoundException(
        `Could not find booking with ID ${id}`,
      );
    }

    return booking;
  }

  public async cancel(id: string): Promise<Booking> {
    const booking = await this.BookingModel.findOneAndUpdate(
      { _id: id },
      {
        ticket: { status: TicketStatus.CANCELED },
        cancelTimestamp: new Date(),
      } as Partial<Booking>,
      { new: true },
    );

    if (booking === null) {
      throw new BookingNotFoundException(
        `Could not find booking with ID ${id}`,
      );
    }

    await this.flightsService.cancelBookedSeats(booking.flightId);

    return booking;
  }
}
