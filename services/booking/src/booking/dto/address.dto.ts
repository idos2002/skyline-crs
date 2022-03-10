import { Expose } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsISO31661Alpha2,
  Matches,
} from 'class-validator';
import IsPostalCodeOf from '@common/util/is-postal-code-of.decorator';

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateAddress:
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
 *     UpdateAddress:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateAddress'
 */
export default class AddressDto {
  @IsISO31661Alpha2()
  @Expose()
  public readonly countryCode!: string;

  @IsOptional()
  @Matches(/^[A-Z]{2}-[A-Z0-9]{1,3}$/, {
    message: '$property must be a valid ISO 3166-2 subdivision code',
  })
  @Expose()
  public readonly subdivisionCode?: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly city!: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly street!: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly houseNumber!: string;

  @IsPostalCodeOf('countryCode')
  @Expose()
  public readonly postalCode!: string;
}
