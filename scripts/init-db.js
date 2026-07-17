#!/usr/bin/env node

/**
 * Database Initialization Script
 * Runs the SQL schema in Supabase
 * 
 * Usage: node scripts/init-db.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function initializeDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  try {
    console.log('[INFO] Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../lib/db/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('[INFO] Executing SQL schema...');
    
    // Execute SQL using the admin client
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(() => {
      // If RPC doesn't exist, try direct execution
      console.log('[INFO] Using direct SQL execution...');
      return supabase.rpc('query', { sql }).catch(() => null);
    });

    if (error) {
      console.error('[ERROR] Database initialization failed:', error);
      process.exit(1);
    }

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
  }
}

initializeDatabase();
