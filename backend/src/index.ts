import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { setupLogger } from './services/logger.service';
import { setupCache } from './services/cache.service';
import { errorHandler } from './middleware/error.middleware';
import apiRoutes from './routes';

const app = express();
const port = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter); // Apply to all /api/ routes

// Body Parser
app.use(express.json());

// Logging
const logger = setupLogger();

// Cache (Redis)
const cacheClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

cacheClient.connect().catch(err => {
    logger.error('Failed to connect to Redis:', err);
});

setupCache(cacheClient);

// Swagger Setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ML Prediction API',
    version: '1.0.0',
    description: 'API for ML predictions',
  },
  servers: [
    { url: `/api` }, // Base path for API routes
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`API documentation available at http://localhost:${port}/api-docs`);
});

export default app;
