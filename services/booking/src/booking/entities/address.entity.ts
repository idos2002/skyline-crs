import { prop } from '@typegoose/typegoose';
import { Exclude, Expose } from 'class-transformer';

/**
 * @openapi
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - countryCode
 *         - city
 *         - street
 *         - houseNumber
 *         - postalCode
 *       properties:
 *         countryCode:
 *           type: string
 *           title: Country code
 *           pattern: ^[A-Z]{2}$
 *           description: ISO 3166-1 alpha-2 country code
 *           example: IL
 *         subdivisionCode:
 *           type: string
 *           title: Surname
 *           pattern: '^[A-Z]{2}-[A-Z0-9]{1,3}$'
 *           description: ISO 3166-2 subdivision code
 *           example: IL-M
 *         city:
 *           type: string
 *           title: City
 *           description: Address city
 *           example: Tel Aviv-Yafo
 *         street:
 *           type: string
 *           title: Street
 *           description: Address street
 *           example: Shlomo Rd.
 *         houseNumber:
 *           type: string
 *           title: House number
 *           description: Address house number
 *           example: '136'
 *         postalCode:
 *           type: string
 *           title: Postal code
 *           description: Address postal code
 *           example: '6603248'
 */
@Exclude()
export default class Address {
  @prop({
    required: true,
    validate: {
      validator: (v: string) => /^[A-Z]{2}$/.test(v),
      message: 'Must be a valid ISO 3166-1 alpha-2 country code',
    },
  })
  @Expose()
  public countryCode!: string;

  @prop({
    validate: {
      validator: (v: string) => /^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(v),
      message: 'Must be a valid ISO 3166-2 subdivision code',
    },
  })
  @Expose()
  public subdivisionCode?: string;

  @prop({ required: true })
  @Expose()
  public city!: string;

  @prop({ required: true })
  @Expose()
  public street!: string;

  @prop({ required: true })
  @Expose()
  public houseNumber!: string;

  @prop({ required: true })
  @Expose()
  public postalCode!: string;
}
