import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { getCache, setCache } from '../services/cache.service';
import { logger } from '../services/logger.service';
import { PredictionInput } from '../schemas/prediction.schemas';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const predictionController = {
  predict: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The validated input is available in req.body
      const inputData: PredictionInput = req.body;

      // Create a cache key based on the input data
      const cacheKey = `prediction:${JSON.stringify(inputData)}`;

      // Try to get from cache
      const cachedPrediction = await getCache(cacheKey);
      if (cachedPrediction) {
        logger.info(`Cache hit for data: ${JSON.stringify(inputData)}`);
        // Ensure the cached value is parsed correctly back to a number
        return res.json({ prediction: parseFloat(cachedPrediction) });
      }

      logger.info(`Cache miss for data: ${JSON.stringify(inputData)}. Calling ML service.`);

      // Call the ML microservice with the input data
      const response = await axios.post(`${ML_SERVICE_URL}/predict`, inputData);

      const prediction = response.data.prediction;

      // Cache the result (e.g., for 1 hour)
      // Convert prediction to string before caching as Redis stores strings
      await setCache(cacheKey, prediction.toString(), 3600);

      res.json({ prediction });
    } catch (error) {
      logger.error('Error during prediction process:', error);
      // Pass the error to the error handling middleware
      next(error);
    }
  },
};
