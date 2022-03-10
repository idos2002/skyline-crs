import { prop } from '@typegoose/typegoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { uuidProp } from '@common/util/mongo-uuid';
import Gender from '@booking/enums/gender.enum';
import Passport from './passport.entity';

/**
 * @openapi
 * components:
 *   schemas:
 *     Passenger:
 *       type: object
 *       required:
 *         - givenNames
 *         - surname
 *         - dateOfBirth
 *         - gender
 *       properties:
 *         nameTitle:
 *           type: string
 *           title: Name title
 *           description: Name title for the passenger (e.g. Mr, Mrs)
 *           example: Mr
 *         givenNames:
 *           type: string
 *           title: Given names
 *           description: Given names of the passenger (first and middle names)
 *           example: John
 *         surname:
 *           type: string
 *           title: Surname
 *           description: Surname of the passenger (last name)
 *           example: Doe
 *         dateOfBirth:
 *           type: string
 *           format: date-time
 *           title: Date of birth
 *           description: The passenger's date of birth
 *           example: 2000-01-01T00:00:00.000Z
 *         gender:
 *           allOf:
 *             - $ref: '#/components/schemas/Gender'
 *           title: Gender
 *           description: The passenger's gender
 *           example: male
 *         bookedSeatId:
 *           type: string
 *           format: uuid
 *           title: Booked seat ID
 *           description: Booked seat ID of this passenger
 *           example: e3bfa7ae-a03b-11ec-a75d-0242ac120002
 *         passport:
 *           allOf:
 *             - $ref: '#/components/schemas/Passport'
 *           title: Passport details
 *           description: The passenger's passport details (should be filled when checking in)
 *         checkInTimestamp:
 *           type: string
 *           format: date-time
 *           title: Check-in timestamp
 *           description: The time this passenger has checked in
 *           example: 2022-01-05T05:35:12.345Z
 *         boardingTimestamp:
 *           type: string
 *           format: date-time
 *           title: Boarding timestamp
 *           description: The time this passenger has boarded the flight
 *           example: 2022-01-06T01:20:12.345Z
 */
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
