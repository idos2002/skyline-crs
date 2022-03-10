import { Expose } from 'class-transformer';
import { IsEnum, IsPositive, Matches } from 'class-validator';
import CabinClass from '@flights/enums/cabin-class.enum';

/**
 * @openapi
 * components:
 *   schemas:
 *     Seat:
 *       type: object
 *       required:
 *         - cabinClass
 *         - row
 *         - column
 *       properties:
 *         cabinClass:
 *           allOf:
 *             - $ref: '#/components/schemas/CabinClass'
 *           title: Cabin class
 *           description: Cabin class of this seat
 *           example: F
 *         row:
 *           type: integer
 *           minimum: 1
 *           title: Row
 *           description: The row of the seat
 *           example: 4
 *         column:
 *           type: string
 *           pattern: '^[A-Z]$'
 *           title: Column
 *           description: The column of the seat
 *           example: D
 */
export default class SeatDto {
  @IsEnum(CabinClass)
  @Expose()
  public readonly cabinClass!: CabinClass;

  @IsPositive()
  @Expose()
  public readonly row!: number;

  @Matches(/^[A-Z]$/, {
    message: '$property must be a single uppercase letter (A-Z)',
  })
  @Expose()
  public readonly column!: string;
}
