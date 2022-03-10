/**
 * @openapi
 * components:
 *   schemas:
 *     TicketStatus:
 *       type: string
 *       enum:
 *         - pending
 *         - issued
 *         - canceled
 *       description: |-
 *         The booking's ticket status.
 *
 *         There are three states the ticket may be in:
 *         - Pending - The booking is pending to be ticketed.
 *         - Issued - A ticket has been issued for the booking.
 *         - Canceled - The booking has been canceled, hence the ticket is canceled as well.
 */
enum TicketStatus {
  PENDING = 'pending',
  ISSUED = 'issued',
  CANCELED = 'canceled',
}

export default TicketStatus;
