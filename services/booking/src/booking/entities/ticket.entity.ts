import { prop } from '@typegoose/typegoose';
import TicketStatus from '@booking/enums/ticket-status.enum';

export default class Ticket {
  @prop({ enum: TicketStatus, required: true })
  public status!: TicketStatus;

  @prop()
  public issueTimestamp?: Date;
}
