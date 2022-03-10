import { prop } from '@typegoose/typegoose';
import { Exclude, Expose, Type } from 'class-transformer';
import Address from './address.entity';

/**
 * @openapi
 * components:
 *   schemas:
 *     ContactDetails:
 *       type: object
 *       required:
 *         - firstName
 *         - surname
 *         - email
 *         - phone
 *         - address
 *       properties:
 *         firstName:
 *           type: string
 *           title: First name
 *           description: First name of the person who made the booking
 *           example: John
 *         surname:
 *           type: string
 *           title: Surname
 *           description: Surname (last name) of the person who made the booking
 *           example: Doe
 *         email:
 *           type: string
 *           title: Email address
 *           description: Contact email address
 *           example: john.doe@example.com
 *         phone:
 *           type: string
 *           title: Phone number
 *           description: International phone number to contact
 *           example: '+972541234567'
 *         address:
 *           allOf:
 *             - $ref: '#/components/schemas/Address'
 *           title: Address
 *           description: Contact address for the booking
 */
@Exclude()
export default class ContactDetails {
  @prop({ required: true })
  @Expose()
  public firstName!: string;

  @prop({ required: true })
  @Expose()
  public surname!: string;

  @prop({ required: true })
  @Expose()
  public email!: string;

  @prop({ required: true })
  @Expose()
  public phone!: string;

  @prop({ type: Address, required: true, _id: false })
  @Type(() => Address)
  @Expose()
  public address!: Address;
}
