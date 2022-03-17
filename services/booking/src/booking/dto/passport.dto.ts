import { Expose, Type } from 'class-transformer';
import {
  IsDate,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsString,
} from 'class-validator';

/**
 * @openapi
 * components:
 *   schemas:
 *     CreatePassport:
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
export default class PassportDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  number!: string;

  @Type(() => Date)
  @IsDate()
  @Expose()
  expirationDate!: Date;

  @IsISO31661Alpha2()
  @Expose()
  countryIssued!: string;
}
