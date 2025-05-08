import { Router } from 'express';
import { predictionController } from '../controllers/prediction.controller';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { PredictionInputSchema } from '../schemas/prediction.schemas';
import { z } from 'zod';

const router = Router();

/**
 * @swagger
 * /predict:
 *   post:
 *     summary: Get a prediction from the ML model
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               borough:
 *                 type: number
 *                 format: integer
 *                 description: The borough number (1-5)
 *                 example: 3
 *               buildingClassAtTimeOfSale:
 *                 type: string
 *                 description: The building class at the time of sale
 *                 example: "A1"
 *               grossSquareFeet:
 *                 type: number
 *                 description: The gross square footage of the property
 *                 example: 1500
 *               yearBuilt:
 *                 type: number
 *                 format: integer
 *                 description: The year the property was built
 *                 example: 1950
 *     responses:
 *       200:
 *         description: Prediction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prediction:
 *                   type: string
 *                   description: The predicted value, rounded to 2 decimal places (string)
 *                   example: "123456.78"
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/', validateRequest(z.object({ body: PredictionInputSchema })), predictionController.predict);

export default router;
