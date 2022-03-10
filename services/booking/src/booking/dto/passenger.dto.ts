import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import Gender from '@booking/enums/gender.enum';

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdatePassenger:
 *       type: object
 *       required:
 *         - givenNames
 *         - surname
 *         - dateOfBirth
 *         - gender
 *       properties:
 *         nameTitle:
 *           type: string
 *           title: Name title
 *           description: Name title for the passenger (e.g. Mr, Mrs)
 *           example: Mr
 *         givenNames:
 *           type: string
 *           title: Given names
 *           description: Given names of the passenger (first and middle names)
 *           example: John
 *         surname:
 *           type: string
 *           title: Surname
 *           description: Surname of the passenger (last name)
 *           example: Doe
 *         dateOfBirth:
 *           type: string
 *           format: date-time
 *           title: Date of birth
 *           description: The passenger's date of birth
 *           example: 2000-01-01T00:00:00.000Z
 *         gender:
 *           allOf:
 *             - $ref: '#/components/schemas/Gender'
 *           title: Gender
 *           description: The passenger's gender
 *           example: male
 */
export default class PassengerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly nameTitle?: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly givenNames!: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly surname!: string;

  @Type(() => Date)
  @IsDate()
  @Expose()
  public readonly dateOfBirth!: Date;

  @IsEnum(Gender)
  @Expose()
  public readonly gender!: Gender;
}
