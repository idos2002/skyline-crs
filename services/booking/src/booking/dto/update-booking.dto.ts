import { Type, Expose } from 'class-transformer';
import {
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsDefined,
} from 'class-validator';
import ContactDetailsDto from './contact-details.dto';
import PassengerDto from './passenger.dto';

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateBooking:
 *       required:
 *         - passengers
 *         - contact
 *       properties:
 *         passengers:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/UpdatePassenger'
 *           title: Passengers details
 *           description: Passengers details for the booking
 *         contact:
 *           allOf:
 *             - $ref: '#/components/schemas/UpdateContactDetails'
 *           title: Contact details
 *           description: Contact details of the booking
 */
export default class UpdateBookingDto {
  @Type(() => PassengerDto)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Expose()
  public readonly passengers!: PassengerDto[];

  @Type(() => ContactDetailsDto)
  @IsDefined()
  @ValidateNested()
  @Expose()
  public readonly contact!: ContactDetailsDto;
}
