import { prop } from '@typegoose/typegoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { uuidProp } from '@common/util/mongo-uuid';
import Gender from '@booking/enums/gender.enum';
import Passport from './passport.entity';

@Exclude()
export default class Passenger {
  @prop()
  @Expose()
  public nameTitle?: string;

  @prop({ required: true })
  @Expose()
  public givenNames!: string;

  @prop({ required: true })
  @Expose()
  public surname!: string;

  @prop({ required: true })
  @Expose()
  public dateOfBirth!: Date;

  @prop({ enum: Gender, required: true })
  @Expose()
  public gender!: Gender;

  @uuidProp({ required: true })
  @Transform((value) => {
    if ('value' in value) {
      // HACK: this is changed because of https://github.com/typestack/class-transformer/issues/879
      return value.obj[value.key].toString();
    }

    return 'unknown value';
  })
  @Expose()
  public bookedSeatId!: string;

  @prop({ type: Passport })
  @Type(() => Passport)
  @Expose()
  public passport?: Passport;

  @prop()
  @Expose()
  public checkInTimestamp?: Date;

  @prop()
  @Expose()
  public boardingTimestamp?: Date;
}
