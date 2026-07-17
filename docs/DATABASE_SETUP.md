# SegurIA Database Setup

## Overview

SegurIA uses Supabase (PostgreSQL) as its primary database. The schema includes tables for users, properties, devices, integrations, alerts, and leads.

## Database Schema

### Tables

1. **users** - User accounts linked to Supabase Auth
2. **properties** - Customer properties (campos, houses, hotels, businesses)
3. **devices** - Cameras, sensors, and IoT devices
4. **integrations** - External integrations (Tuya, Home Assistant, etc)
5. **alerts** - Security alerts and notifications
6. **leads** - Contact form submissions and sales leads
7. **contact_submissions** - Contact form data
8. **activity_logs** - User activity tracking

## Setup Instructions

### Option 1: Manual Setup via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Create a new query
4. Copy the entire contents of `lib/db/init.sql`
5. Execute the query

### Option 2: Using the Init Script

Prerequisites:
- Node.js 16+
- Environment variables set: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

```bash
# Install dependencies (if not already done)
pnpm install

# Run the initialization script
node scripts/init-db.js
```

### Option 3: Using psql Command Line

```bash
# Export environment variables
export PGPASSWORD=$POSTGRES_PASSWORD

# Connect to your Supabase database and run the schema
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB < lib/db/init.sql
```

## Environment Variables Required

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
POSTGRES_URL=postgres://user:password@host:port/database
POSTGRES_PRISMA_URL=postgres://user:password@host:port/database
```

## Security

- **Row Level Security (RLS)**: All tables have RLS policies enabled
- **Encrypted Fields**: API keys and secrets are encrypted in storage
- **Access Control**: Users can only access their own data
- **Admin Role**: Service role key is required for admin operations

## Backup and Recovery

### Backup Database

```bash
pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > backup.sql
```

### Restore Database

```bash
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB < backup.sql
```

## Troubleshooting

### Error: "SUPER user" required

The init script requires service role permissions. Make sure you're using `SUPABASE_SERVICE_ROLE_KEY`, not the anon key.

### Error: "UUID extension not found"

PostgreSQL UUID extension is automatically enabled by Supabase. If you encounter this, ensure you have the correct permissions.

### Tables not appearing in dashboard

- Refresh the Supabase dashboard
- Check the "Schema" tab in SQL Editor
- Verify no errors in execution

## Adding New Tables

To add new tables:

1. Edit `lib/db/init.sql` with your new table definition
2. Add TypeScript types to `lib/types/database.ts`
3. Run the migration again or execute the new SQL manually

## Migrations and Updates

Future migrations should follow this pattern:

1. Create new file: `lib/db/migrations/YYYYMMDD_description.sql`
2. Update `lib/db/init.sql` with the changes
3. Document changes in this file
4. Test locally before deploying to production

## Support

For Supabase issues, see: https://supabase.com/docs
For SegurIA schema questions, check the comments in `lib/db/init.sql`
