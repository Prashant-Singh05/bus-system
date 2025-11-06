import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env from backend/.env only
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendRoot = join(__dirname, '..');
const envPath = join(backendRoot, '.env');
dotenv.config({ path: envPath });

const cfg = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'college_bus_system',
};

const email = 'aditi@jklu.edu.in';

function printSection(title) {
  console.log(`\n===== ${title} =====`);
}

function printRows(rows) {
  if (!rows || rows.length === 0) {
    console.log('(empty)');
    return;
  }
  for (const row of rows) {
    console.log(row);
  }
}

(async () => {
  let conn;
  try {
    console.log(`Using .env: ${envPath}`);
    conn = await mysql.createConnection(cfg);

    printSection('users for email');
    const [uRows] = await conn.execute(
      'SELECT user_id,name,type FROM users WHERE email=?',
      [email]
    );
    printRows(uRows);

    printSection('allocations for student');
    const [aRows] = await conn.execute(
      'SELECT * FROM allocations WHERE student_id=(SELECT user_id FROM users WHERE email=?)',
      [email]
    );
    printRows(aRows);

    printSection('buses for allocation');
    const [bRows] = await conn.execute(
      'SELECT * FROM buses WHERE bus_id IN (SELECT bus_id FROM allocations WHERE student_id=(SELECT user_id FROM users WHERE email=?))',
      [email]
    );
    printRows(bRows);

    printSection('locations for allocation buses');
    const [lRows] = await conn.execute(
      'SELECT * FROM locations WHERE bus_id IN (SELECT bus_id FROM allocations WHERE student_id=(SELECT user_id FROM users WHERE email=?))',
      [email]
    );
    printRows(lRows);
  } catch (err) {
    console.error('DB check error:', err.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
})();
