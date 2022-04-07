import TicketStatus from '../enums/ticket-status.enum';

export default interface Ticket {
  /**
   * Status of the ticket to be issued for this PNR.
   */
  status: TicketStatus;

  /**
   * Timestamp of the time a ticket has been issued for this PNR.
   */
  issueTimestamp?: Date;
}
