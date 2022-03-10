import { prop } from '@typegoose/typegoose';
import { Exclude, Expose } from 'class-transformer';
import TicketStatus from '@booking/enums/ticket-status.enum';

/**
 * @openapi
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       required:
 *         - number
 *         - expirationDate
 *       properties:
 *         status:
 *           allOf:
 *             - $ref: '#/components/schemas/TicketStatus'
 *           title: Status
 *           description: Status of the ticket
 *           example: issued
 *         issueTimestamp:
 *           type: string
 *           format: date-time
 *           title: Issue timestamp
 *           description: The time the ticket was issued
 *           example: 2022-01-01T00:02:50.987Z
 */
@Exclude()
export default class Ticket {
  @prop({ enum: TicketStatus, required: true, default: TicketStatus.PENDING })
  @Expose()
  public status!: TicketStatus;

  @prop()
  @Expose()
  public issueTimestamp?: Date;
}
