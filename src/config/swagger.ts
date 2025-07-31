import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env['PORT'] || 3000;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'High School Management System API',
      version: '1.0.0',
      description: 'A comprehensive API for managing high school operations including students, teachers, classes, grades, and more.',
      contact: {
        name: 'API Support',
        email: 'support@school.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.school.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF'],
              description: 'User role in the system',
            },
            phoneNumber: {
              type: 'string',
              description: 'User phone number',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
            },
          },
        },
        Student: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Student unique identifier',
            },
            userId: {
              type: 'string',
              description: 'Associated user ID',
            },
            gradeLevelId: {
              type: 'string',
              description: 'Grade level ID',
            },
            classId: {
              type: 'string',
              description: 'Class ID (optional)',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (minimum 6 characters)',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Login success status',
            },
            token: {
              type: 'string',
              description: 'JWT access token',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/modules/*/routes/*.ts',
    './src/modules/*/*.routes.ts',
  ],
};

export const specs = swaggerJsdoc(options); 