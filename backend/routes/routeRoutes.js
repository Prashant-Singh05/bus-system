import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { listRoutes, getRouteStops, seedRoutes, busTimeline } from '../controllers/routeController.js';

const router = Router();

router.get('/', auth, listRoutes);
router.get('/:id/stops', auth, getRouteStops);
router.post('/seed', auth, requireRole('admin'), seedRoutes);

// expose timeline under this router too (alternative access)
router.get('/bus/:id/timeline', auth, busTimeline);

export default router;
