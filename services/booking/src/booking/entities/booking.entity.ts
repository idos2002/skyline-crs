import { prop } from '@typegoose/typegoose';
import { v4 as uuidv4 } from 'uuid';
import { Expose, Type, Transform, Exclude } from 'class-transformer';
import { uuidProp } from '@common/util/mongo-uuid';
import Passenger from './passenger.entity';
import ContactDetails from './contact-details.entity';
import Ticket from './ticket.entity';

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
