import { mongoose, prop } from '@typegoose/typegoose';
import uuidMongodb from 'uuid-mongodb';

/**
 * The MongoDB UUID buffer type, representing a UUID binary object in code.
 */
export type MongoUUIDBuffer = uuidMongodb.MUUID;

/**
 * A custom {@link mongoose.SchemaType} for a MongoDB UUID binary type.
 * It should not be used directly, an only through the decorator {@link uuidProp}.
 *
 * Example usage:
 * ```typescript
 * class SchemaWithUUID {
 *   @uuidProp()
 *   public uuid!: string;
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

/**
 * A wrapper around Typegoose's decorator {@link prop} for MongoDB UUID support.
 * Since UUIDs in JavaScript/TypeScript are represented as strings, it exposes a
 * getter and setter for this property to be used as a string and hides the usage
 * of the {@link MongoUUID} type.
 *
 * It configures by default the decorator options:
 * - `type` - The {@link MongoUUID} custom schema type.
 * - `get` and `set`.
 *
 * Example usage:
 * ```typescript
 * class SchemaWithUUID {
 *   @uuidProp()
 *   public uuid!: string;
 * }
 * ```
 *
 * @param options Passed to the decorator {@link prop} and merged with the configuration of this wrapper.
 * @param kind Passed to the decorator {@link prop} as is.
 */
export function uuidProp(
  options?: Parameters<typeof prop>[0],
  kind?: Parameters<typeof prop>[1],
): ReturnType<typeof prop> {
  return prop(
    {
      type: MongoUUID,
      set: (v: string) => uuidMongodb.from(v),
      get: (v?: uuidMongodb.MUUID) => v?.toString(),
      ...options,
    },
    kind,
  );
}

export default { MongoUUID, uuidProp };
