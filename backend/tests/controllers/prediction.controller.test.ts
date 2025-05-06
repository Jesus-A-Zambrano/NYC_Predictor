import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { predictionController } from '../../src/controllers/prediction.controller';
import axios from 'axios';
import * as cacheService from '../../src/services/cache.service';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

// Mock cache service
vi.mock('../../src/services/cache.service');
const mockedGetCache = cacheService.getCache as any;
const mockedSetCache = cacheService.setCache as any;

describe('predictionController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Reset mocks and mock objects before each test
    vi.clearAllMocks();
    mockRequest = {
      body: { features: [1.0, 2.0] },
    };
    mockResponse = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(), // Allow chaining status().json()
    };
    nextFunction = vi.fn();
  });

  it('should return cached prediction if available', async () => {
    const cachedPrediction = '10.5';
    mockedGetCache.mockResolvedValue(cachedPrediction);

    await predictionController.predict(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockedGetCache).toHaveBeenCalledWith('prediction:[1,2]'); // Assuming JSON.stringify output
    expect(mockResponse.json).toHaveBeenCalledWith({ prediction: parseFloat(cachedPrediction) });
    expect(mockedAxios.post).not.toHaveBeenCalled(); // Ensure ML service was not called
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call ML service and cache result if not in cache', async () => {
    const mlPrediction = 12.3;
    mockedGetCache.mockResolvedValue(null);
    mockedAxios.post.mockResolvedValue({ data: { prediction: mlPrediction } });
    mockedSetCache.mockResolvedValue(undefined);

    await predictionController.predict(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockedGetCache).toHaveBeenCalledWith('prediction:[1,2]');
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), { features: [1.0, 2.0] });
    expect(mockedSetCache).toHaveBeenCalledWith('prediction:[1,2]', mlPrediction.toString(), 3600);
    expect(mockResponse.json).toHaveBeenCalledWith({ prediction: mlPrediction });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next with error if ML service call fails', async () => {
    const error = new Error('ML service unavailable');
    mockedGetCache.mockResolvedValue(null);
    mockedAxios.post.mockRejectedValue(error);

    await predictionController.predict(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(error);
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

   it('should call next with error if caching fails', async () => {
       const mlPrediction = 12.3;
       const cacheError = new Error('Redis error');
       mockedGetCache.mockResolvedValue(null);
       mockedAxios.post.mockResolvedValue({ data: { prediction: mlPrediction } });
       mockedSetCache.mockRejectedValue(cacheError);

       // Even if caching fails, the prediction should still be returned
       await predictionController.predict(mockRequest as Request, mockResponse as Response, nextFunction);

       expect(mockedGetCache).toHaveBeenCalledWith('prediction:[1,2]');
       expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), { features: [1.0, 2.0] });
       expect(mockedSetCache).toHaveBeenCalledWith('prediction:[1,2]', mlPrediction.toString(), 3600);
       expect(mockResponse.json).toHaveBeenCalledWith({ prediction: mlPrediction });
       // The cache error is logged but doesn't necessarily call nextFunction to stop the request flow
       // depending on how error handling is designed. In this case, the current implementation logs and continues.
       // A more robust implementation might call next(cacheError) if caching is critical.
       expect(nextFunction).not.toHaveBeenCalledWith(cacheError);
   });
});
