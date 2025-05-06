import { z } from 'zod';

export const PredictionInputSchema = z.object({
  body: z.object({
    BOROUGH: z.number().int().min(1).max(5), // Assuming BOROUGH is 1-5
    BUILDING_CLASS_AT_TIME_OF_SALE: z.string(),
    GROSS_SQUARE_FEET: z.number().positive(),
    YEAR_BUILT: z.number().int().min(1000).max(new Date().getFullYear()), // Basic year validation
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type PredictionInput = z.infer<typeof PredictionInputSchema>['body'];
