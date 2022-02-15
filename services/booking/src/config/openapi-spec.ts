import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Booking Service',
      version: '1.0.0',
    },
  },
  apis: ['./src/booking/**/*.ts', './dist/booking/**/*.js'],
};

const openapiSpecification = swaggerJsdoc(options);

export default openapiSpecification;
