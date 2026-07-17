# Production security baseline

## Required configuration

- Use a dedicated Supabase project for SegurIA.
- Configure the URL and publishable key for browser and SSR access.
- Configure `SUPABASE_SECRET_KEY` only in the server environment.
- Generate independent secrets for each machine-to-machine integration.
- Never reuse a client password as an integration secret.
- Never commit `.env.local` or production credentials.

## Database activation

1. Link the repository to the dedicated SegurIA project.
2. Review and apply the migrations in `supabase/migrations`.
3. Generate TypeScript types from the deployed schema.
4. Run Supabase security and performance advisors.
5. Test RLS with users belonging to two different organizations.

## Authentication

- Portal sessions use the Supabase SSR cookie flow.
- Platform roles belong in `app_metadata`, not user-editable metadata.
- Organization access is resolved from `memberships` and protected by RLS.
- Client creation requires an authenticated internal role.
- Passwords are accepted only during creation and are never returned by the API.

## Ingestion

- Routes reject requests when their secret is missing from the environment.
- Secrets are sent in headers, not request bodies or query strings.
- The current shared Gateway secret is a bootstrap control only.
- Production must move to one credential per Gateway with rotation and replay protection.

## Release gate

Production is blocked until all checks below pass:

- no demo users or passwords in source,
- no local JSON persistence for operational data,
- no anonymous ingestion path,
- no cross-organization reads or writes,
- no provider names in the client portal,
- successful backup and restore exercise,
- successful build and end-to-end login test.
