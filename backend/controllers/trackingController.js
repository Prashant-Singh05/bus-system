import { pool } from '../config/db.js';

export const getLiveTracking = async (req, res) => {
  try {
    const { bus_id } = req.params;
    const [[loc]] = await pool.query(
      'SELECT bus_id, current_stop, next_stop, latitude, longitude, eta, status FROM locations WHERE bus_id = ? LIMIT 1',
      [bus_id]
    );

    if (!loc) return res.status(404).json({ message: 'Bus location not found' });

    return res.json({
      bus_id: Number(loc.bus_id),
      current_stop: loc.current_stop,
      next_stop: loc.next_stop,
      latitude: loc.latitude !== null ? Number(loc.latitude) : null,
      longitude: loc.longitude !== null ? Number(loc.longitude) : null,
      eta: loc.eta,
      status: loc.status
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};
