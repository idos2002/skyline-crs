import { Expose } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsISO31661Alpha2,
  Matches,
} from 'class-validator';
import IsPostalCodeOf from '@common/util/is-postal-code-of.decorator';

export default class AddressDto {
  @IsISO31661Alpha2()
  @Expose()
  public readonly countryCode!: string;

  @IsOptional()
  @Matches(/^[A-Z]{2}-[A-Z0-9]{1,3}$/, {
    message: '$property must be a valid ISO 3166-2 subdivision code',
  })
  @Expose()
  public readonly subdivisionCode?: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly city!: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly street!: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly houseNumber!: string;

  @IsPostalCodeOf('countryCode')
  @Expose()
  public readonly postalCode!: string;
}
