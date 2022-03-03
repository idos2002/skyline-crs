import { Type, Expose } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import BookingBaseDto from './booking.base-dto';
import PassengerDto from './passenger.dto';

export default class UpdateBookingDto extends BookingBaseDto {
  @Type(() => PassengerDto)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Expose()
  public readonly passengers!: PassengerDto[];
}
