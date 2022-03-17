import swaggerJsdoc from 'swagger-jsdoc';

const description = `\
The booking service is responsible for managing the booking and check-in process. This service processes
a booking request from a client and creates a corresponding PNR for the request, as well as verifying the
data integrity of the request before adding the PNR to to database. The booking service is not responsible
for the ticketing process, and only adds it to the ticketing queue to be ticketed when available.
It also queues emails to clients for corresponding actions.

## Features
- Create booking for a requested flight (also, queues the booking to be ticketed and to email a confirmation email).
- Get booking details.
- Update existing booking.
- Cancel booking (also, queues a cancellation confirmation email).
- Check in passengers of the booking (also, queues the boarding pass for the checked-in passengers to be emailed)`;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Booking Service',
      description: description,
      version: '1.0.0',
    },
    tags: [
      {
        name: 'booking',
        description: 'Booking management',
      },
    ],
  },
  apis: ['./src/**/*.ts', './dist/**/*.js'],
};

const openapiSpecification = swaggerJsdoc(options);

// Sort the schemas alphabetically
const schemas: Record<string, any> = (openapiSpecification as any).components
  .schemas;
(openapiSpecification as any).components.schemas = Object.keys(schemas)
  .sort()
  .reduce((sorted, key) => {
    sorted[key] = schemas[key];
    return sorted;
  }, {} as Record<string, any>);

export default openapiSpecification;
