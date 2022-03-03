import CabinClass from '@flights/enums/cabin-class.enum';
import { Expose, Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsPositive,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';

export class SeatMap {
  @IsEnum(CabinClass)
  @Expose({ name: 'cabin_class', toClassOnly: true })
  public readonly cabinClass!: CabinClass;

  @IsPositive()
  @Expose({ name: 'start_row', toClassOnly: true })
  public readonly startRow!: number;

  @IsPositive()
  @Expose({ name: 'end_row', toClassOnly: true })
  public readonly endRow!: number;

  @Matches(/^[A-Z#]+(?:-[A-Z#]+)*$/, {
    message: '$property must be a valid column layout',
  })
  public readonly column_layout!: string;
}

export class FlightBookedSeat {
  @IsPositive()
  @Expose({ name: 'seat_row', toClassOnly: true })
  public readonly row!: number;

  @Matches(/^[A-Z]$/, {
    message: '$property must be a single uppercase letter (A-Z)',
  })
  @Expose({ name: 'seat_column', toClassOnly: true })
  public readonly column!: string;
}

class CabinSeatsCount {
  @IsEnum(CabinClass)
  @Expose({ name: 'cabin_class', toClassOnly: true })
  public readonly cabinClass!: CabinClass;

  @IsPositive()
  @Expose({ name: 'available_seats_count', toClassOnly: true })
  public readonly availableSeatsCount!: number;

  @IsPositive()
  @Expose({ name: 'total_seats_count', toClassOnly: true })
  public readonly totalSeatsCount!: number;
}

export default class Flight {
  @IsUUID()
  @Expose({ name: 'id', toClassOnly: true })
  public readonly id!: string;

  @Type(() => SeatMap)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Expose({ name: 'aircraft_model', toClassOnly: true })
  @Transform(({ value }) => value.seat_maps, { toClassOnly: true })
  public readonly seatMaps!: SeatMap[];

  @Type(() => FlightBookedSeat)
  @IsArray()
  @ValidateNested({ each: true })
  @Expose({ name: 'booked_seats', toClassOnly: true })
  public readonly bookedSeats!: FlightBookedSeat[];

  @Type(() => CabinSeatsCount)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Expose({ name: 'available_seats_counts', toClassOnly: true })
  public readonly cabinSeatsCounts!: CabinSeatsCount[];
}
