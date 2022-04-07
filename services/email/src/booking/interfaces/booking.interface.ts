import { Binary } from 'mongodb';
import ContactDetails from './contact-details.interface';
import Passenger from './passenger.interface';
import Ticket from './ticket.interface';

export default interface Booking {
  /**
   * ID of the booking in a standard binary UUID format.
   */
  _id: Binary;

  /**
   * Passengers of this booking.
   */
  passengers: Passenger[];

  /**
   * Flight ID of the flight the booking was made for in standard UUID format.
   */
  flightId: Binary;

  /**
   * Contact details of the person who made the booking.
   */
  contact: ContactDetails;

  /**
   * Information about the ticketing status of this PNR.
   */
  ticket: Ticket;

  /**
   * The timestamp on which this PNR has been created.
   */
  createdTimestamp: Date;

  /**
   * List of the timestamps on which this PNR has been updated.
   */
  updatesTimestamps?: Date[];

  /**
   * Timestamp on which this booking (PNR) has been canceled.
   */
  cancelTimestamp?: Date;
}
