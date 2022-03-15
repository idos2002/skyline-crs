import { transformAndValidate } from 'class-transformer-validator';
import CabinClass from '@flights/enums/cabin-class.enum';
import FlightNotFoundException from '@flights/exceptions/flight-not-found.exception';
import TicketService from '@ticket/ticket.service';
import EmailService from '@email/email.service';
import BookingController from './booking.controller';
import BookingService from './booking.service';
import CreateBookingDto from './dto/create-booking.dto';
import Booking from './entities/booking.entity';
import Gender from './enums/gender.enum';
import TicketStatus from './enums/ticket-status.enum';
import FlightUnavailableException from '@flights/exceptions/flight-unavailable.exception';
import BookingNotFoundException from './exceptions/booking-not-found.exception';
import UpdateBookingDto from './dto/update-booking.dto';
import BookingAlreadyCanceledException from './exceptions/booking-already-cancelled.exception';
import BookingAlreadyCheckedInException from './exceptions/booking-already-checked-in.exception';
import BookingPassengersCountChangeException from './exceptions/booking-passengers-count-change.exception';

jest.mock('./booking.service');
jest.mock('@ticket/ticket.service');
jest.mock('@email/email.service');

const mockBookingId = '5ff62f07-c004-4b54-ae00-6e04b0891a0e';

const mockPassengers = [
  {
    nameTitle: 'Mr',
    givenNames: 'John Dan',
    surname: 'Doe',
    dateOfBirth: new Date(2000, 1, 1),
    gender: Gender.MALE,
  },
  {
    nameTitle: 'Mrs',
    givenNames: 'Jane',
    surname: 'Doe',
    dateOfBirth: new Date(2002, 1, 1),
    gender: Gender.FEMALE,
  },
];

const mockBookedSeats = [
  {
    id: 'd59179c9-9903-4d91-8728-eb4350961234',
    cabinClass: CabinClass.FIRST,
    row: 1,
    column: 'A',
  },
  {
    id: 'e5bac623-27e2-4de5-8b6b-4593102835f5',
    cabinClass: CabinClass.FIRST,
    row: 1,
    column: 'D',
  },
];

const mockPassengersWithBookedSeatIds = mockPassengers.map(
  (passenger, index) => ({
    ...passenger,
    bookedSeatId: mockBookedSeats[index]?.id,
  }),
);

const mockFlightId = '17564e2f-7d32-4d4a-9d99-27ccd768fb7d';

const mockContact = {
  firstName: 'John',
  surname: 'Doe',
  email: 'john.doe@example.com',
  phone: '+972541234567',
  address: {
    countryCode: 'IL',
    city: 'Tel Aviv-Yafo',
    street: 'Shlomo Rd.',
    houseNumber: '136',
    postalCode: '6603248',
  },
};

describe('BookingController', () => {
  let bookingService: BookingService;
  let ticketService: TicketService;
  let emailService: EmailService;
  let bookingController: BookingController;

  beforeEach(() => {
    bookingService = new BookingService(undefined as any, undefined as any);
    ticketService = new TicketService(undefined as any);
    emailService = new EmailService(undefined as any);
    bookingController = new BookingController(
      bookingService,
      ticketService,
      emailService,
    );
  });

  describe('create', () => {
    const bookingData = {
      _id: mockBookingId,
      passengers: mockPassengersWithBookedSeatIds,
      flightId: mockFlightId,
      contact: mockContact,
      ticket: {
        status: TicketStatus.PENDING,
      },
      createdTimestamp: new Date(2020, 1, 1, 1, 1, 1, 111),
    };
    let createBookingSpy: jest.SpyInstance | undefined;

    afterEach(() => {
      createBookingSpy?.mockRestore();
    });

    it('should create a new booking and return it', async () => {
      const bookingDto = await transformAndValidate(CreateBookingDto, {
        passengers: mockPassengers.map((passenger, index) => ({
          ...passenger,
          seat: mockBookedSeats[index],
        })),
        flightId: mockFlightId,
        contact: mockContact,
      });

      createBookingSpy = jest
        .spyOn(bookingService, 'create')
        .mockReturnValue(transformAndValidate(Booking, bookingData));

      const booking = await bookingController.create(bookingDto);

      expect(createBookingSpy).toHaveBeenCalledTimes(1);
      expect(createBookingSpy).toHaveBeenCalledWith(bookingDto);
      expect(ticketService.queueBooking).toHaveBeenCalledTimes(1);
      expect(ticketService.queueBooking).toHaveBeenCalledWith(mockBookingId);
      expect(emailService.queueBookingConfirmationEmail).toHaveBeenCalledTimes(
        1,
      );
      expect(emailService.queueBookingConfirmationEmail).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(booking).toMatchObject(bookingData);
    });

    it('should throw FlightNotFoundException', async () => {
      const badFlightId = 'ea548976-3224-46e4-afa0-527990321cec';
      const bookingDto = await transformAndValidate(CreateBookingDto, {
        passengers: mockPassengers.map((passenger, index) => ({
          ...passenger,
          seat: mockBookedSeats[index],
        })),
        flightId: badFlightId,
        contact: mockContact,
      });

      createBookingSpy = jest
        .spyOn(bookingService, 'create')
        .mockRejectedValue(new FlightNotFoundException());

      await expect(bookingController.create(bookingDto)).rejects.toThrow(
        FlightNotFoundException,
      );
      expect(createBookingSpy).toHaveBeenCalledTimes(1);
      expect(createBookingSpy).toHaveBeenCalledWith(bookingDto);
      expect(ticketService.queueBooking).not.toHaveBeenCalled();
      expect(emailService.queueBookingConfirmationEmail).not.toHaveBeenCalled();
    });

    it('should throw FlightUnavailableException', async () => {
      const bookingDto = await transformAndValidate(CreateBookingDto, {
        passengers: mockPassengers.map((passenger, index) => ({
          ...passenger,
          seat: mockBookedSeats[index],
        })),
        flightId: mockFlightId,
        contact: mockContact,
      });

      createBookingSpy = jest
        .spyOn(bookingService, 'create')
        .mockRejectedValue(new FlightUnavailableException());

      await expect(bookingController.create(bookingDto)).rejects.toThrow(
        FlightUnavailableException,
      );
      expect(createBookingSpy).toHaveBeenCalledTimes(1);
      expect(createBookingSpy).toHaveBeenCalledWith(bookingDto);
      expect(ticketService.queueBooking).not.toHaveBeenCalled();
      expect(emailService.queueBookingConfirmationEmail).not.toHaveBeenCalled();
    });
  });

  describe('find', () => {
    let findBookingSpy: jest.SpyInstance | undefined;

    afterEach(() => {
      findBookingSpy?.mockRestore();
    });

    it('should find the booking and return it', async () => {
      const bookingData = {
        _id: mockBookingId,
        passengers: mockPassengersWithBookedSeatIds,
        flightId: mockFlightId,
        contact: mockContact,
        ticket: {
          status: TicketStatus.CANCELED,
        },
        createdTimestamp: new Date(2020, 1, 1, 1, 1, 1, 111),
        updatesTimestamps: [
          new Date(2020, 1, 1, 2, 2, 2, 222),
          new Date(2020, 1, 1, 3, 3, 3, 333),
        ],
        cancelTimestamp: new Date(2020, 1, 1, 3, 4, 4, 444),
      };

      findBookingSpy = jest
        .spyOn(bookingService, 'find')
        .mockReturnValue(transformAndValidate(Booking, bookingData));

      const booking = await bookingController.find(mockBookingId);

      expect(findBookingSpy).toHaveBeenCalledTimes(1);
      expect(findBookingSpy).toHaveBeenCalledWith(mockBookingId);
      expect(booking).toMatchObject(bookingData);
    });

    it('should throw BookingNotFoundException', async () => {
      findBookingSpy = jest
        .spyOn(bookingService, 'find')
        .mockRejectedValue(new BookingNotFoundException());

      await expect(bookingController.find(mockBookingId)).rejects.toThrow(
        BookingNotFoundException,
      );
      expect(findBookingSpy).toHaveBeenCalledTimes(1);
      expect(findBookingSpy).toHaveBeenCalledWith(mockBookingId);
    });
  });

  describe('update', () => {
    const updatedEmail = 'updated.email@example.com';
    const bookingDtoData = {
      passengers: mockPassengers,
      contact: {
        ...mockContact,
        email: updatedEmail,
      },
    };
    let updateBookingSpy: jest.SpyInstance | undefined;

    afterEach(() => {
      updateBookingSpy?.mockRestore();
    });

    it('should update the booking and return the updated booking', async () => {
      const bookingData = {
        _id: mockBookingId,
        passengers: mockPassengersWithBookedSeatIds,
        flightId: mockFlightId,
        contact: {
          ...mockContact,
          email: updatedEmail,
        },
        ticket: {
          status: TicketStatus.PENDING,
        },
        createdTimestamp: new Date(2020, 1, 1, 1, 1, 1, 111),
        updatesTimestamps: [new Date(2020, 1, 1, 2, 2, 2, 222)],
      };
      const bookingDto = await transformAndValidate(
        UpdateBookingDto,
        bookingDtoData,
      );

      updateBookingSpy = jest
        .spyOn(bookingService, 'update')
        .mockReturnValue(transformAndValidate(Booking, bookingData));

      const booking = await bookingController.update(mockBookingId, bookingDto);

      expect(updateBookingSpy).toHaveBeenCalledTimes(1);
      expect(updateBookingSpy).toHaveBeenCalledWith(mockBookingId, bookingDto);
      expect(booking).toMatchObject(bookingData);
    });

    it('should throw BookingNotFoundException', async () => {
      const badBookingId = 'ea548976-3224-46e4-afa0-527990321cec';
      const bookingDto = await transformAndValidate(
        UpdateBookingDto,
        bookingDtoData,
      );

      updateBookingSpy = jest
        .spyOn(bookingService, 'update')
        .mockRejectedValue(new BookingNotFoundException());

      await expect(
        bookingController.update(badBookingId, bookingDto),
      ).rejects.toThrow(BookingNotFoundException);
      expect(updateBookingSpy).toHaveBeenCalledTimes(1);
      expect(updateBookingSpy).toHaveBeenCalledWith(badBookingId, bookingDto);
    });

    it('should throw BookingAlreadyCancelledException', async () => {
      const bookingDto = await transformAndValidate(
        UpdateBookingDto,
        bookingDtoData,
      );

      updateBookingSpy = jest
        .spyOn(bookingService, 'update')
        .mockRejectedValue(new BookingAlreadyCanceledException());

      await expect(
        bookingController.update(mockBookingId, bookingDto),
      ).rejects.toThrow(BookingAlreadyCanceledException);
      expect(updateBookingSpy).toHaveBeenCalledTimes(1);
      expect(updateBookingSpy).toHaveBeenCalledWith(mockBookingId, bookingDto);
    });

    it('should throw BookingAlreadyCheckedInException', async () => {
      const bookingDto = await transformAndValidate(
        UpdateBookingDto,
        bookingDtoData,
      );

      updateBookingSpy = jest
        .spyOn(bookingService, 'update')
        .mockRejectedValue(new BookingAlreadyCheckedInException());

      await expect(
        bookingController.update(mockBookingId, bookingDto),
      ).rejects.toThrow(BookingAlreadyCheckedInException);
      expect(updateBookingSpy).toHaveBeenCalledTimes(1);
      expect(updateBookingSpy).toHaveBeenCalledWith(mockBookingId, bookingDto);
    });

    it('should throw BookingPassengersCountChangeException', async () => {
      const bookingDto = await transformAndValidate(UpdateBookingDto, {
        ...bookingDtoData,
        passengers: [
          ...bookingDtoData.passengers,
          // Some extra passenger
          {
            givenNames: 'Jane',
            surname: 'Doe',
            dateOfBirth: new Date(1992, 3, 3),
            gender: Gender.OTHER,
          },
        ],
      });

      updateBookingSpy = jest
        .spyOn(bookingService, 'update')
        .mockRejectedValue(new BookingPassengersCountChangeException());

      await expect(
        bookingController.update(mockBookingId, bookingDto),
      ).rejects.toThrow(BookingPassengersCountChangeException);
      expect(updateBookingSpy).toHaveBeenCalledTimes(1);
      expect(updateBookingSpy).toHaveBeenCalledWith(mockBookingId, bookingDto);
    });
  });

  describe('cancel', () => {
    let cancelBookingSpy: jest.SpyInstance | undefined;

    afterEach(() => {
      cancelBookingSpy?.mockRestore();
    });

    it('should cancel the booking and return the canceled booking', async () => {
      const bookingData = await transformAndValidate(Booking, {
        _id: mockBookingId,
        passengers: mockPassengersWithBookedSeatIds,
        flightId: mockFlightId,
        contact: mockContact,
        ticket: { status: TicketStatus.CANCELED },
        createdTimestamp: new Date(2020, 1, 1, 1, 1, 1, 111),
        cancelTimestamp: new Date(2020, 1, 1, 5, 5, 5, 555),
      });

      cancelBookingSpy = jest
        .spyOn(bookingService, 'cancel')
        .mockResolvedValue(bookingData);

      const booking = await bookingController.cancel(mockBookingId);

      expect(cancelBookingSpy).toHaveBeenCalledTimes(1);
      expect(cancelBookingSpy).toHaveBeenCalledWith(mockBookingId);
      expect(
        emailService.queueCancellationConfirmationEmail,
      ).toHaveBeenCalledTimes(1);
      expect(
        emailService.queueCancellationConfirmationEmail,
      ).toHaveBeenCalledWith(mockBookingId);
      expect(booking).toMatchObject(bookingData);
    });

    it.each`
      bookingId                                 | exceptionType
      ${'ea548976-3224-46e4-afa0-527990321cec'} | ${BookingNotFoundException}
      ${mockBookingId}                          | ${BookingAlreadyCanceledException}
      ${mockBookingId}                          | ${BookingAlreadyCheckedInException}
    `(
      'should throw $exceptionType.name',
      async ({ bookingId, exceptionType }) => {
        cancelBookingSpy = jest
          .spyOn(bookingService, 'cancel')
          .mockRejectedValue(new exceptionType());

        await expect(bookingController.cancel(bookingId)).rejects.toThrow(
          exceptionType,
        );
        expect(cancelBookingSpy).toHaveBeenCalledTimes(1);
        expect(cancelBookingSpy).toHaveBeenCalledWith(bookingId);
        expect(
          emailService.queueCancellationConfirmationEmail,
        ).not.toHaveBeenCalled();
      },
    );
  });
});
