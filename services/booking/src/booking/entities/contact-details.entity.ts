import { prop } from '@typegoose/typegoose';
import Address from './address.entity';

export default class ContactDetails {
  @prop({ required: true })
  public firstName!: string;

  @prop({ required: true })
  public surname!: string;

  @prop({ required: true })
  public email!: string;

  @prop({ required: true })
  public phone!: string;

  @prop({ type: Address, required: true, _id: false })
  public address!: Address;
}
