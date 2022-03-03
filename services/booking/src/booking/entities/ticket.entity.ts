import { prop } from '@typegoose/typegoose';
import { Expose } from 'class-transformer';
import TicketStatus from '@booking/enums/ticket-status.enum';

export default class Ticket {
  @prop({ enum: TicketStatus, required: true, default: TicketStatus.PENDING })
  @Expose()
  public status!: TicketStatus;

  @prop()
  @Expose()
  public issueTimestamp?: Date;
}
