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
import CheckInDto from './dto/check-in.dto';

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

    this.registerHandler(
      'checkIn',
      RequestMethod.POST,
      '/:id/checkIn',
      async (req, res) => {
        const id = validateUUID(req, 'id');
        const checkInDto = await transformAndValidateBody(req, CheckInDto);
        const booking = await this.checkIn(id, checkInDto);
        res.status(StatusCodes.OK).send(instanceToPlain(booking));
      },
    );
  }

  /**
   * Create a new booking. Apart from creating the booking,
   * it also queues the booking ot be ticketed as well as a confirmation
   * email to RabbitMQ.
   *
   * @param bookingDto The booking data to create the booking with.
   * @returns A promise to the created booking in the PNR database.
   *
   * @openapi
   * /booking:
   *   post:
   *     tags:
   *       - booking
   *     summary: Create booking
   *     description: |
   *       Creates a new booking for the requested flight,
   *       and queues a ticket for the booking as well as a confirmation email.
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateBooking'
   *       required: true
   *     responses:
   *       '201':
   *         description: Successful Response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Booking'
   *       '404':
   *         $ref: '#/components/responses/FlightNotFound'
   *       '409':
   *         $ref: '#/components/responses/SeatsNotAvailable'
   *       '422':
   *         description: Validation Error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorDetails'
   *             example:
   *               error: Validation error
   *               message: Request has an invalid format.
   *               details:
   *                 - cause: body/passengers/0/gender
   *                   message: gender must be a valid enum value
   */
  public async create(bookingDto: CreateBookingDto): Promise<Booking> {
    const booking = await this.bookingService.create(bookingDto);
    this.ticketService.queueBooking(booking._id);
    this.emailService.queueBookingConfirmationEmail(booking._id);
    return booking;
  }

  /**
   * Find booking with the given ID.
   *
   * @param id The ID of the booking to find.
   * @returns A promise to the found booking.
   *
   * @openapi
   * /booking/{id}:
   *   get:
   *     tags:
   *       - booking
   *     summary: Find booking
   *     description: Finds the booking using the id path parameter.
   *     parameters:
   *       - name: id
   *         description: The ID of the booking to find.
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     security:
   *       - accessToken: []
   *     responses:
   *       '200':
   *         description: Successful Response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Booking'
   *       '401':
   *         $ref: '#/components/responses/UnauthorizedAccess'
   *       '404':
   *         $ref: '#/components/responses/BookingNotFound'
   *       '422':
   *         description: Validation Error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorDetails'
   *             example:
   *               error: Validation error
   *               message: Request has an invalid format.
   *               details:
   *                 - cause: path/id
   *                   message: id must be a UUID
   */
  public async find(id: string): Promise<Booking> {
    const booking = await this.bookingService.find(id);
    return booking;
  }

  /**
   * Update booking for the given booking ID with the given data.
   *
   * @param id The ID of the booking to update.
   * @param bookingDto The data to update the booking with.
   * @returns A promise to the updated booking.
   *
   * @openapi
   * /booking/{id}:
   *   put:
   *     tags:
   *       - booking
   *     summary: Update booking
   *     description: Updates the booking with the given ID using the data passed in the body.
   *     parameters:
   *       - name: id
   *         description: The ID of the booking to update.
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateBooking'
   *       required: true
   *     security:
   *       - accessToken: []
   *     responses:
   *       '200':
   *         description: Successful Response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Booking'
   *       '401':
   *         $ref: '#/components/responses/UnauthorizedAccess'
   *       '404':
   *         $ref: '#/components/responses/BookingNotFound'
   *       '409':
   *         description: Update Conflict
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorDetails'
   *             examples:
   *               passengerCountChange:
   *                 $ref: '#/components/examples/PassengerCountChangeResponse'
   *               alreadyCheckedIn:
   *                 $ref: '#/components/examples/AlreadyCheckedInResponse'
   *               bookingAlreadyCanceled:
   *                 $ref: '#/components/examples/BookingAlreadyCanceledResponse'
   *       '422':
   *         description: Validation Error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorDetails'
   *             example:
   *               error: Validation error
   *               message: Request has an invalid format.
   *               details:
   *                 - cause: path/id
   *                   message: id must be a UUID
   */
  public async update(
    id: string,
    bookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.bookingService.update(id, bookingDto);
    return booking;
  }

  /**
   * Cancel booking with the given booking ID.
   *
   * @param id The ID of the booking to cancel.
   * @returns A promise to the canceled booking.
   *
   * @openapi
   * /booking/{id}/cancel:
   *   post:
   *     tags:
   *       - booking
   *     summary: Cancel booking
   *     description: Cancels the booking with the given ID and queues a cancellation confirmation email.
   *     parameters:
   *       - name: id
   *         description: The ID of the booking to cancel.
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     security:
   *       - accessToken: []
   *     responses:
   *       '200':
   *         description: Successful Response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Booking'
   *       '401':
   *         $ref: '#/components/responses/UnauthorizedAccess'
   *       '404':
   *         $ref: '#/components/responses/BookingNotFound'
   *       409:
   *         description: Cancel Conflict
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorDetails'
   *             examples:
   *               alreadyCheckedIn:
   *                 $ref: '#/components/examples/AlreadyCheckedInResponse'
   *               bookingAlreadyCanceled:
   *                 $ref: '#/components/examples/BookingAlreadyCanceledResponse'
   *       422:
   *         description: Validation Error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorDetails'
   *             example:
   *               error: Validation error
   *               message: Request has an invalid format.
   *               details:
   *                 - cause: path/id
   *                   message: id must be a UUID
   */
  public async cancel(id: string): Promise<Booking> {
    const booking = await this.bookingService.cancel(id);
    this.emailService.queueCancellationConfirmationEmail(id);
    return booking;
  }

  public async checkIn(id: string, checkInDto: CheckInDto): Promise<Booking> {
    const booking = await this.bookingService.checkIn(id, checkInDto);
    this.emailService.queueBoardingPassEmail(id);
    return booking;
  }
}
