import { Expose, Type } from 'class-transformer';
import { IsDefined, IsUUID, ValidateNested } from 'class-validator';
import PassengerDto from './passenger.dto';
import PassportDto from './passport.dto';

/**
 * @openapi
 * components:
 *   schemas:
 *     CheckInPassenger:
 *       allOf:
 *         - $ref: '#/components/schemas/UpdatePassenger'
 *         - type: object
 *           required:
 *             - bookedSeatId
 *             - passport
 *           properties:
 *             bookedSeatId:
 *               type: string
 *               format: uuid
 *               title: Booked seat ID
 *               description: The passenger's booked seat ID
 *               example: b7b6551a-9b16-11ec-9ff4-0242ac120002
 *             passport:
 *               allOf:
 *                 - $ref: '#/components/schemas/CreatePassport'
 *               title: Passport details
 *               description: Passport details for checking in the passenger
 */
export default class CheckInPassengerDto extends PassengerDto {
  @IsUUID()
  @Expose()
  bookedSeatId!: string;

  @Type(() => PassportDto)
  @IsDefined()
  @ValidateNested()
  @Expose()
  passport!: PassportDto;
}
