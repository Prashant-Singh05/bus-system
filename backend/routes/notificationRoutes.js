import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listForUser, markAllRead, markOneRead } from '../controllers/notificationController.js';

const router = Router();

router.get('/', auth, listForUser);
router.post('/read', auth, markAllRead);
router.post('/:id/read', auth, markOneRead);

export default router;
