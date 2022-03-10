import { Exclude, Expose } from 'class-transformer';
import { prop } from '@typegoose/typegoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     Passport:
 *       type: object
 *       required:
 *         - number
 *         - expirationDate
 *         - countryIssued
 *       properties:
 *         number:
 *           type: string
 *           title: Number
 *           description: Passport number
 *           example: 12345678
 *         expirationDate:
 *           type: string
 *           format: date-time
 *           title: Expiration date
 *           description: The passport's expiration date
 *           example: 2030-06-01T00:00:00.000Z
 *         countryIssued:
 *           type: string
 *           pattern: '^[A-Z]{2}$'
 *           title: Country issued
 *           description: The ISO 3166-1 alpha-2 country code of the country this passport was issued in
 *           example: IL
 */
@Exclude()
export default class Passport {
  @prop({ required: true })
  @Expose()
  public number!: string;

  @prop({ required: true })
  @Expose()
  public expirationDate!: Date;

  @prop({
    required: true,
    validate: {
      validator: (v: string) => /^[A-Z]{2}$/.test(v),
      message: 'Country issued must be a valid ISO 3166-1 alpha-2 country code',
    },
  })
  @Expose()
  public countryIssued!: string;
}
