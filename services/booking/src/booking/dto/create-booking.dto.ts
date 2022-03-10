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

export class PassengerWithSeatDto extends PassengerDto {
  @Type(() => SeatDto)
  @IsDefined()
  @ValidateNested()
  @Expose()
  public readonly seat!: SeatDto;
}

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
