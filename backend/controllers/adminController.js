import { pool } from '../config/db.js';
import { addUserNotification } from './notificationsApiController.js';

export const listBookings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT b.booking_id, u.name, u.user_id as student_id, b.bus_id, b.status FROM bookings b JOIN users u ON b.student_id = u.user_id WHERE b.status = "pending"');
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const [[bk]] = await pool.query('SELECT * FROM bookings WHERE booking_id = ?', [id]);
    if (!bk) return res.status(404).json({ message: 'Booking not found' });

    // Find an available bus: prefer requested bus if provided and available
    const pickAvailableBus = async (preferredBusId) => {
      // Treat any bus that's not 'inactive' as available for assignment
      const capacityWhere = 'b.status != "inactive"';
      const availabilitySql = `
        SELECT b.bus_id, b.capacity,
               COALESCE(a.cnt,0) + COALESCE(ap.cnt,0) AS occupied
        FROM buses b
        LEFT JOIN (
          SELECT bus_id, COUNT(*) cnt FROM allocations GROUP BY bus_id
        ) a ON a.bus_id = b.bus_id
        LEFT JOIN (
          SELECT bus_id, COUNT(*) cnt FROM bookings WHERE status = 'approved' GROUP BY bus_id
        ) ap ON ap.bus_id = b.bus_id
        WHERE ${capacityWhere}
        ORDER BY (COALESCE(a.cnt,0) + COALESCE(ap.cnt,0)) ASC, b.bus_id ASC`;

      const [rows] = await pool.query(availabilitySql);
      const isAvailable = (busId) => {
        const r = rows.find(r => r.bus_id === busId);
        if (!r) return false;
        const cap = Number(r.capacity ?? 0);
        const capacity = Number.isFinite(cap) && cap > 0 ? cap : 9999; // fallback if capacity missing
        return Number(r.occupied) < capacity;
      };

      if (preferredBusId && isAvailable(preferredBusId)) return preferredBusId;
      const first = rows.find(r => {
        const cap = Number(r.capacity ?? 0);
        const capacity = Number.isFinite(cap) && cap > 0 ? cap : 9999;
        return Number(r.occupied) < capacity;
      });
      return first ? first.bus_id : null;
    };

    const assignedBusId = await pickAvailableBus(bk.bus_id);
    if (!assignedBusId) return res.status(400).json({ message: 'No available bus' });

    await pool.query('UPDATE bookings SET status = "approved", bus_id = ? WHERE booking_id = ?', [assignedBusId, id]);

    const [[alloc]] = await pool.query('SELECT * FROM allocations WHERE student_id = ?', [bk.student_id]);
    if (!alloc) {
      await pool.query('INSERT INTO allocations (student_id, bus_id) VALUES (?, ?)', [bk.student_id, assignedBusId]);
    } else {
      await pool.query('UPDATE allocations SET bus_id = ? WHERE student_id = ?', [assignedBusId, bk.student_id]);
    }

    // Optional: record assignment in bus_assignments if table exists
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS bus_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        bus_id INT NOT NULL,
        booking_id INT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      await pool.query('INSERT INTO bus_assignments (student_id, bus_id, booking_id) VALUES (?, ?, ?)', [bk.student_id, assignedBusId, bk.booking_id]);
    } catch {}

    // Notification for the student (new notifications_app table)
    try { await addUserNotification(bk.student_id, `Your request is approved. Assigned bus ${assignedBusId}.`, 'success') } catch {}

    return res.json({ message: 'Approved and allocated', bus_id: assignedBusId });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const liveData = async (req, res, io) => {
  try {
    const [rows] = await pool.query('SELECT l.bus_id, b.bus_no, b.driver_name, b.route_name, l.latitude, l.longitude, l.current_stop, l.next_stop, l.eta, l.status, l.updated_at FROM locations l JOIN buses b ON l.bus_id = b.bus_id');
    io.emit('admin_live', rows);
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const listUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, name, email, role, type FROM users ORDER BY role DESC, name ASC');
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const listBuses = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM buses ORDER BY bus_no ASC');
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const listAllBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.booking_id, u.name as student_name, u.email, b.bus_id, bus.bus_no, b.status, b.created_at 
      FROM bookings b 
      JOIN users u ON b.student_id = u.user_id 
      JOIN buses bus ON b.bus_id = bus.bus_id 
      ORDER BY b.created_at DESC
    `);
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const listAllocations = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.allocation_id, u.name as student_name, u.email, u.type, bus.bus_no, bus.route, a.created_at 
      FROM allocations a 
      JOIN users u ON a.student_id = u.user_id 
      JOIN buses bus ON a.bus_id = bus.bus_id 
      ORDER BY a.created_at DESC
    `);
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const [[bk]] = await pool.query('SELECT * FROM bookings WHERE booking_id = ?', [id]);
    await pool.query('UPDATE bookings SET status = "rejected" WHERE booking_id = ?', [id]);
    try { if (bk) await addUserNotification(bk.student_id, 'Your bus request has been rejected', 'error') } catch {}
    return res.json({ message: 'Booking rejected' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};
