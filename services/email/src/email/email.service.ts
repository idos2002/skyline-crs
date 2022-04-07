import path from 'path';
import Email from 'email-templates';
import uuidMongodb from 'uuid-mongodb';
import dateDifferenceInMinutes from 'date-fns/differenceInMinutes';
import { formatInTimeZone } from 'date-fns-tz';
import { find as findGeoLocationTimezone } from 'geo-tz';
import { Attachment } from 'nodemailer/lib/mailer';
import QrCodeService from '../qr-code/qr-code.service';
import BookingService from '../booking/booking.service';
import FlightsService from '../flights/flights.service';
import GeoLocation from '../flights/interfaces/geo-location.interface';
import config from '../config';

export interface EmailBookingConfirmationMessage {
  bookingId: string;
}

export interface EmailFlightTicketMessage {
  bookingId: string;
}

export interface EmailBookingCancellationMessage {
  bookingId: string;
}

export interface EmailBoardingPassMessage {
  bookingId: string;
}

export default class EmailService {
  private readonly skylineEmail = 'no-reply@skyline.com'; // FIXME
  private readonly boardingPassQrCodeCidPrefix = 'boarding-pass-qr-code_';

  private readonly bookingAssetsFolderPath = path.resolve(
    'emails',
    'booking',
    'assets',
  );

  private readonly boardingAssetsFolderPath = path.resolve(
    'emails',
    'boarding',
    'assets',
  );

  private readonly commonEmailOptions: Email.EmailConfig = {
    views: {
      options: {
        extension: 'hbs',
      },
    },
    transport: {
      jsonTransport: true,
    },
    preview: {
      dir: path.resolve('tmp'),
    },
  };

  private readonly commonBookingAttachments: Attachment[] = [
    {
      cid: 'skyline-logo',
      filename: 'skyline-logo.png',
      path: path.join(this.bookingAssetsFolderPath, 'skyline-logo.png'),
      contentDisposition: 'inline',
    },
  ];
  private readonly bookingEmail = new Email({
    ...this.commonEmailOptions,
    message: {
      from: this.skylineEmail,
      attachments: this.commonBookingAttachments,
    },
    juiceResources: {
      webResources: {
        relativeTo: this.bookingAssetsFolderPath,
      },
    },
  });

  private readonly commonBoardingAttachments: Attachment[] = [
    {
      cid: 'skyline-logo',
      filename: 'skyline-logo.png',
      path: path.join(this.boardingAssetsFolderPath, 'skyline-logo.png'),
      contentDisposition: 'inline',
    },
  ];
  private readonly boardingEmail = new Email({
    ...this.commonEmailOptions,
    message: {
      from: this.skylineEmail,
      attachments: this.commonBoardingAttachments,
    },
    juiceResources: {
      webResources: {
        relativeTo: this.boardingAssetsFolderPath,
      },
    },
  });

  private constructor(
    private readonly bookingService: BookingService,
    private readonly flightsService: FlightsService,
    private readonly qrCodeService: QrCodeService,
  ) {}

  public static async create(
    bookingService: BookingService,
    flightsService: FlightsService,
    qrCodeService: QrCodeService,
  ): Promise<EmailService> {
    return new EmailService(bookingService, flightsService, qrCodeService);
  }

  public async emailBookingConfirmation(
    message: EmailBookingConfirmationMessage,
  ) {
    const booking = await this.bookingService.findBooking(message.bookingId);

    const flightId = uuidMongodb.from(booking.flightId).toString();
    const flight = await this.flightsService.findFlight(flightId);

    const orderedBookedSeatIds = booking.passengers.map((p) =>
      uuidMongodb.from(p.bookedSeatId).toString(),
    );
    const bookedSeats = await this.flightsService.findBookedSeats(
      orderedBookedSeatIds,
    );

    const originTimezone = this.findIanaTimezone(flight.origin.geoLocation);
    const destinationTimezone = this.findIanaTimezone(
      flight.destination.geoLocation,
    );

    await this.bookingEmail.send({
      template: 'booking/confirmation',
      message: {
        to: booking.contact.email,
        attachments: [
          ...this.commonBookingAttachments,
          {
            cid: 'airplane-icon',
            filename: 'airplane-icon.png',
            path: path.join(this.bookingAssetsFolderPath, 'airplane-icon.png'),
            contentDisposition: 'inline',
          },
        ],
      },
      locals: {
        bookingId: message.bookingId,
        passengers: booking.passengers.map((passenger, index) => {
          const bookedSeat = bookedSeats.find(
            (s) => s.id === orderedBookedSeatIds[index],
          );
          return {
            nameTitle: passenger.nameTitle,
            givenNames: passenger.givenNames,
            surname: passenger.surname,
            seat: `${bookedSeat?.row}${bookedSeat?.column}`,
          };
        }),
        contact: {
          firstName: booking.contact.firstName,
        },
        airlineIataCode: config().iataAirlineCode,
        flight: {
          serviceId: flight.serviceId,
          departureDate: formatInTimeZone(
            flight.departureTime,
            originTimezone,
            'MMMM d, y',
          ),
          departureTime: formatInTimeZone(
            flight.departureTime,
            originTimezone,
            'HH:mm',
          ),
          arrivalDate: formatInTimeZone(
            flight.arrivalTime,
            destinationTimezone,
            'MMMM d, y',
          ),
          arrivalTime: formatInTimeZone(
            flight.arrivalTime,
            destinationTimezone,
            'HH:mm',
          ),
          duration: this.formatFlightDuration(
            flight.departureTime,
            flight.arrivalTime,
          ),
          origin: {
            iataCode: flight.origin.iataCode,
            city: flight.origin.city,
          },
          destination: {
            iataCode: flight.destination.iataCode,
            city: flight.destination.city,
          },
        },
      },
    });
  }

  public async emailFlightTicket(message: EmailFlightTicketMessage) {
    const booking = await this.bookingService.findBooking(message.bookingId);

    const flightId = uuidMongodb.from(booking.flightId).toString();
    const flight = await this.flightsService.findFlight(flightId);

    const orderedBookedSeatIds = booking.passengers.map((p) =>
      uuidMongodb.from(p.bookedSeatId).toString(),
    );
    const bookedSeats = await this.flightsService.findBookedSeats(
      orderedBookedSeatIds,
    );

    const qrCodeDataUri = await this.qrCodeService.createFlightTicketQrCode(
      { bookingId: message.bookingId },
      { width: 200 },
    );

    const originTimezone = this.findIanaTimezone(flight.origin.geoLocation);
    const destinationTimezone = this.findIanaTimezone(
      flight.destination.geoLocation,
    );

    await this.bookingEmail.send({
      template: 'booking/ticket',
      message: {
        to: booking.contact.email,
        attachments: [
          ...this.commonBookingAttachments,
          {
            cid: 'airplane-icon',
            filename: 'airplane-icon.png',
            path: path.join(this.bookingAssetsFolderPath, 'airplane-icon.png'),
            contentDisposition: 'inline',
          },
          {
            cid: 'flight-ticket-qr-code',
            filename: 'flight-ticket-qr-code.png',
            path: qrCodeDataUri,
          },
        ],
      },
      locals: {
        bookingId: message.bookingId,
        passengers: booking.passengers.map((passenger, index) => {
          const bookedSeat = bookedSeats.find(
            (s) => s.id === orderedBookedSeatIds[index],
          );
          return {
            nameTitle: passenger.nameTitle,
            givenNames: passenger.givenNames,
            surname: passenger.surname,
            seat: `${bookedSeat?.row}${bookedSeat?.column}`,
          };
        }),
        contact: {
          firstName: booking.contact.firstName,
        },
        airlineIataCode: config().iataAirlineCode,
        flight: {
          serviceId: flight.serviceId,
          departureDate: formatInTimeZone(
            flight.departureTime,
            originTimezone,
            'MMMM d, y',
          ),
          departureTime: formatInTimeZone(
            flight.departureTime,
            originTimezone,
            'HH:mm',
          ),
          arrivalDate: formatInTimeZone(
            flight.arrivalTime,
            destinationTimezone,
            'MMMM d, y',
          ),
          arrivalTime: formatInTimeZone(
            flight.arrivalTime,
            destinationTimezone,
            'HH:mm',
          ),
          duration: this.formatFlightDuration(
            flight.departureTime,
            flight.arrivalTime,
          ),
          origin: {
            iataCode: flight.origin.iataCode,
            city: flight.origin.city,
          },
          destination: {
            iataCode: flight.destination.iataCode,
            city: flight.destination.city,
          },
        },
      },
    });
  }

  public async emailBookingCancellation(
    message: EmailBookingCancellationMessage,
  ) {
    const booking = await this.bookingService.findBooking(message.bookingId);

    const flightId = uuidMongodb.from(booking.flightId).toString();
    const flight = await this.flightsService.findFlight(flightId);

    await this.bookingEmail.send({
      template: 'booking/cancel',
      message: {
        to: booking.contact.email,
      },
      locals: {
        bookingId: message.bookingId,
        contact: {
          firstName: booking.contact.firstName,
        },
        flight: {
          origin: {
            city: flight.origin.city,
          },
          destination: {
            city: flight.destination.city,
          },
        },
      },
    });
  }

  public async emailBoardingPass(message: EmailBoardingPassMessage) {
    const booking = await this.bookingService.findBooking(message.bookingId);

    const flightId = uuidMongodb.from(booking.flightId).toString();
    const flight = await this.flightsService.findFlight(flightId);

    const orderedBookedSeatIds = booking.passengers.map((p) =>
      uuidMongodb.from(p.bookedSeatId).toString(),
    );
    const bookedSeats = await this.flightsService.findBookedSeats(
      orderedBookedSeatIds,
    );

    const generateQrCodeCid = (passengerIndex: number) =>
      this.boardingPassQrCodeCidPrefix + passengerIndex;

    const boardingPassQrCodeAttachments = await Promise.all(
      booking.passengers.map(async (passenger, index) => {
        const bookedSeatId =
          orderedBookedSeatIds[index] ??
          uuidMongodb.from(passenger.bookedSeatId).toString();

        const qrCodeDataUri = await this.qrCodeService.createBoardingPassQrCode(
          {
            bookingId: message.bookingId,
            bookedSeatId,
          },
          { width: 128 },
        );

        return {
          cid: generateQrCodeCid(index),
          filename: `flight-ticket-qr-code_passenger-${index}.png`,
          path: qrCodeDataUri,
        };
      }),
    );

    const originTimezone = this.findIanaTimezone(flight.origin.geoLocation);
    const destinationTimezone = this.findIanaTimezone(
      flight.destination.geoLocation,
    );

    await this.boardingEmail.send({
      template: 'boarding/ticket',
      message: {
        to: booking.contact.email,
        attachments: [
          ...this.commonBoardingAttachments,
          {
            cid: 'airplane-icon',
            filename: 'airplane-icon.png',
            path: path.join(this.boardingAssetsFolderPath, 'airplane-icon.png'),
            contentDisposition: 'inline',
          },
          ...boardingPassQrCodeAttachments,
        ],
      },
      locals: {
        bookingId: message.bookingId,
        passengers: booking.passengers.map((passenger, index) => {
          const bookedSeat = bookedSeats.find(
            (s) => s.id === orderedBookedSeatIds[index],
          );
          return {
            boardingPassQrCodeCid: generateQrCodeCid(index),
            nameTitle: passenger.nameTitle,
            givenNames: passenger.givenNames,
            surname: passenger.surname,
            cabinClass: bookedSeat?.cabinClass,
            seat: `${bookedSeat?.row}${bookedSeat?.column}`,
          };
        }),
        contact: {
          firstName: booking.contact.firstName,
        },
        airlineIataCode: config().iataAirlineCode,
        flight: {
          serviceId: flight.serviceId,
          departureDate: formatInTimeZone(
            flight.departureTime,
            originTimezone,
            'MMMM d, y',
          ),
          departureTime: formatInTimeZone(
            flight.departureTime,
            originTimezone,
            'HH:mm',
          ),
          arrivalDate: formatInTimeZone(
            flight.arrivalTime,
            destinationTimezone,
            'MMMM d, y',
          ),
          arrivalTime: formatInTimeZone(
            flight.arrivalTime,
            destinationTimezone,
            'HH:mm',
          ),
          duration: this.formatFlightDuration(
            flight.departureTime,
            flight.arrivalTime,
          ),
          origin: {
            iataCode: flight.origin.iataCode,
            city: flight.origin.city,
          },
          destination: {
            iataCode: flight.destination.iataCode,
            city: flight.destination.city,
          },
        },
      },
    });
  }

  private findIanaTimezone(geoLocation: GeoLocation): string {
    const timezones = findGeoLocationTimezone(
      geoLocation.latitude,
      geoLocation.longitude,
    );
    return timezones[0] ?? 'Etc/GMT';
  }

  private formatFlightDuration(departureTime: Date, arrivalTime: Date): string {
    const flightDurationInMinutes = dateDifferenceInMinutes(
      arrivalTime,
      departureTime,
    );
    const hours = Math.floor(flightDurationInMinutes / 60);
    const minutes = flightDurationInMinutes % 60;
    return `${hours}:${minutes}`;
  }
}
