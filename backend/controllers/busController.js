import { pool } from '../config/db.js';

export const getBusStatus = async (req, res) => {
  try {
    const { bus_id } = req.params;
    const [[bus]] = await pool.query('SELECT bus_id, bus_no, route_name, driver_name, status FROM buses WHERE bus_id = ?', [bus_id]);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    const [[loc]] = await pool.query('SELECT current_stop, next_stop, eta, status, updated_at FROM locations WHERE bus_id = ?', [bus_id]);
    return res.json({
      bus_no: bus.bus_no,
      route: bus.route_name,
      driver_name: bus.driver_name,
      bus_status: bus.status,
      current_stop: loc?.current_stop || 'N/A',
      next_stop: loc?.next_stop || 'N/A',
      eta: loc?.eta || 'N/A',
      status: loc?.status || 'N/A',
      last_updated: loc?.updated_at || null
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { bus_id } = req.params;
    const [[bus]] = await pool.query('SELECT bus_id, capacity, status, start_time FROM buses WHERE bus_id = ?', [bus_id]);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    const [[count]] = await pool.query('SELECT COUNT(*) as count FROM allocations WHERE bus_id = ?', [bus_id]);
    const seats_left = Math.max(0, bus.capacity - (count?.count || 0));
    return res.json({ status: bus.status, available_time: bus.start_time, seats_left });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const listBuses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.bus_id, b.bus_no, b.driver_name, b.route_name, b.capacity, b.start_time, b.end_time, b.status,
        COALESCE(a.cnt,0) + COALESCE(ap.cnt,0) AS occupied
      FROM buses b
      LEFT JOIN (
        SELECT bus_id, COUNT(*) cnt FROM allocations GROUP BY bus_id
      ) a ON a.bus_id = b.bus_id
      LEFT JOIN (
        SELECT bus_id, COUNT(*) cnt FROM bookings WHERE status = 'approved' GROUP BY bus_id
      ) ap ON ap.bus_id = b.bus_id
      WHERE b.status != 'inactive'
      ORDER BY b.bus_no ASC
    `);
    const mapped = rows.map(r => {
      const capacity = Number(r.capacity ?? 0);
      const cap = Number.isFinite(capacity) && capacity > 0 ? capacity : 9999;
      const occupied = Number(r.occupied ?? 0);
      const seats_left = Math.max(0, cap - occupied);
      const availability = seats_left <= 0 ? 'full' : 'available';
      return { ...r, occupied, seats_left, availability };
    });
    return res.json(mapped);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const myAllocation = async (req, res) => {
  try {
    const student_id = req.user?.user_id;
    const user_type = req.user?.type; // day_scholar | hosteller

    // Check existing allocation
    const [[alloc]] = await pool.query('SELECT * FROM allocations WHERE student_id = ?', [student_id]);

    let allocation = alloc;
    if (!allocation && user_type === 'day_scholar') {
      // Auto-assign the first available bus for day scholars (simplified rule)
      const [[bus]] = await pool.query('SELECT bus_id FROM buses ORDER BY bus_id ASC LIMIT 1');
      if (bus) {
        await pool.query('INSERT INTO allocations (student_id, bus_id) VALUES (?, ?)', [student_id, bus.bus_id]);
        allocation = { student_id, bus_id: bus.bus_id };
      }
    }

    // If still no allocation, check booking status for hosteller
    if (!allocation) {
      const [[booking]] = await pool.query('SELECT booking_id, status FROM bookings WHERE student_id = ? ORDER BY created_at DESC LIMIT 1', [student_id]);
      if (booking) {
        if (booking.status === 'pending') return res.json({ status: 'pending', allocation: null });
        if (booking.status === 'rejected') return res.json({ status: 'rejected', allocation: null });
      }
      return res.json({ status: 'none', allocation: null });
    }

    // Return bus details + text status
    if (!allocation?.bus_id) {
      return res.json({ status: 'none', allocation: null });
    }
    const [[bus]] = await pool.query('SELECT bus_id, bus_no, route_name, driver_name, status, start_time FROM buses WHERE bus_id = ?', [allocation.bus_id]);
    if (!bus) {
      return res.json({ status: 'none', allocation: null });
    }
    const [[loc]] = await pool.query('SELECT current_stop, next_stop, eta, status, updated_at FROM locations WHERE bus_id = ? ORDER BY updated_at DESC LIMIT 1', [allocation.bus_id]);
    return res.json({
      status: 'allocated',
      allocation: {
        bus_id: bus.bus_id,
        bus_no: bus.bus_no,
        route: bus.route_name,
        driver_name: bus.driver_name,
        bus_status: bus.status,
        available_time: bus.start_time,
        current_stop: loc?.current_stop || 'N/A',
        next_stop: loc?.next_stop || 'N/A',
        eta: loc?.eta || 'N/A',
        location_status: loc?.status || 'N/A',
        last_updated: loc?.updated_at || null
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};
