import { Expose } from 'class-transformer';
import { prop } from '@typegoose/typegoose';

export default class Passport {
  @prop({ required: true })
  @Expose()
  public number!: string;

  @prop({ required: true })
  @Expose()
  public expirationDate!: Date;

  @prop({
    required: true,
    validate: {
      validator: (v: string) => /^[A-Z]{2}$/.test(v),
      message: 'Country issued must be a valid ISO 3166-1 alpha-2 country code',
    },
  })
  @Expose()
  public countryIssued!: string;
}
