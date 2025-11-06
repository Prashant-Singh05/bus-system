import { Router } from 'express';
import { login, signup, me, updateMe } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/me', auth, me);
router.put('/me', auth, updateMe);

export default router;
