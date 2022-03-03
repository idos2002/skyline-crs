import { IsUUID, IsEnum, IsPositive, Matches } from 'class-validator';
import { Expose } from 'class-transformer';
import CabinClass from '@flights/enums/cabin-class.enum';

export default class BookedSeat {
  @IsUUID()
  @Expose({ name: 'id', toClassOnly: true })
  public readonly id!: string;

  @IsEnum(CabinClass)
  @Expose({ name: 'cabin_class', toClassOnly: true })
  public readonly cabinClass!: CabinClass;

  @IsPositive()
  @Expose({ name: 'seat_row', toClassOnly: true })
  public readonly row!: number;

  @Matches(/^[A-Z]$/, {
    message: '$property must be a single uppercase letter (A-Z)',
  })
  @Expose({ name: 'seat_column', toClassOnly: true })
  public readonly column!: string;
}
