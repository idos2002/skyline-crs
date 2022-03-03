import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import Gender from '@booking/enums/gender.enum';

export default class PassengerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly nameTitle?: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly givenNames!: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  public readonly surname!: string;

  @Type(() => Date)
  @IsDate()
  @Expose()
  public readonly dateOfBirth!: Date;

  @IsEnum(Gender)
  @Expose()
  public readonly gender!: Gender;
}
