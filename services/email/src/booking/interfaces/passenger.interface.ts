import { Binary } from 'mongodb';
import Gender from '../enums/gender.enum';
import Passport from './passport.interface';

export default interface Passenger {
  /**
   * Name title of the passenger, such as Mr, Mrs, etc.
   */
  nameTitle?: string;

  /**
   * Given names of the passenger (first name and middle names) as written in the passport.
   */

  givenNames: string;

  /**
   * Surname (or last name) of the passenger as written in passport.
   */
  surname: string;

  /**
   * Date of birth of the passenger as written in the passport.
   */
  dateOfBirth: Date;

  /**
   * Gender of the passenger as written in the passport.
   */
  gender: Gender;

  /**
   * Booked seat ID of the passenger's seat in the flight in standard UUID format.
   */
  bookedSeatId: Binary;

  /**
   * Passport details for this passenger.
   */
  passport?: Passport;

  /**
   * Check-in timestamp for this passenger.
   */
  checkInTimestamp?: Date;

  /**
   * Plane boarding timestamp for this passenger.
   */
  boardingTimestamp?: Date;
}
