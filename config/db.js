require('dotenv').config({ path: require('path').resolve(__dirname, './secret.env') });

const mysql = require('mysql2/promise');

// აუცილებელი ცვლადების შემოწმება
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_BASE'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`აკლია აუცილებელი ცვლადი: ${envVar}`);
  }
}

// კავშირის პულის შექმნა დამატებითი პარამეტრებით
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_BASE,
  port: 3306, // მიუთითეთ პორტი ცალსახად
  waitForConnections: true,
  connectionLimit: 10, // FreeSQLDatabase might have connection limits
  connectTimeout: 20000, // 20 seconds timeout
  timezone: '+00:00',
  charset: 'utf8mb4',
  // Remove the SSL options entirely since the server doesn't support it
});

// კავშირის ტესტირება გაშვებისას
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('ბაზასთან კავშირი დამყარდა წარმატებით');
    connection.release();
  } catch (error) {
    console.error('ბაზასთან კავშირის შეცდომა:', error);
    process.exit(1);
  }
})();

// შეცდომების დამუშავება
db.on('error', (err) => {
  console.error('ბაზის პულის შეცდომა:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    // კავშირის დაკარგვის დამუშავება
  }
});

module.exports = db;