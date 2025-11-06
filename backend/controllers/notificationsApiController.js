import { pool } from '../config/db.js';

async function ensureTable() {
	await pool.query(`CREATE TABLE IF NOT EXISTS notifications_app (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id INT NULL,
		role ENUM('admin','hosteller') NOT NULL,
		message TEXT NOT NULL,
		type ENUM('info','success','warning','error') NOT NULL DEFAULT 'info',
		status ENUM('unread','read') NOT NULL DEFAULT 'unread',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`);
}

export const createNotification = async (req, res) => {
	try {
		await ensureTable();
		const { user_id = null, role, message, type = 'info', status = 'unread' } = req.body || {};
		if (!role || !message) return res.status(400).json({ message: 'role and message are required' });
		await pool.query(
			`INSERT INTO notifications_app (user_id, role, message, type, status) VALUES (?, ?, ?, ?, ?)`,
			[user_id, role, message, type, status]
		);
		return res.status(201).json({ ok: true });
	} catch (e) {
		console.error('createNotification error:', e);
		return res.status(500).json({ message: 'Server error' });
	}
};

export const listForCurrentUser = async (req, res) => {
	try {
		await ensureTable();
		const { user_id, role } = req.user || {};
		const [rows] = await pool.query(
			`SELECT * FROM notifications_app WHERE (user_id = ? AND role != 'admin') OR (role = 'admin' AND ? = 'admin') ORDER BY created_at DESC`,
			[user_id || 0, role || 'student']
		);
		return res.json(rows);
	} catch (e) {
		console.error('listForCurrentUser error:', e);
		return res.status(500).json({ message: 'Server error' });
	}
};

export const listForUserId = async (req, res) => {
	try {
		await ensureTable();
		const { user_id } = req.params;
		const [rows] = await pool.query(`SELECT * FROM notifications_app WHERE user_id = ? ORDER BY created_at DESC`, [user_id]);
		return res.json(rows);
	} catch (e) {
		console.error('listForUserId error:', e);
		return res.status(500).json({ message: 'Server error' });
	}
};

export const markOneRead = async (req, res) => {
	try {
		await ensureTable();
		const { id } = req.params;
		await pool.query(`UPDATE notifications_app SET status = 'read' WHERE id = ?`, [id]);
		return res.json({ ok: true });
	} catch (e) {
		console.error('markOneRead error:', e);
		return res.status(500).json({ message: 'Server error' });
	}
};

export const markAllReadForUser = async (req, res) => {
	try {
		await ensureTable();
		const { user_id } = req.params;
		await pool.query(`UPDATE notifications_app SET status = 'read' WHERE user_id = ?`, [user_id]);
		return res.json({ ok: true });
	} catch (e) {
		console.error('markAllReadForUser error:', e);
		return res.status(500).json({ message: 'Server error' });
	}
};

export async function addAdminNotification(message) {
	await ensureTable();
	await pool.query(`INSERT INTO notifications_app (user_id, role, message, type, status) VALUES (NULL, 'admin', ?, 'info', 'unread')`, [message]);
}

export async function addUserNotification(userId, message, type = 'info') {
	await ensureTable();
	await pool.query(`INSERT INTO notifications_app (user_id, role, message, type, status) VALUES (?, 'hosteller', ?, ?, 'unread')`, [userId, message, type]);
}
