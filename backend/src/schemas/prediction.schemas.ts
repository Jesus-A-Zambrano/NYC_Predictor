import { z } from 'zod';

export const PredictionInputSchema = z.object({
  body: z.object({
 borough: z.number().int().min(1).max(5), // Assuming BOROUGH is 1-5
 buildingClassAtTimeOfSale: z.string(),
 grossSquareFeet: z.number().positive(),
 yearBuilt: z.number().int().min(1000).max(new Date().getFullYear()), // Basic year validation
 }),
});

export type PredictionInput = z.infer<typeof PredictionInputSchema>;
