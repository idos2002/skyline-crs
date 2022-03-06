import { prop } from '@typegoose/typegoose';
import { Exclude, Expose, Type } from 'class-transformer';
import Address from './address.entity';

@Exclude()
export default class ContactDetails {
  @prop({ required: true })
  @Expose()
  public firstName!: string;

  @prop({ required: true })
  @Expose()
  public surname!: string;

  @prop({ required: true })
  @Expose()
  public email!: string;

  @prop({ required: true })
  @Expose()
  public phone!: string;

  @prop({ type: Address, required: true, _id: false })
  @Type(() => Address)
  @Expose()
  public address!: Address;
}
