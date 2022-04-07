import Address from './address.interface';

export default interface ContactDetails {
  /**
   * First name of the person who made the booking.
   */
  firstName: string;

  /**
   * Surname (or last name) of the person who made the booking.
   */
  surname: string;

  /**
   * Email address.
   */
  email: string;

  /**
   * International phone number.
   */
  phone: string;

  /**
   * Address of the person who made the booking.
   */
  address: Address;
}
