import dotenv from "dotenv";
dotenv.config();

// Disable SSL certificate verification for Supabase
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure SSL based on database provider
const isSupabase = process.env.DATABASE_URL?.includes('supabase.com') || false;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabase ? {
    rejectUnauthorized: false
  } : false
});
export const db = drizzle({ client: pool, schema });
