import { Expose, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import CheckInPassengerDto from './check-in-passenger.dto';

/**
 * @openapi
 * components:
 *   schemas:
 *     CheckIn:
 *       required:
 *         - passengers
 *       properties:
 *         passengers:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/CheckInPassenger'
 *           title: Passengers details
 *           description: Passengers details for confirmation and check-in
 */
export default class CheckInDto {
  @Type(() => CheckInPassengerDto)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Expose()
  public readonly passengers!: CheckInPassengerDto[];
}
