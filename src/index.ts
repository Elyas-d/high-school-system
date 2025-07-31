import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { requestLogger } from './middlewares/requestLogger';
import routes from './routes';
import logger from './utils/logger';
import { specs } from './config/swagger';
import './config/passport';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'High School Management System API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
  },
}));

// Session middleware (required for Passport)
app.use(session({
  secret: process.env['SESSION_SECRET'] || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env['NODE_ENV'] === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  logger.info(`🌐 API available at http://localhost:${PORT}/api`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
}); 