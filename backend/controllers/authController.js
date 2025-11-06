import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const login = async (req, res) => {
  try {
    const { email, password, type } = req.body; // type: day_scholar | hosteller | hostel
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // Normalize provided type for compatibility
    const normalizeType = (t) => {
      if (!t) return t;
      if (t === 'hosteller') return 'hostel';
      return t;
    };
    const providedType = normalizeType(type);

    // Admin users don't have a type, so skip type check for admins
    if (user.role === 'admin') {
      // Admin can login with any type or no type specified
    } else if (providedType && user.type !== providedType) {
      return res.status(400).json({ message: 'Role/type mismatch' });
    }

    const token = jwt.sign({ user_id: user.user_id, role: user.role, type: user.type, name: user.name }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
    return res.json({ token, user: { user_id: user.user_id, name: user.name, role: user.role, type: user.type } });
  } catch (e) {
    console.error('Login error:', e);
    console.error('Error details:', {
      code: e.code,
      errno: e.errno,
      sqlMessage: e.sqlMessage,
      message: e.message
    });
    return res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? e.message : undefined 
    });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, type } = req.body; // type: day_scholar | hostel | hosteller
    if (!name || !email || !password || !type) return res.status(400).json({ message: 'Missing fields' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });

    const normalizeType = (t) => (t === 'hosteller' ? 'hostel' : t);
    const userType = normalizeType(type);
    if (!['day_scholar', 'hostel'].includes(userType)) return res.status(400).json({ message: 'Invalid type' });

    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, type) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, 'student', userType]
    );

    const user = { user_id: result.insertId, name, role: 'student', type: userType };
    const token = jwt.sign({ user_id: user.user_id, role: user.role, type: user.type, name: user.name }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
    return res.status(201).json({ token, user });
  } catch (e) {
    console.error('Signup error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      type: user.type,
      contact_no: user.contact_no || '',
      address: user.address || '',
      emergency_name: user.emergency_name || '',
      emergency_phone: user.emergency_phone || '',
      hostel_block: user.hostel_block || '',
      room_no: user.room_no || ''
    });
  } catch (e) {
    console.error('Me error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Whitelist updatable fields
    const allowed = {
      name: 'name',
      contact_no: 'contact_no',
      address: 'address',
      emergency_name: 'emergency_name',
      emergency_phone: 'emergency_phone',
      hostel_block: 'hostel_block',
      room_no: 'room_no'
    };

    const entries = Object.entries(req.body || {}).filter(([k, v]) => allowed[k] !== undefined);
    if (!entries.length) return res.status(400).json({ message: 'No valid fields to update' });

    const setClause = entries.map(([k]) => `${allowed[k]} = ?`).join(', ');
    const values = entries.map(([, v]) => v);
    values.push(userId);

    await pool.query(`UPDATE users SET ${setClause} WHERE user_id = ?`, values);

    const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    const user = rows[0];
    return res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      type: user.type,
      contact_no: user.contact_no || '',
      address: user.address || '',
      emergency_name: user.emergency_name || '',
      emergency_phone: user.emergency_phone || '',
      hostel_block: user.hostel_block || '',
      room_no: user.room_no || ''
    });
  } catch (e) {
    console.error('Update me error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};
