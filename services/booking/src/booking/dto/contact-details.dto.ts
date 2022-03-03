import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import AddressDto from './address.dto';

export default class ContactDetailsDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly firstName!: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly surname!: string;

  @IsEmail()
  @Expose()
  public readonly email!: string;

  @IsPhoneNumber()
  @Expose()
  public readonly phone!: string;

  @Type(() => AddressDto)
  @ValidateNested()
  @Expose()
  public readonly address!: AddressDto;
}
