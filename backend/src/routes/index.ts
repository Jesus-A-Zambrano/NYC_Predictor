import { Router } from 'express';
import predictionRoutes from './prediction.routes';

const router = Router();

router.use('/predict', predictionRoutes);

export default router;
