import { ReturnModelType } from '@typegoose/typegoose';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { flatten } from 'flat';
import createLogger from '@common/log';
import FlightsService from '@flights/flights.service';
import CreateBookingDto from './dto/create-booking.dto';
import UpdateBookingDto from './dto/update-booking.dto';
import TicketStatus from './enums/ticket-status.enum';
import Booking from './entities/booking.entity';
import BookingNotFoundException from './exceptions/booking-not-found.exception';
import BookingAlreadyCanceledException from './exceptions/booking-already-canceled.exception';
import BookingAlreadyCheckedInException from './exceptions/booking-already-checked-in.exception';
import BookingPassengersCountChangeException from './exceptions/booking-passengers-count-change.exception';
import CheckInDto from './dto/check-in.dto';
import CheckInPassengerDto from './dto/check-in-passenger.dto';
import Passenger from './entities/passenger.entity';
import CheckInValidationException from './exceptions/check-in-validation.exception';
import PassengerAlreadyCheckedInException from './exceptions/passenger-already-checked-in.exception';
import BookingNotTicketedException from './exceptions/booking-not-ticketed.exception';

export default class BookingService {
  private readonly log = createLogger(__filename);

  private constructor(
    private readonly BookingModel: ReturnModelType<typeof Booking>,
    private readonly flightsService: FlightsService,
  ) {}

  public static async create(
    BookingModel: ReturnModelType<typeof Booking>,
    flightsService: FlightsService,
  ): Promise<BookingService> {
    return new BookingService(BookingModel, flightsService);
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

    bookingDtoPlain.ticket = { status: TicketStatus.PENDING };

    const booking = await this.BookingModel.create(bookingDtoPlain);
    return plainToInstance(Booking, booking);
  }

  public async find(id: string): Promise<Booking> {
    const booking = await this.BookingModel.findById(id);

    if (booking === null) {
      throw new BookingNotFoundException();
    }

    return plainToInstance(Booking, booking);
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
      throw new BookingNotFoundException();
    }

    this.validateBookingForUpdate(booking);

    if (bookingDto.passengers.length !== booking.passengers.length) {
      throw new BookingPassengersCountChangeException();
    }

    const flattenedBookingDto: Record<string, any> = flatten(bookingDtoPlain);

    const updatedBooking = await this.BookingModel.findByIdAndUpdate(
      id,
      {
        $set: flattenedBookingDto,
        $push: { updatesTimestamps: new Date() },
      },
      { new: true, runValidators: true },
    );

    return plainToInstance(Booking, updatedBooking);
  }

  public async cancel(id: string): Promise<Booking> {
    const booking = await this.BookingModel.findById(id);

    if (booking === null) {
      throw new BookingNotFoundException();
    }

    this.validateBookingForUpdate(booking);

    booking.ticket.status = TicketStatus.CANCELED;
    booking.cancelTimestamp = new Date();
    await booking.save();

    const seatIds = booking.passengers.map((p) => p.bookedSeatId);
    await this.flightsService.cancelBookedSeats(seatIds);

    return plainToInstance(Booking, booking);
  }

  private validateBookingForUpdate(booking: Booking) {
    // Check if booking was already cancelled
    if (
      booking.ticket.status === TicketStatus.CANCELED &&
      booking.cancelTimestamp !== undefined
    ) {
      throw new BookingAlreadyCanceledException();
    }

    // Check if any of the passengers have already checked in
    if (booking.passengers.some((p) => p.checkInTimestamp !== undefined)) {
      throw new BookingAlreadyCheckedInException();
    }
  }

  public async checkIn(id: string, checkInDto: CheckInDto): Promise<Booking> {
    const booking = await this.BookingModel.findById(id);

    if (booking === null) {
      throw new BookingNotFoundException();
    }

    // Check if booking was already cancelled
    if (
      booking.ticket.status === TicketStatus.CANCELED &&
      booking.cancelTimestamp !== undefined
    ) {
      throw new BookingAlreadyCanceledException();
    }

    // Check if the booking has been ticketed
    if (
      booking.ticket.status !== TicketStatus.ISSUED &&
      booking.ticket.issueTimestamp === undefined
    ) {
      throw new BookingNotTicketedException();
    }

    const passengersToUpdate: CheckInPassengerDto[] = [];
    const checkProperties: (keyof CheckInPassengerDto & keyof Passenger)[] = [
      'nameTitle',
      'givenNames',
      'surname',
      'gender',
    ];
    for (const [index, bookingPassenger] of booking.passengers.entries()) {
      const passenger = checkInDto.passengers.find(
        (p) => p.bookedSeatId === bookingPassenger.bookedSeatId,
      );

      if (!passenger) {
        throw new CheckInValidationException(index);
      }

      // Validate if all passenger details are identical before checking in
      const areDatesOfBirthEqual =
        passenger.dateOfBirth.getTime() ===
        bookingPassenger.dateOfBirth.getTime();
      const areEqual =
        areDatesOfBirthEqual &&
        checkProperties.every(
          (prop) => passenger[prop] === bookingPassenger[prop],
        );

      if (!areEqual) {
        throw new CheckInValidationException(index);
      }

      if (bookingPassenger.checkInTimestamp !== undefined) {
        throw new PassengerAlreadyCheckedInException(index);
      }

      // The passengers in the array will be ordered like in the booking,
      // because of the order we are iterating over the elements of the
      // booking's passengers
      passengersToUpdate.push(passenger);
    }

    const updatedFields = {
      passengers: passengersToUpdate.map((p) => ({
        ...p,
        checkInTimestamp: new Date(),
      })),
    };
    const updatedBooking = await this.BookingModel.findByIdAndUpdate(
      id,
      { $set: flatten(updatedFields) },
      { new: true, runValidators: true },
    );

    return plainToInstance(Booking, updatedBooking);
  }
}
