import { Expose, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';
import BookingBaseDto from './booking.base-dto';
import PassengerDto from './passenger.dto';
import SeatDto from './seat.dto';

export class PassengerWithSeatDto extends PassengerDto {
  @Type(() => SeatDto)
  @ValidateNested()
  @Expose()
  public readonly seat!: SeatDto;
}

export default class CreateBookingDto extends BookingBaseDto {
  @Type(() => PassengerWithSeatDto)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Expose()
  public readonly passengers!: PassengerWithSeatDto[];

  @IsUUID()
  @Expose()
  public readonly flightId!: string;
}
