import { prop } from '@typegoose/typegoose';
import { v4 as uuidv4 } from 'uuid';
import { uuidProp } from '@common/util/mongo-uuid';
import Passenger from './passenger.entity';
import ContactDetails from './contact-details.entity';
import Ticket from './ticket.entity';

export default class Booking {
  @uuidProp({ default: uuidv4 })
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
  public passengers!: Passenger[];

  @uuidProp({ required: true })
  public flightId!: string;

  @prop({ type: ContactDetails, required: true, _id: false })
  public contact!: ContactDetails;

  @prop({ type: Ticket, required: true, _id: false })
  public ticket!: Ticket;

  @prop({ required: true, default: Date.now })
  public createdTimestamp!: Date;

  @prop({ type: Date })
  public updatesTimestamps?: Date[];

  @prop()
  public cancelTimestamp?: Date;
}
