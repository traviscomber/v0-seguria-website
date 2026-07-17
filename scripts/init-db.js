#!/usr/bin/env node

/**
 * Database Initialization Script
 * Runs the SQL schema in Supabase
 * 
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/init-db.js
 * Or in Supabase SQL Editor, copy-paste lib/db/init.sql
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  const databaseUrl = process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;

  if (!databaseUrl) {
    console.error('[ERROR] Missing POSTGRES_URL or SUPABASE_DB_URL');
    console.info('[INFO] You can also manually run the SQL from lib/db/init.sql in Supabase SQL Editor');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
    application_name: 'seguria-init-db',
  });

  try {
    console.log('[INFO] Connecting to PostgreSQL...');
    await client.connect();

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../lib/db/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('[INFO] Executing SQL schema...');
    await client.query(sql);

    console.log('[SUCCESS] Database initialized successfully!');
    console.log('[INFO] Tables created:');
    console.log('  - users');
    console.log('  - properties');
    console.log('  - devices');
    console.log('  - integrations');
    console.log('  - alerts');
    console.log('  - leads');
    console.log('  - contact_submissions');
    console.log('  - activity_logs');
    console.log('[INFO] RLS policies and indexes created');
    
  } catch (error) {
    console.error('[ERROR] Unexpected error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initializeDatabase().catch(console.error);
