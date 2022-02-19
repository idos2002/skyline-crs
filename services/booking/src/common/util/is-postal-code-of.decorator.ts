import {
  isISO31661Alpha2,
  isPostalCode,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
  buildMessage,
} from 'class-validator';

export default function IsPostalCodeOf(
  property: string,
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isPostalCodeOf',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Get the country code field from the argument
          const [countryCodeField] = args.constraints;

          // Get the value of the countryCode field
          const countryCode = (args.object as any)[countryCodeField];

          // Return false if the country code is invalid even though it is checked
          // at class level
          if (!isISO31661Alpha2(countryCode)) {
            return false;
          }

          // Check if the postal code is valid for the given countryCode
          return isPostalCode(value, countryCode);
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            `${eachPrefix} $property must be a valid postal code in the specified country in the property $constraint1`,
          validationOptions,
        ),
      },
    });
  };
}
