import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  ValidateNested,
  IsDefined,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import AddressDto from './address.dto';

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateContactDetails:
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
 *             - $ref: '#/components/schemas/CreateAddress'
 *           title: Address
 *           description: Contact address for the booking
 *     UpdateContactDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateContactDetails'
 *         - type: object
 *           required:
 *             - address
 *           properties:
 *             address:
 *               allOf:
 *                 - $ref: '#/components/schemas/UpdateAddress'
 *               title: Address
 *               description: Contact address for the booking
 */
export default class ContactDetailsDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly firstName!: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly surname!: string;

  @IsEmail()
  @Expose()
  public readonly email!: string;

  @IsPhoneNumber()
  @Expose()
  public readonly phone!: string;

  @Type(() => AddressDto)
  @IsDefined()
  @ValidateNested()
  @Expose()
  public readonly address!: AddressDto;
}
