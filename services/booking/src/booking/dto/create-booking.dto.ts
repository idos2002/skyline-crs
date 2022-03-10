import { Expose, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import ContactDetailsDto from './contact-details.dto';
import PassengerDto from './passenger.dto';
import SeatDto from './seat.dto';

/**
 * @openapi
 * components:
 *   schemas:
 *     CreatePassenger:
 *       allOf:
 *         - $ref: '#/components/schemas/UpdatePassenger'
 *         - type: object
 *           required:
 *             - seat
 *           properties:
 *             seat:
 *               allOf:
 *                 - $ref: '#/components/schemas/Seat'
 *               title: Seat
 *               description: The seat to book for the passenger
 */
export class PassengerWithSeatDto extends PassengerDto {
  @Type(() => SeatDto)
  @IsDefined()
  @ValidateNested()
  @Expose()
  public readonly seat!: SeatDto;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateBooking:
 *       required:
 *         - passengers
 *         - flightId
 *         - contact
 *       properties:
 *         passengers:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/CreatePassenger'
 *           title: Passengers details
 *           description: Passengers details for the booking
 *         flightId:
 *           type: string
 *           format: uuid
 *           title: Flight ID
 *           description: ID of the flight to book for
 *           example: eb2e5080-000e-440d-8242-46428e577ce5
 *         contact:
 *           allOf:
 *             - $ref: '#/components/schemas/CreateContactDetails'
 *           title: Contact details
 *           description: Contact details of the booking
 */
export default class CreateBookingDto {
  @Type(() => PassengerWithSeatDto)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Expose()
  public readonly passengers!: PassengerWithSeatDto[];

  @IsUUID()
  @Expose()
  public readonly flightId!: string;

  @Type(() => ContactDetailsDto)
  @IsDefined()
  @ValidateNested()
  @Expose()
  public readonly contact!: ContactDetailsDto;
}
