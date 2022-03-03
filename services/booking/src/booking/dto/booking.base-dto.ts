import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import ContactDetailsDto from './contact-details.dto';

export default class BookingBaseDto {
  @Type(() => ContactDetailsDto)
  @ValidateNested()
  @Expose()
  public readonly contact!: ContactDetailsDto;
}
