import { SwaggerUiOptions } from 'swagger-ui-express';

const swaggerUiOptions: SwaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    operationsSorter: 'alpha',
    tagsSorter: 'alpha',
  },
};

export default swaggerUiOptions;
