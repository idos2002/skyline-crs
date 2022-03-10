import { prop } from '@typegoose/typegoose';
import { v4 as uuidv4 } from 'uuid';
import { Expose, Type, Transform, Exclude } from 'class-transformer';
import { uuidProp } from '@common/util/mongo-uuid';
import Passenger from './passenger.entity';
import ContactDetails from './contact-details.entity';
import Ticket from './ticket.entity';

/**
 * @openapi
 * components:
 *   schemas:
 *     Booking:
 *       required:
 *         - id
 *         - passengers
 *         - flightId
 *         - contact
 *         - ticket
 *         - createdTimestamp
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           title: Booking ID
 *           description: ID of this booking
 *           example: 17564e2f-7d32-4d4a-9d99-27ccd768fb7d
 *         passengers:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/Passenger'
 *           title: Passengers details
 *           description: Passengers details for the booking
 *         flightId:
 *           type: string
 *           format: uuid
 *           title: Flight ID
 *           description: ID of the flight for this booking
 *           example: eb2e5080-000e-440d-8242-46428e577ce5
 *         contact:
 *           allOf:
 *             - $ref: '#/components/schemas/ContactDetails'
 *           title: Contact details
 *           description: Contact details of the booking
 *         ticket:
 *           allOf:
 *             - $ref: '#/components/schemas/Ticket'
 *           title: Ticket details
 *           description: Details about the ticket for this booking
 *         createdTimestamp:
 *           type: string
 *           format: date-time
 *           title: Creation timestamp
 *           description: The creation time of this booking
 *           example: 2022-01-01T05:35:12.345Z
 *         updatesTimestamps:
 *           type: array
 *           title: Updates timestamps
 *           description: The updates timestamps of this booking
 *           items:
 *             type: string
 *             format: date-time
 *             example: 2022-01-02T05:35:12.345Z
 *         cancelTimestamp:
 *           type: string
 *           format: date-time
 *           title: Cancellation timestamp
 *           description: The cancellation time of this booking
 *           example: 2022-01-05T05:35:12.345Z
 */
@Exclude()
export default class Booking {
  @uuidProp({ default: uuidv4 })
  @Transform((value) => {
    if ('value' in value) {
      // HACK: this is changed because of https://github.com/typestack/class-transformer/issues/879
      return value.obj[value.key].toString();
    }

    return 'unknown value';
  })
  @Expose({ name: 'id' })
  public _id!: string;

  @prop({
    type: Passenger,
    required: true,
    _id: false,
    validate: {
      validator: (a: Passenger[]) => a.length > 0,
      message: 'Passengers list cannot be empty',
    },
  })
  @Type(() => Passenger)
  @Expose()
  public passengers!: Passenger[];

  @uuidProp({ required: true })
  @Expose()
  public flightId!: string;

  @prop({ type: ContactDetails, required: true, _id: false })
  @Type(() => ContactDetails)
  @Expose()
  public contact!: ContactDetails;

  @prop({ type: Ticket, required: true, _id: false })
  @Type(() => Ticket)
  @Expose()
  public ticket!: Ticket;

  @prop({ required: true, default: Date.now })
  @Expose()
  public createdTimestamp!: Date;

  @prop({ type: Date })
  @Expose()
  public updatesTimestamps?: Date[];

  @prop()
  @Expose()
  public cancelTimestamp?: Date;
}
