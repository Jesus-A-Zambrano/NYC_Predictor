import { Request, Response, NextFunction } from 'express';
import axios, { AxiosError } from 'axios'; // Import AxiosError
import { getCache, setCache } from '../services/cache.service';
import { logger } from '../services/logger.service';
import { PredictionInput } from '../schemas/prediction.schemas';
import { isModuleNamespaceObject } from 'util/types';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const predictionController = {
  predict: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The validated input is available in req.body (in camelCase)
      // The PredictionInput type is inferred from the schema and includes the 'body' wrapper
      const inputData: PredictionInput = req.body;
      logger.info("Received data from frontend:", inputData);

      // Create a cache key based on the input data nested within body
      const cacheKey = `prediction:${JSON.stringify(inputData)}`;

      // Try to get from cache
      const cachedPrediction = await getCache(cacheKey);
      if (cachedPrediction) {
        logger.info(`Cache hit for data: ${JSON.stringify(inputData)}. Returning cached prediction from cache.`);
        // Cache stores as string, return it directly
        return res.json({ prediction: cachedPrediction });
      }

      logger.info(`Cache miss for data: ${JSON.stringify(inputData)}. Calling ML service.`);

      // Transform inputData.body from camelCase to snake_case for the ML service
      const mlInputData = {
        BOROUGH: inputData.borough,
        BUILDING_CLASS_AT_TIME_OF_SALE: inputData.buildingClassAtTimeOfSale,
        GROSS_SQUARE_FEET: inputData.grossSquareFeet,
        YEAR_BUILT: inputData.yearBuilt,
      };

      logger.info("Sending data to ML service:", mlInputData);

      // Call the ML microservice with the transformed input data
      const response = await axios.post(`${ML_SERVICE_URL}/predict`, mlInputData);

      let prediction = response.data.prediction;

      // Round the prediction to 2 decimal places and convert to string for exact representation
      const roundedPredictionString = parseFloat(prediction).toFixed(2);

      logger.info(`Received prediction: ${prediction}, Rounded to string: ${roundedPredictionString}`);

      // Cache the rounded prediction string
      await setCache(cacheKey, roundedPredictionString, 3600);

      // Send the rounded prediction string in the response
      res.json({ prediction: roundedPredictionString });
    } catch (error) {
      // Log the entire error object for inspection
      logger.error('Full error object during prediction process:', error);

      // Log detailed error response from ML service if available
      if (axios.isAxiosError(error) && error.response) {
        logger.error('ML service error details:', error.response.data);
        // Forward the ML service's error response to the frontend for better debugging
        res.status(error.response.status).json(error.response.data);
      } else {
        // Pass the error to the error handling middleware if it's not an Axios error
        next(error);
      }
    }
  },
};
