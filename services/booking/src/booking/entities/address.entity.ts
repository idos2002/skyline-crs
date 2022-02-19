import { prop } from '@typegoose/typegoose';

export default class Address {
  @prop({
    required: true,
    validate: {
      validator: (v: string) => /^[A-Z]{2}$/.test(v),
      message: 'Must be a valid ISO 3166-1 alpha-2 country code',
    },
  })
  public countryCode!: string;

  @prop({
    validate: {
      validator: (v: string) => /^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(v),
      message: 'Must be a valid ISO 3166-2 subdivision code',
    },
  })
  public subdivisionCode?: string;

  @prop({ required: true })
  public city!: string;

  @prop({ required: true })
  public street!: string;

  @prop({ required: true })
  public houseNumber!: string;

  @prop({ required: true })
  public postalCode!: string;
}
