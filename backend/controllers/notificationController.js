import { pool } from '../config/db.js';

async function ensureTables() {
  await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NULL,
    message TEXT NOT NULL,
    audience ENUM('all','students','drivers','day_scholar','hosteller','admins','user') NOT NULL DEFAULT 'all',
    target_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS notification_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_read (notification_id, user_id)
  )`);
}

export const listForUser = async (req, res) => {
  try {
    await ensureTables();
    const { user_id, role, type } = req.user || {};

    // Map role/type into audiences we support
    const audiences = ['all'];
    if (role === 'admin') audiences.push('admins');
    if (role === 'student') audiences.push('students');
    if (role === 'driver') audiences.push('drivers');
    if (type === 'day_scholar') audiences.push('day_scholar');
    if (type === 'hostel' || type === 'hosteller') audiences.push('hosteller');

    const [rows] = await pool.query(
      `SELECT n.notification_id, n.title, n.message, n.audience, n.target_user_id, n.created_at,
              CASE WHEN nr.user_id IS NULL THEN 1 ELSE 0 END AS unread
       FROM notifications n
       LEFT JOIN notification_reads nr 
         ON nr.notification_id = n.notification_id AND nr.user_id = ?
       WHERE n.audience IN (?) OR (n.audience = 'user' AND n.target_user_id = ?)
       ORDER BY n.created_at DESC
      `,
      [user_id, audiences, user_id]
    );

    res.json(rows.map(r => ({
      id: r.notification_id,
      title: r.title,
      text: r.message,
      audience: r.audience,
      time: r.created_at,
      unread: !!r.unread
    })));
  } catch (e) {
    console.error('listForUser error:', e);
    res.status(500).json({ message: 'Server error' });
  }
}

export const markAllRead = async (req, res) => {
  try {
    await ensureTables();
    const { user_id, role, type } = req.user || {};
    const audiences = ['all'];
    if (role === 'admin') audiences.push('admins');
    if (role === 'student') audiences.push('students');
    if (type === 'day_scholar') audiences.push('day_scholar');
    if (type === 'hostel' || type === 'hosteller') audiences.push('hosteller');

    const [rows] = await pool.query(
      `SELECT notification_id FROM notifications 
       WHERE audience IN (?) OR (audience = 'user' AND target_user_id = ?)`,
      [audiences, user_id]
    );

    if (!rows.length) return res.json({ updated: 0 });

    const values = rows.map(r => [r.notification_id, user_id]);
    await pool.query(
      `INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES ?`,
      [values]
    );

    res.json({ updated: values.length });
  } catch (e) {
    console.error('markAllRead error:', e);
    res.status(500).json({ message: 'Server error' });
  }
}

export const markOneRead = async (req, res) => {
  try {
    await ensureTables();
    const { id } = req.params;
    const { user_id } = req.user || {};
    await pool.query(
      `INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)`,
      [id, user_id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('markOneRead error:', e);
    res.status(500).json({ message: 'Server error' });
  }
}

export const adminCreate = async (req, res) => {
  try {
    await ensureTables();
    const { title, message, audience = 'all', target_user_id = null } = req.body;
    if (!message) return res.status(400).json({ message: 'message is required' });
    if (!['all','students','drivers','day_scholar','hosteller','admins','user'].includes(audience)) {
      return res.status(400).json({ message: 'invalid audience' });
    }
    const [result] = await pool.query(
      `INSERT INTO notifications (title, message, audience, target_user_id) VALUES (?, ?, ?, ?)`,
      [title || null, message, audience, audience === 'user' ? target_user_id : null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    console.error('adminCreate error:', e);
    res.status(500).json({ message: 'Server error' });
  }
}

export const adminListAll = async (req, res) => {
  try {
    await ensureTables();
    const [rows] = await pool.query(`SELECT * FROM notifications ORDER BY created_at DESC`);
    res.json(rows);
  } catch (e) {
    console.error('adminListAll error:', e);
    res.status(500).json({ message: 'Server error' });
  }
}
