# SegurIA database

SegurIA uses Supabase Auth, PostgreSQL, Row Level Security and a private Storage bucket. The canonical schema is the ordered SQL history in `supabase/migrations/`; there is no parallel bootstrap schema.

## Current model

- `organizations` and `memberships`: multi-company tenant isolation and roles.
- `properties` and `spaces`: protected sites and their physical areas.
- `gateways` and `integrations`: internal connection layer.
- `devices`, `entities` and `entity_states`: normalized cameras and sensors.
- `events`, `incidents` and `incident_events`: security activity and response.
- `camera_snapshots`: private evidence metadata linked to Storage.
- `camera_stream_sessions`: short-lived camera session requests handled by the authenticated gateway.
- `integration_credentials`: encrypted internal connection credentials by property.
- `audit_log`: operational traceability.
- `leads` and `contact_submissions`: commercial intake, readable only by staff.

## Provisioning contract

The internal client provision flow creates Supabase Auth access, tenant membership, one property, three base spaces and four onboarding devices. The backend also ensures those placeholder devices exist after the database RPC returns, so the portal is useful immediately even before the first connector sync. Real inventory should replace or complement placeholders through the authenticated gateway.

## Environment

Use `.env.example` as the variable contract. Pull Vercel-linked values into a local ignored file when needed:

```powershell
vercel link
vercel env pull .env.local --yes
```

Never expose or commit server keys, database URLs, gateway secrets or monitor secrets.

## Migrations

Create forward-only files using the timestamp convention:

```text
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

Validate each migration in a transaction before applying it. Never reuse the removed `lib/db/init.sql` bootstrap flow because it represented an incompatible single-user schema.

## Security contract

- RLS must remain enabled on every public table.
- Browser clients use only the publishable key and authenticated policies.
- Server routes use the server-only key for provisioning, ingestion and contact submissions.
- Internal connection credentials should use `SEGURIA_CREDENTIAL_ENCRYPTION_KEY` and are stored only as ciphertext. If the dedicated key is missing, the server-only Supabase secret is used as a fallback so production does not block onboarding.
- Public forms never receive direct table grants.
- Gateway secrets are generated per installation and stored only as hashes.
- Camera evidence uses the private `seguria-evidence` bucket. Browser routes proxy signed storage access for snapshots, HLS manifests and HLS segments so clients never receive raw storage URLs.

## Production checks

Before deployment:

1. Confirm migration versions in `supabase_migrations.schema_migrations`.
2. Confirm no public table is missing RLS.
3. Confirm no `anon` role can select or insert commercial or operational data.
4. Run `tsc --noEmit` and `next build --webpack`.
5. Test registration, login, tenant isolation, gateway ingestion and signed camera evidence.
