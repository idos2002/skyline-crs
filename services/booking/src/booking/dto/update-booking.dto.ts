import { Type, Expose } from 'class-transformer';
import {
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsDefined,
} from 'class-validator';
import ContactDetailsDto from './contact-details.dto';
import PassengerDto from './passenger.dto';

export default class UpdateBookingDto {
  @Type(() => PassengerDto)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Expose()
  public readonly passengers!: PassengerDto[];

  @Type(() => ContactDetailsDto)
  @IsDefined()
  @ValidateNested()
  @Expose()
  public readonly contact!: ContactDetailsDto;
}
