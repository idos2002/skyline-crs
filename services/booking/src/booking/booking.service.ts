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
import BookingAlreadyCancelledException from './booking-already-cancelled.exception';
import BookingAlreadyCheckedInException from './booking-already-checked-in.exception';

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

    // Change seat property to bookedSeatId for saving in the PNR database
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

    const booking = await this.BookingModel.findById(id);

    if (booking === null) {
      throw new BookingNotFoundException(
        `Could not find booking with ID ${id}`,
      );
    }

    this.validateBookingForUpdate(booking);

    const updatedBooking = await this.BookingModel.findByIdAndUpdate(
      id,
      { $set: { bookingDtoPlain }, $push: { updatesTimestamps: new Date() } },
      { new: true, runValidators: true },
    );

    return updatedBooking as Booking;
  }

  public async cancel(id: string): Promise<Booking> {
    const booking = await this.BookingModel.findById(id);

    if (booking === null) {
      throw new BookingNotFoundException(
        `Could not find booking with ID ${id}`,
      );
    }

    this.validateBookingForUpdate(booking);

    booking.ticket.status = TicketStatus.CANCELED;
    booking.cancelTimestamp = new Date();
    booking.save();

    const seatIds = booking.passengers.map((p) => p.bookedSeatId);
    await this.flightsService.cancelBookedSeats(seatIds);

    return booking;
  }

  private validateBookingForUpdate(booking: Booking) {
    // Check if booking was already cancelled
    if (
      booking.ticket.status === TicketStatus.CANCELED &&
      booking.cancelTimestamp !== undefined
    ) {
      const dateIso = booking.cancelTimestamp.toISOString();
      throw new BookingAlreadyCancelledException(
        `Booking with ID ${booking._id} was already cancelled on ${dateIso}`,
      );
    }

    // Check if any of the passengers have already checked in
    if (booking.passengers.some((p) => p.checkInTimestamp !== undefined)) {
      throw new BookingAlreadyCheckedInException(
        `Could not cancel booking with ID ${booking._id} where some of the passengers have already checked in`,
      );
    }
  }
}
