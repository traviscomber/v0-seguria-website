# Production security baseline

## Required configuration

- Use a dedicated Supabase project for SegurIA.
- Configure the URL and publishable key for browser and SSR access.
- Configure `SUPABASE_SECRET_KEY` only in the server environment.
- Generate independent secrets for each machine-to-machine integration.
- Never reuse a client password as an integration secret.
- Never commit `.env.local` or production credentials.

## Environment separation

- Set `SEGURIA_ENVIRONMENT=production` only on the production deployment.
- Set `SEGURIA_DATA_SCOPE=production` only when the deployment points to production Supabase data.
- Preview or development deployments must use `SEGURIA_DATA_SCOPE=staging`, `development` or `test`.
- If a preview or development deployment is accidentally pointed at production data, operational mutations are blocked by default.
- `SEGURIA_ALLOW_NON_PRODUCTION_OPERATIONS=true` is a break-glass override only and must not be left enabled.
- Scheduled monitors run only in production unless the break-glass override is intentionally enabled.

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
- preview and development deployments cannot mutate production-scoped data,
- successful backup and restore exercise,
- successful build and end-to-end login test.
