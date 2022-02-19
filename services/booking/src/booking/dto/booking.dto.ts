import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  ValidateNested,
  IsDate,
  IsEnum,
  IsEmail,
  IsPhoneNumber,
  IsISO31661Alpha2,
  Matches,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import Gender from '@booking/enums/gender.enum';
import IsPostalCodeOf from '@common/util/is-postal-code-of.decorator';

class PassengerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly nameTitle?: string;

  @IsString()
  @IsNotEmpty()
  readonly givenNames!: string;

  @IsString()
  @IsNotEmpty()
  readonly surname!: string;

  @Type(() => Date)
  @IsDate()
  readonly dateOfBirth!: Date;

  @IsEnum(Gender)
  readonly gender!: Gender;
}

class AddressDto {
  @IsISO31661Alpha2()
  public countryCode!: string;

  @IsOptional()
  @Matches(/^[A-Z]{2}-[A-Z0-9]{1,3}$/, {
    message: '$property must be a valid ISO 3166-2 subdivision code',
  })
  public subdivisionCode?: string;

  @IsString()
  @IsNotEmpty()
  public city!: string;

  @IsString()
  @IsNotEmpty()
  public street!: string;

  @IsString()
  @IsNotEmpty()
  public houseNumber!: string;

  @IsPostalCodeOf('countryCode')
  public postalCode!: string;
}

class ContactDetailsDto {
  @IsString()
  @IsNotEmpty()
  public firstName!: string;

  @IsString()
  @IsNotEmpty()
  public surname!: string;

  @IsEmail()
  public email!: string;

  @IsPhoneNumber()
  public phone!: string;

  @Type(() => AddressDto)
  @ValidateNested()
  public address!: AddressDto;
}

export default class BookingDto {
  @Type(() => PassengerDto)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  readonly passengers!: PassengerDto[];

  @IsUUID()
  readonly flightId!: string;

  @Type(() => ContactDetailsDto)
  @ValidateNested()
  readonly contact!: ContactDetailsDto;
}
