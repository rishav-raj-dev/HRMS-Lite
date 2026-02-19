import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('[v0] DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query(text: string, params?: any[]) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Please set it in your environment variables.');
  }
  
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getConnection() {
  return pool.connect();
}

export async function closePool() {
  await pool.end();
}
