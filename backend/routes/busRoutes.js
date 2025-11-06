import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getBusStatus, checkAvailability, myAllocation, listBuses } from '../controllers/busController.js';

const router = Router();

router.get('/status/:bus_id', auth, getBusStatus);
router.get('/availability/:bus_id', auth, checkAvailability);
router.get('/my', auth, myAllocation);
router.get('/list', auth, listBuses);

export default router;
