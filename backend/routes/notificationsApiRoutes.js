import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { createNotification, listForCurrentUser, listForUserId, markOneRead, markAllReadForUser } from '../controllers/notificationsApiController.js';

const router = Router();

router.post('/', auth, createNotification);
router.get('/', auth, listForCurrentUser);
router.get('/:user_id', auth, listForUserId);
router.put('/:id/read', auth, markOneRead);
router.put('/mark-all-read/:user_id', auth, markAllReadForUser);

export default router;
