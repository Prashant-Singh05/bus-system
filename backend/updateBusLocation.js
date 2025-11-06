import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Approx Jaipur coordinates for simulation
const stops = {
  'Mansarovar': [26.8543, 75.7704],
  'Vaishali': [26.9127, 75.7431],
  'Vaishali Nagar': [26.9127, 75.7431],
  'Sodala': [26.8948, 75.7873],
  'Gopalpura': [26.8715, 75.7930],
  'Durgapura': [26.8545, 75.8002],
  'Malviya': [26.8545, 75.8100],
  'Malviya Nagar': [26.8545, 75.8100],
  'Tonk Road': [26.8400, 75.7900],
  'JKLU': [26.7583, 75.7775],
  'Jagatpura': [26.836400, 75.843000],
  'Ajmer Road': [26.906500, 75.769800]
};

// Route sequences to advance next_stop
const ROUTE_SEQUENCES = {
  'Mansarovar → JKLU': ['Mansarovar', 'Gopalpura', 'Tonk Road', 'JKLU'],
  'Vaishali Nagar → JKLU': ['Vaishali Nagar', 'Sodala', 'Gopalpura', 'JKLU'],
  'Malviya Nagar → JKLU': ['Malviya Nagar', 'Durgapura', 'Tonk Road', 'JKLU'],
  'Jagatpura → JKLU': ['Jagatpura', 'Malviya Nagar', 'JKLU'],
  'Ajmer Road → JKLU': ['Ajmer Road', 'Sodala', 'Tonk Road', 'JKLU']
};

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

async function updateBusLocations() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'college_bus_system'
    });

    // Join route_name to compute next stops
    const [rows] = await connection.execute(
      `SELECT l.bus_id, l.current_stop, l.next_stop, b.route_name
       FROM locations l
       JOIN buses b ON b.bus_id = l.bus_id`
    );
    
    for (const row of rows) {
      const { bus_id, current_stop, next_stop, route_name } = row;

      if (!current_stop || !next_stop) continue;

      const stop1 = stops[current_stop];
      const stop2 = stops[next_stop];

      if (!stop1 || !stop2) {
        console.log(`⚠️  Stop coordinates not found for ${current_stop} or ${next_stop}`);
        continue;
      }

      const [lat1, lon1] = stop1;
      const [lat2, lon2] = stop2;

      // Calculate ETA using distance/speed
      const distance = haversine(lat1, lon1, lat2, lon2);
      const speed = 30; // km/h
      const eta = Math.max(2, Math.round((distance / speed) * 60)); // minutes

      let newCurrent = current_stop;
      let newNext = next_stop;
      let newStatus = 'On Route';

      // Advance to next stop if ETA is at threshold
      if (eta <= 2) {
        newCurrent = next_stop;
        const seq = ROUTE_SEQUENCES[route_name] || [];
        const idx = seq.indexOf(newCurrent);
        if (idx !== -1 && idx + 1 < seq.length) {
          newNext = seq[idx + 1];
        } else {
          // Arrived at final stop
          newNext = null;
          newStatus = 'Arrived';
        }
      }

      // Pick coordinates to reflect movement towards next
      const [latCur, lonCur] = stops[newCurrent] || [lat1, lon1];

      await connection.execute(
        "UPDATE locations SET current_stop = ?, next_stop = ?, eta = ?, latitude = ?, longitude = ?, status = ?, updated_at = NOW() WHERE bus_id = ?",
        [newCurrent, newNext, newNext ? `${eta} min` : null, latCur, lonCur, newStatus, bus_id]
      );

      console.log(`✅ Bus ${bus_id} updated: ${newCurrent}${newNext ? ' → ' + newNext : ''} (ETA ${newNext ? eta + ' min' : '—'}, ${newStatus})`);
    }

    console.log(`\n✅ All bus ETAs updated successfully at ${new Date().toLocaleTimeString()}!\n`);
  } catch (err) {
    console.error("❌ Error updating locations:", err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run immediately on start
console.log('🚌 Starting bus location updater...');
updateBusLocations();

// Run every 30 seconds
setInterval(updateBusLocations, 30000);

// Keep the process alive
console.log('⏰ Bus location updater will run every 30 seconds...\n');


