const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'High School Management System API',
      version: '1.2.0',
      description: 'API documentation for the High School Management System',
    },
    servers: [
      {
        url: 'https://33ea01710551.ngrok-free.app/api',
        description: 'Ngrok Tunnel',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = { specs }; 