import { readFile } from 'node:fs/promises';
import sql from 'mssql';

try { process.loadEnvFile(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const pool = await new sql.ConnectionPool({
  server: process.env.DB_SERVER, port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE,
  options: { encrypt: process.env.DB_ENCRYPT === 'true', trustServerCertificate: process.env.DB_TRUST_CERT === 'true' },
}).connect();
try {
  await pool.request().batch(await readFile(new URL('./push-schema.sql', import.meta.url), 'utf8'));
  console.log('Web Push tables are ready. Existing application tables were not modified.');
} finally { await pool.close(); }
