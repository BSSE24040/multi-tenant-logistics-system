require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

const useSSL = process.env.DB_SSL !== 'false';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});
pool.connect()
  .then(() => console.log('PostgreSQL connected successfully'))
  .catch((err) => console.error('DB connection error:', err.message));

module.exports = pool;