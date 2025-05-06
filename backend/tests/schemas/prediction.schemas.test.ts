import { describe, it, expect } from 'vitest';
import { PredictionInputSchema } from '../src/schemas/prediction.schemas';

describe('PredictionInputSchema', () => {
  it('should validate a correct input', () => {
    const validInput = { features: [1.0, 2.5] };
    const result = PredictionInputSchema.safeParse({ body: validInput });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toEqual(validInput);
    }
  });

  it('should invalidate input with non-numeric features', () => {
    const invalidInput = { features: [1.0, 'abc'] };
    const result = PredictionInputSchema.safeParse({ body: invalidInput });
    expect(result.success).toBe(false);
  });

  it('should invalidate input with empty features array', () => {
    const invalidInput = { features: [] };
    const result = PredictionInputSchema.safeParse({ body: invalidInput });
    expect(result.success).toBe(false);
  });

  it('should validate input with extra properties', () => {
    const validInput = { features: [1.0, 2.5], extra: 'ignore' };
     const result = PredictionInputSchema.safeParse({ body: validInput });
    // Zod by default ignores unknown keys in objects unless .strict() or .strip() is used
    // For `body` which is an object, unknown keys are ignored.
    expect(result.success).toBe(true);
     if (result.success) {
       expect(result.data.body.features).toEqual([1.0, 2.5]);
     }
  });
});
