import { Expose } from 'class-transformer';
import { IsEnum, IsPositive, Matches } from 'class-validator';
import CabinClass from '@flights/enums/cabin-class.enum';

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
