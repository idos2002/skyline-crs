import { StatusCodes } from 'http-status-codes';
import { instanceToPlain } from 'class-transformer';
import createLogger from '@common/log';
import { RequestMethod, Controller } from '@common/components';
import validateUUID from '@common/util/validate-uuid';
import transformAndValidateBody from '@common/util/transform-and-validate-body';
import BookingService from './booking.service';
import CreateBookingDto from './dto/create-booking.dto';
import UpdateBookingDto from './dto/update-booking.dto';
import Booking from './entities/booking.entity';
import TicketService from '@ticket/ticket.service';
import EmailService from '@email/email.service';

export default class BookingController extends Controller {
  private readonly log = createLogger(__filename);

  constructor(
    private readonly bookingService: BookingService,
    private readonly ticketService: TicketService,
    private readonly emailService: EmailService,
  ) {
    super();

    this.registerHandler(
      'create',
      RequestMethod.POST,
      '/',
      async (req, res) => {
        const bookingDto = await transformAndValidateBody(
          req,
          CreateBookingDto,
        );
        const booking = await this.create(bookingDto);
        res.status(StatusCodes.CREATED).send(instanceToPlain(booking));
      },
    );

    this.registerHandler(
      'find',
      RequestMethod.GET,
      '/:id',
      async (req, res) => {
        const id = validateUUID(req, 'id');
        const booking = await this.find(id);
        res.status(StatusCodes.OK).send(instanceToPlain(booking));
      },
    );

    this.registerHandler(
      'update',
      RequestMethod.PUT,
      '/:id',
      async (req, res) => {
        const id = validateUUID(req, 'id');
        const bookingDto = await transformAndValidateBody(
          req,
          UpdateBookingDto,
        );
        const booking = await this.update(id, bookingDto);
        res.status(StatusCodes.OK).send(instanceToPlain(booking));
      },
    );

    this.registerHandler(
      'cancel',
      RequestMethod.POST,
      '/:id/cancel',
      async (req, res) => {
        const id = validateUUID(req, 'id');
        const booking = await this.cancel(id);
        res.status(StatusCodes.OK).send(instanceToPlain(booking));
      },
    );
  }

  public async create(bookingDto: CreateBookingDto): Promise<Booking> {
    const booking = await this.bookingService.create(bookingDto);
    this.ticketService.queueBooking(booking._id);
    this.emailService.queueBookingConfirmationEmail(booking._id);
    return booking;
  }

  public async find(id: string): Promise<Booking> {
    const booking = await this.bookingService.find(id);
    return booking;
  }

  public async update(
    id: string,
    bookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.bookingService.update(id, bookingDto);
    return booking;
  }

  public async cancel(id: string): Promise<Booking> {
    const booking = await this.bookingService.cancel(id);
    this.emailService.queueCancellationConfirmationEmail(id);
    return booking;
  }
}
