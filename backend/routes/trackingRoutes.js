import { Router } from 'express';
import { getLiveTracking } from '../controllers/trackingController.js';

const router = Router();

// GET /api/tracking/live/:bus_id
router.get('/live/:bus_id', getLiveTracking);

export default router;
