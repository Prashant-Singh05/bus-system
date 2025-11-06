import { pool } from '../config/db.js';
import { addAdminNotification } from './notificationsApiController.js';

export const createRequest = async (req, res) => {
  try {
    const student_id = req.user?.user_id;
    const { bus_id, pickupLocation, preferredTime } = req.body;

    // Check for existing pending request
    const [[existing]] = await pool.query('SELECT * FROM bookings WHERE student_id = ? AND status = "pending"', [student_id]);
    if (existing) return res.status(400).json({ message: 'Existing pending request' });

    // If bus_id provided, use it; otherwise find a bus by preferred time
    let targetBusId = bus_id;
    if (!targetBusId && preferredTime) {
      const [[bus]] = await pool.query(
        'SELECT bus_id FROM buses WHERE available_time LIKE ? AND status = "active" LIMIT 1',
        [`%${preferredTime}%`]
      );
      if (bus) targetBusId = bus.bus_id;
    }

    if (!targetBusId) {
      // Default to first available bus
      const [[bus]] = await pool.query('SELECT bus_id FROM buses WHERE status = "active" LIMIT 1', []);
      if (bus) targetBusId = bus.bus_id;
    }

    if (!targetBusId) return res.status(400).json({ message: 'No bus available' });

    await pool.query('INSERT INTO bookings (student_id, bus_id, status) VALUES (?, ?, "pending")', [student_id, targetBusId]);
    try { await addAdminNotification(`New bus request from student ${student_id}`) } catch {}
    return res.json({ message: 'Request submitted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};
