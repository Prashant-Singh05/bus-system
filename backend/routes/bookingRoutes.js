import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { createRequest } from '../controllers/bookingController.js';

const router = Router();

router.post('/request', auth, createRequest);

export default router;
