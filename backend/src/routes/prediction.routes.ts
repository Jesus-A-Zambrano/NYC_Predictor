import { Router } from 'express';
import { predictionController } from '../controllers/prediction.controller';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { PredictionInputSchema } from '../schemas/prediction.schemas';

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
 *               features:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Array of features for prediction
 *                 example: [1.5, 2.3]
 *     responses:
 *       200:
 *         description: Prediction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prediction:
 *                   type: number
 *                   description: The predicted value
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/', validateRequest(PredictionInputSchema), predictionController.predict);

export default router;
