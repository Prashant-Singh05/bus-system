import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { 
  approveBooking, 
  listBookings, 
  liveData, 
  listUsers, 
  listBuses, 
  listAllBookings, 
  listAllocations,
  rejectBooking 
} from '../controllers/adminController.js';

const adminRoutes = (io) => {
  const router = Router();
  router.get('/bookings', auth, requireRole('admin'), listBookings);
  router.get('/bookings/all', auth, requireRole('admin'), listAllBookings);
  router.post('/approve/:id', auth, requireRole('admin'), approveBooking);
  // Compatibility route per spec
  router.put('/bus-requests/approve/:id', auth, requireRole('admin'), approveBooking);
  router.post('/bus-requests/approve/:id', auth, requireRole('admin'), approveBooking);
  router.post('/reject/:id', auth, requireRole('admin'), rejectBooking);
  router.get('/live', auth, requireRole('admin'), (req, res) => liveData(req, res, io));
  router.get('/users', auth, requireRole('admin'), listUsers);
  router.get('/buses', auth, requireRole('admin'), listBuses);
  router.get('/allocations', auth, requireRole('admin'), listAllocations);
  return router;
};

export default adminRoutes;
