import mongoose from 'mongoose';
import uuidMongodb from 'uuid-mongodb';

/**
 * The MongoDB UUID buffer type, representing a UUID binary object in code.
 */
export type MongoUUIDBuffer = uuidMongodb.MUUID;

/**
 * A custom {@link mongoose.SchemaType} for a MongoDB UUID binary type.
 * It should be used in conjunction with the mongoose schema type {@link mongoose.Schema.Types.Buffer}.
 *
 * Example usage:
 * ```typescript
 * class SchemaWithUUID {
 *   @prop({ type: MongoUUID, default: MongoUUID.v1 })
 *   public _id!: mongoose.Schema.Types.Buffer;
 * }
 * ```
 */
export class MongoUUID extends mongoose.SchemaType {
  constructor(key: string, options?: mongoose.AnyObject | undefined) {
    super(key, options, 'MongoUUID');
  }

  override cast(val: any): MongoUUIDBuffer {
    return uuidMongodb.from(val);
  }

  /**
   * Generate a new UUID v1.
   * @returns an instance of {@link MongoUUIDBuffer}.
   */
  public static v1(): MongoUUIDBuffer {
    return uuidMongodb.v1();
  }

  /**
   * Generate a new UUID v4.
   * @returns an instance of {@link MongoUUIDBuffer}.
   */
  public static v4(): MongoUUIDBuffer {
    return uuidMongodb.v4();
  }
}

(mongoose.Schema.Types as any).MongoUUID = MongoUUID;

export default MongoUUID;
