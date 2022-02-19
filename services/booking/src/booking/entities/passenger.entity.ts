import { prop } from '@typegoose/typegoose';
import { uuidProp } from '@common/util/mongo-uuid';
import Gender from '@booking/enums/gender.enum';
import Passport from './passport.entity';

export default class Passenger {
  @prop()
  public nameTitle?: string;

  @prop({ required: true })
  public givenNames!: string;

  @prop({ required: true })
  public surname!: string;

  @prop({ required: true })
  public dateOfBirth!: Date;

  @prop({ enum: Gender, required: true })
  public gender!: Gender;

  @uuidProp()
  public bookedSeatId?: string;

  @prop({ type: Passport })
  public passport?: Passport;

  @prop()
  public checkInTimestamp?: Date;

  @prop()
  public boardingTimestamp?: Date;
}
