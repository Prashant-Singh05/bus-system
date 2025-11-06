import { pool } from '../config/db.js';

async function ensureSchema() {
  await pool.query(`CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) UNIQUE,
    name VARCHAR(255) NOT NULL,
    start_point VARCHAR(255) NOT NULL,
    end_point VARCHAR(255) NOT NULL,
    dep_time VARCHAR(20) NULL,
    arr_time VARCHAR(20) NULL
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    ord INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    eta VARCHAR(20) NULL,
    lat DECIMAL(9,6) NULL,
    lng DECIMAL(9,6) NULL,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS driver_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_no VARCHAR(50) UNIQUE,
    driver_name VARCHAR(255),
    contact VARCHAR(50)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS bus_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    current_stop VARCHAR(255) NULL,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}

const routeSeed = [
  { code:'R1', name:'Mansarovar Route', start:'Mansarovar Metro Station', end:'JKLU', dep:'07:45 AM', arr:'09:00 AM', bus_no:'RJ14AB1234', driver:'Ramesh Singh', contact:'+91 98765 43210', stops:[
    { ord:1, name:'Mansarovar Metro Station', eta:'07:45 AM', lat:26.8537, lng:75.7695 },
    { ord:2, name:'Kiran Path Circle', eta:'07:55 AM', lat:26.8461, lng:75.7703 },
    { ord:3, name:'Gopalpura Bypass', eta:'08:10 AM', lat:26.8780, lng:75.7834 },
    { ord:4, name:'Mahapura', eta:'08:40 AM', lat:26.8091, lng:75.7369 },
    { ord:5, name:'JKLU', eta:'09:00 AM', lat:26.7882, lng:75.8018 },
  ]},
  { code:'R2', name:'Vaishali Nagar Route', start:'Queens Road, Vaishali Nagar', end:'JKLU', dep:'07:50 AM', arr:'09:00 AM', bus_no:'RJ14CD5678', driver:'Sunil Kumar', contact:'+91 98765 43211', stops:[
    { ord:1, name:'Queens Road', eta:'07:50 AM', lat:26.9000, lng:75.7500 },
    { ord:2, name:'Amrapali Circle', eta:'08:00 AM', lat:26.9115, lng:75.7450 },
    { ord:3, name:'Ajmer Road (Sodala)', eta:'08:20 AM', lat:26.9005, lng:75.7802 },
    { ord:4, name:'Mahindra SEZ Gate', eta:'08:45 AM', lat:26.7880, lng:75.8000 },
    { ord:5, name:'JKLU', eta:'09:00 AM', lat:26.7882, lng:75.8018 },
  ]},
  { code:'R3', name:'Malviya Nagar Route', start:'GT Square, Malviya Nagar', end:'JKLU', dep:'08:00 AM', arr:'09:00 AM', bus_no:'RJ14EF9101', driver:'Sohan Lal', contact:'+91 98765 43212', stops:[
    { ord:1, name:'GT Square', eta:'08:00 AM', lat:26.8488, lng:75.8167 },
    { ord:2, name:'Gaurav Tower', eta:'08:10 AM', lat:26.8509, lng:75.8087 },
    { ord:3, name:'Jawahar Circle', eta:'08:25 AM', lat:26.8495, lng:75.8034 },
    { ord:4, name:'Tonk Road', eta:'08:45 AM', lat:26.8682, lng:75.7934 },
    { ord:5, name:'JKLU', eta:'09:00 AM', lat:26.7882, lng:75.8018 },
  ]},
  { code:'R4', name:'Jagatpura Route', start:'Jagatpura Railway Station', end:'JKLU', dep:'08:05 AM', arr:'09:00 AM', bus_no:'RJ14GH4567', driver:'Arvind Yadav', contact:'+91 98765 43213', stops:[
    { ord:1, name:'Jagatpura Railway Station', eta:'08:05 AM', lat:26.8372, lng:75.8590 },
    { ord:2, name:'Akshaya Patra Temple', eta:'08:15 AM', lat:26.8349, lng:75.8488 },
    { ord:3, name:'Mahal Road', eta:'08:35 AM', lat:26.8281, lng:75.8345 },
    { ord:4, name:'Mahapura', eta:'08:50 AM', lat:26.8091, lng:75.7369 },
    { ord:5, name:'JKLU', eta:'09:00 AM', lat:26.7882, lng:75.8018 },
  ]},
  { code:'R5', name:'Bani Park Route', start:'Bani Park Circle', end:'JKLU', dep:'07:40 AM', arr:'09:00 AM', bus_no:'RJ14IJ7890', driver:'Rajveer Singh', contact:'+91 98765 43214', stops:[
    { ord:1, name:'Bani Park Circle', eta:'07:40 AM', lat:26.9291, lng:75.7924 },
    { ord:2, name:'Sindhi Camp', eta:'07:50 AM', lat:26.9260, lng:75.7949 },
    { ord:3, name:'Civil Lines', eta:'08:10 AM', lat:26.9028, lng:75.7853 },
    { ord:4, name:'Ajmer Road (DCM)', eta:'08:30 AM', lat:26.8882, lng:75.7734 },
    { ord:5, name:'JKLU', eta:'09:00 AM', lat:26.7882, lng:75.8018 },
  ]},
  { code:'R6', name:'C-Scheme Route', start:'M.I. Road (Ajmeri Gate)', end:'JKLU', dep:'07:55 AM', arr:'09:00 AM', bus_no:'RJ14KL4321', driver:'Mukesh Kumar', contact:'+91 98765 43215', stops:[
    { ord:1, name:'M.I. Road (Ajmeri Gate)', eta:'07:55 AM', lat:26.9189, lng:75.8126 },
    { ord:2, name:'Panch Batti', eta:'08:05 AM', lat:26.9128, lng:75.8065 },
    { ord:3, name:'Ajmer Road (Gopalbari)', eta:'08:25 AM', lat:26.9005, lng:75.7902 },
    { ord:4, name:'Mahapura', eta:'08:45 AM', lat:26.8091, lng:75.7369 },
    { ord:5, name:'JKLU', eta:'09:00 AM', lat:26.7882, lng:75.8018 },
  ]},
];

export const seedRoutes = async (req, res) => {
  try {
    await ensureSchema();
    let created = 0;
    for (const r of routeSeed) {
      const [rows] = await pool.query('SELECT id FROM routes WHERE code = ?', [r.code]);
      let routeId = rows[0]?.id;
      if (!routeId) {
        const [ins] = await pool.query('INSERT INTO routes (code, name, start_point, end_point, dep_time, arr_time) VALUES (?, ?, ?, ?, ?, ?)', [r.code, r.name, r.start, r.end, r.dep, r.arr]);
        routeId = ins.insertId; created++;
      }
      for (const s of r.stops) {
        const [exist] = await pool.query('SELECT id FROM stops WHERE route_id = ? AND ord = ?', [routeId, s.ord]);
        if (!exist[0]) {
          await pool.query('INSERT INTO stops (route_id, ord, name, eta, lat, lng) VALUES (?, ?, ?, ?, ?, ?)', [routeId, s.ord, s.name, s.eta, s.lat, s.lng]);
        }
      }
      // upsert driver_info
      await pool.query('INSERT INTO driver_info (bus_no, driver_name, contact) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE driver_name=VALUES(driver_name), contact=VALUES(contact)', [r.bus_no, r.driver, r.contact]);
    }
    res.json({ ok: true, routesCreated: created });
  } catch (e) {
    console.error('seedRoutes error:', e);
    res.status(500).json({ message: 'Server error' });
  }
}

export const listRoutes = async (req, res) => {
  try {
    await ensureSchema();
    const [rows] = await pool.query('SELECT id, code, name, start_point, end_point, dep_time, arr_time FROM routes ORDER BY code');
    res.json(rows);
  } catch (e) {
    console.error('listRoutes error:', e);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getRouteStops = async (req, res) => {
  try {
    await ensureSchema();
    const { id } = req.params;
    const [[route]] = await pool.query('SELECT id, code, name, dep_time, arr_time FROM routes WHERE id = ?', [id]);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    const [stops] = await pool.query('SELECT ord, name, eta, lat, lng FROM stops WHERE route_id = ? ORDER BY ord', [id]);
    res.json({ route, stops });
  } catch (e) {
    console.error('getRouteStops error:', e);
    res.status(500).json({ message: 'Server error' });
  }
}

export const busTimeline = async (req, res) => {
  try {
    await ensureSchema();
    const { id } = req.params; // bus_id
    const [[bus]] = await pool.query('SELECT bus_id, bus_no, route_name, driver_name FROM buses WHERE bus_id = ?', [id]);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    // match route by name
    const [[route]] = await pool.query('SELECT id, code, name FROM routes WHERE name = ? OR code = ?', [bus.route_name, bus.route_name]);
    if (!route) return res.json({ route: null, stops: [], current_stop: null });
    const [stops] = await pool.query('SELECT ord, name, eta, lat, lng FROM stops WHERE route_id = ? ORDER BY ord', [route.id]);

    // current stop from locations or bus_tracking latest
    const [[loc]] = await pool.query('SELECT current_stop FROM locations WHERE bus_id = ? ORDER BY updated_at DESC LIMIT 1', [id]);
    let current_stop = loc?.current_stop || null;
    if (!current_stop) {
      const [[trk]] = await pool.query('SELECT current_stop FROM bus_tracking WHERE bus_id = ? ORDER BY ts DESC LIMIT 1', [id]);
      current_stop = trk?.current_stop || null;
    }

    res.json({ route: { id: route.id, name: route.name }, stops, current_stop });
  } catch (e) {
    console.error('busTimeline error:', e);
    res.status(500).json({ message: 'Server error' });
  }
}
