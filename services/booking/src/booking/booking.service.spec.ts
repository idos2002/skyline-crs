import { transformAndValidate } from 'class-transformer-validator';
import { getModelForClass } from '@typegoose/typegoose';
import flatten from 'flat';
import FlightsService from '@flights/flights.service';
import CabinClass from '@flights/enums/cabin-class.enum';
import BookingService from './booking.service';
import CreateBookingDto from './dto/create-booking.dto';
import Gender from './enums/gender.enum';
import Booking from './entities/booking.entity';
import TicketStatus from './enums/ticket-status.enum';
import FlightNotFoundException from '@flights/exceptions/flight-not-found.exception';
import FlightUnavailableException from '@flights/exceptions/flight-unavailable.exception';
import BookingNotFoundException from './exceptions/booking-not-found.exception';
import UpdateBookingDto from './dto/update-booking.dto';
import BookingAlreadyCanceledException from './exceptions/booking-already-cancelled.exception';
import BookingAlreadyCheckedInException from './exceptions/booking-already-checked-in.exception';
import BookingPassengersCountChangeException from './exceptions/booking-passengers-count-change.exception';

jest.mock('@flights/flights.service');

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

describe('BookingService', () => {
  const BookingModel = getModelForClass(Booking);
  let flightsService: FlightsService;
  let bookingService: BookingService;

  beforeEach(() => {
    flightsService = new FlightsService(undefined as any);
    bookingService = new BookingService(BookingModel, flightsService);
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
    let createBookingSpy: jest.SpyInstance;
    let bookSeatsSpy: jest.SpyInstance | undefined;

    beforeEach(() => {
      createBookingSpy = jest
        .spyOn(BookingModel, 'create')
        .mockImplementation(() => transformAndValidate(Booking, bookingData));
    });

    afterEach(() => {
      createBookingSpy.mockRestore();
      bookSeatsSpy?.mockRestore();
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

      bookSeatsSpy = jest
        .spyOn(flightsService, 'bookSeats')
        .mockResolvedValue(mockBookedSeats);

      const booking = await bookingService.create(bookingDto);

      expect(bookSeatsSpy).toHaveBeenCalledTimes(1);
      expect(createBookingSpy).toHaveBeenCalledTimes(1);
      expect(booking).toMatchObject(bookingData);
    });

    it('should throw FlightNotFoundException', async () => {
      const bookingDto = await transformAndValidate(CreateBookingDto, {
        passengers: mockPassengers.map((passenger, index) => ({
          ...passenger,
          seat: mockBookedSeats[index],
        })),
        flightId: 'ea548976-3224-46e4-afa0-527990321cec', // Some other UUID
        contact: mockContact,
      });

      bookSeatsSpy = jest
        .spyOn(flightsService, 'bookSeats')
        .mockRejectedValue(new FlightNotFoundException());

      await expect(bookingService.create(bookingDto)).rejects.toThrow(
        FlightNotFoundException,
      );
      expect(bookSeatsSpy).toHaveBeenCalledTimes(1);
      expect(createBookingSpy).not.toHaveBeenCalled();
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

      bookSeatsSpy = jest
        .spyOn(flightsService, 'bookSeats')
        .mockRejectedValue(new FlightUnavailableException());

      await expect(bookingService.create(bookingDto)).rejects.toThrow(
        FlightUnavailableException,
      );
      expect(bookSeatsSpy).toHaveBeenCalledTimes(1);
      expect(createBookingSpy).not.toHaveBeenCalled();
    });
  });

  describe('find', () => {
    let findBookingByIdSpy: jest.SpyInstance | undefined;

    afterEach(() => {
      findBookingByIdSpy?.mockRestore();
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

      findBookingByIdSpy = jest
        .spyOn(BookingModel, 'findById')
        .mockReturnValue(transformAndValidate(Booking, bookingData) as any);

      const booking = await bookingService.find(mockBookingId);

      expect(findBookingByIdSpy).toHaveBeenCalledTimes(1);
      expect(findBookingByIdSpy).toHaveBeenCalledWith(mockBookingId);
      expect(booking).toMatchObject(bookingData);
    });

    it('should throw BookingNotFoundException', async () => {
      findBookingByIdSpy = jest
        .spyOn(BookingModel, 'findById')
        .mockResolvedValue(null);

      await expect(bookingService.find(mockBookingId)).rejects.toThrow(
        BookingNotFoundException,
      );
      expect(findBookingByIdSpy).toHaveBeenCalledTimes(1);
      expect(findBookingByIdSpy).toHaveBeenCalledWith(mockBookingId);
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
    const updatedBookingData = {
      ...bookingData,
      contact: {
        ...bookingData.contact,
        email: updatedEmail,
      },
      updatesTimestamps: [new Date(2020, 1, 1, 2, 2, 2, 222)],
    };
    let findBookingByIdSpy: jest.SpyInstance | undefined;
    let findByIdAndUpdateBookingSpy: jest.SpyInstance;

    beforeEach(() => {
      findByIdAndUpdateBookingSpy = jest
        .spyOn(BookingModel, 'findByIdAndUpdate')
        .mockReturnValue(
          transformAndValidate(Booking, updatedBookingData) as any,
        );
    });

    afterEach(() => {
      findBookingByIdSpy?.mockRestore();
      findByIdAndUpdateBookingSpy.mockRestore();
    });

    it('should update the booking and return the updated booking', async () => {
      const bookingDto = await transformAndValidate(
        UpdateBookingDto,
        bookingDtoData,
      );

      findBookingByIdSpy = jest
        .spyOn(BookingModel, 'findById')
        .mockReturnValue(transformAndValidate(Booking, bookingData) as any);

      const booking = await bookingService.update(mockBookingId, bookingDto);

      expect(findBookingByIdSpy).toHaveBeenCalledTimes(1);
      expect(findBookingByIdSpy).toHaveBeenCalledWith(mockBookingId);
      expect(findByIdAndUpdateBookingSpy).toHaveBeenCalledTimes(1);
      expect(findByIdAndUpdateBookingSpy).toHaveBeenCalledWith(
        mockBookingId,
        {
          $set: flatten(bookingDtoData),
          $push: { updatesTimestamps: expect.any(Date) },
        },
        expect.objectContaining({
          new: true,
        }),
      );
      expect(booking).toMatchObject(updatedBookingData);
    });

    it('should throw BookingNotFoundException', async () => {
      const badBookingId = 'ea548976-3224-46e4-afa0-527990321cec';
      const bookingDto = await transformAndValidate(
        UpdateBookingDto,
        bookingDtoData,
      );

      findBookingByIdSpy = jest
        .spyOn(BookingModel, 'findById')
        .mockResolvedValue(null);

      await expect(
        bookingService.update(badBookingId, bookingDto),
      ).rejects.toThrow(BookingNotFoundException);
      expect(findBookingByIdSpy).toHaveBeenCalledTimes(1);
      expect(findBookingByIdSpy).toHaveBeenCalledWith(badBookingId);
      expect(findByIdAndUpdateBookingSpy).not.toHaveBeenCalled();
    });

    it('should throw BookingAlreadyCancelledException', async () => {
      const bookingDto = await transformAndValidate(
        UpdateBookingDto,
        bookingDtoData,
      );
      const canceledBookingData = {
        ...bookingData,
        ticket: {
          status: TicketStatus.CANCELED,
        },
        cancelTimestamp: new Date(2020, 1, 4, 4, 4, 4, 444),
      };

      findBookingByIdSpy = jest
        .spyOn(BookingModel, 'findById')
        .mockReturnValue(
          transformAndValidate(Booking, canceledBookingData) as any,
        );

      await expect(
        bookingService.update(mockBookingId, bookingDto),
      ).rejects.toThrow(BookingAlreadyCanceledException);
      expect(findBookingByIdSpy).toHaveBeenCalledTimes(1);
      expect(findBookingByIdSpy).toHaveBeenCalledWith(mockBookingId);
      expect(findByIdAndUpdateBookingSpy).not.toHaveBeenCalled();
    });

    it('should throw BookingAlreadyCheckedInException', async () => {
      const bookingDto = await transformAndValidate(
        UpdateBookingDto,
        bookingDtoData,
      );
      const checkedInBookingData = {
        ...bookingData,
        passengers: bookingData.passengers.map((p) => ({
          ...p,
          checkInTimestamp: new Date(2020, 1, 5, 5, 5, 5, 555),
        })),
        ticket: {
          status: TicketStatus.ISSUED,
          issueTimestamp: new Date(2020, 1, 3, 3, 3, 3, 333),
        },
      };

      findBookingByIdSpy = jest
        .spyOn(BookingModel, 'findById')
        .mockReturnValue(
          transformAndValidate(Booking, checkedInBookingData) as any,
        );

      await expect(
        bookingService.update(mockBookingId, bookingDto),
      ).rejects.toThrow(BookingAlreadyCheckedInException);
      expect(findBookingByIdSpy).toHaveBeenCalledTimes(1);
      expect(findBookingByIdSpy).toHaveBeenCalledWith(mockBookingId);
      expect(findByIdAndUpdateBookingSpy).not.toHaveBeenCalled();
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

      findBookingByIdSpy = jest
        .spyOn(BookingModel, 'findById')
        .mockReturnValue(transformAndValidate(Booking, bookingData) as any);

      await expect(
        bookingService.update(mockBookingId, bookingDto),
      ).rejects.toThrow(BookingPassengersCountChangeException);
      expect(findBookingByIdSpy).toHaveBeenCalledTimes(1);
      expect(findBookingByIdSpy).toHaveBeenCalledWith(mockBookingId);
      expect(findByIdAndUpdateBookingSpy).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
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
    let findBookingByIdSpy: jest.SpyInstance | undefined;
    let saveBookingSpy: jest.SpyInstance;
    let cancelBookedSeatsSpy: jest.SpyInstance;

    beforeAll(() => {
      // Workaround for jest.spyOn(BookingModel.prototype, 'save') as it doesn't work
      // and throws `TypeError: booking.save is not a function`
      saveBookingSpy = jest.fn().mockResolvedValue(undefined);
      (Booking.prototype as any).save = saveBookingSpy;
    });

    beforeEach(() => {
      cancelBookedSeatsSpy = jest
        .spyOn(flightsService, 'cancelBookedSeats')
        .mockResolvedValue(mockBookedSeats);
    });

    afterEach(() => {
      findBookingByIdSpy?.mockRestore();
      saveBookingSpy.mockReset();
      cancelBookedSeatsSpy.mockRestore();
    });

    afterAll(() => {
      delete (Booking.prototype as any).save;
    });

    it('should cancel the booking and return the canceled booking', async () => {
      const findBookingByIdReturnValue = await transformAndValidate(
        Booking,
        bookingData,
      );
      findBookingByIdSpy = jest
        .spyOn(BookingModel, 'findById')
        .mockResolvedValue(findBookingByIdReturnValue);

      const booking = await bookingService.cancel(mockBookingId);

      expect(findBookingByIdSpy).toHaveBeenCalledTimes(1);
      expect(findBookingByIdSpy).toHaveBeenCalledWith(mockBookingId);
      expect(findBookingByIdReturnValue).toMatchObject({
        ticket: { status: TicketStatus.CANCELED },
        cancelTimestamp: expect.any(Date),
      });
      expect(saveBookingSpy).toHaveBeenCalledTimes(1);
      expect(cancelBookedSeatsSpy).toHaveBeenCalledTimes(1);
      expect(cancelBookedSeatsSpy).toHaveBeenCalledWith(
        mockBookedSeats.map((s) => s.id),
      );
      expect(booking).toMatchObject({
        ...bookingData,
        ticket: { status: TicketStatus.CANCELED },
        cancelTimestamp: expect.any(Date),
      });
    });

    it('should throw BookingNotFoundException', async () => {
      const badBookingId = 'ea548976-3224-46e4-afa0-527990321cec';

      findBookingByIdSpy = jest
        .spyOn(BookingModel, 'findById')
        .mockResolvedValue(null);

      await expect(bookingService.cancel(badBookingId)).rejects.toThrow(
        BookingNotFoundException,
      );
      expect(findBookingByIdSpy).toHaveBeenCalledTimes(1);
      expect(findBookingByIdSpy).toHaveBeenCalledWith(badBookingId);
      expect(saveBookingSpy).not.toHaveBeenCalled();
      expect(cancelBookedSeatsSpy).not.toHaveBeenCalled();
    });

    it('should throw BookingAlreadyCanceledException', async () => {
      const canceledBookingData = {
        ...bookingData,
        ticket: {
          status: TicketStatus.CANCELED,
        },
        cancelTimestamp: new Date(2020, 1, 4, 4, 4, 4, 444),
      };

      findBookingByIdSpy = jest
        .spyOn(BookingModel, 'findById')
        .mockReturnValue(
          transformAndValidate(Booking, canceledBookingData) as any,
        );

      await expect(bookingService.cancel(mockBookingId)).rejects.toThrow(
        BookingAlreadyCanceledException,
      );
      expect(findBookingByIdSpy).toHaveBeenCalledTimes(1);
      expect(findBookingByIdSpy).toHaveBeenCalledWith(mockBookingId);
      expect(saveBookingSpy).not.toHaveBeenCalled();
      expect(cancelBookedSeatsSpy).not.toHaveBeenCalled();
    });

    it('should throw BookingAlreadyCheckedInException', async () => {
      const checkedInBookingData = {
        ...bookingData,
        passengers: bookingData.passengers.map((p) => ({
          ...p,
          checkInTimestamp: new Date(2020, 1, 5, 5, 5, 5, 555),
        })),
        ticket: {
          status: TicketStatus.ISSUED,
          issueTimestamp: new Date(2020, 1, 3, 3, 3, 3, 333),
        },
      };

      findBookingByIdSpy = jest
        .spyOn(BookingModel, 'findById')
        .mockReturnValue(
          transformAndValidate(Booking, checkedInBookingData) as any,
        );

      await expect(bookingService.cancel(mockBookingId)).rejects.toThrow(
        BookingAlreadyCheckedInException,
      );
      expect(findBookingByIdSpy).toHaveBeenCalledTimes(1);
      expect(findBookingByIdSpy).toHaveBeenCalledWith(mockBookingId);
      expect(saveBookingSpy).not.toHaveBeenCalled();
      expect(cancelBookedSeatsSpy).not.toHaveBeenCalled();
    });
  });
});
