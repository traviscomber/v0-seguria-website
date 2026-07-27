# Wildlife Intelligence Tenancy Boundary

## Purpose

This document defines the authorization and ownership boundary that every Wildlife Intelligence database row, Storage object, API operation and portal route must follow.

It is based on direct inspection of the current production Supabase schema. It does not rename, delete or reassign existing production records.

## Production finding: two tenancy models coexist

The production database currently contains two separate models:

### Canonical organization model

```text
auth.users
  -> memberships
  -> organizations
  -> properties
  -> devices
```

This model already has organization-aware foreign keys, composite site constraints and reusable RLS helpers.

### Legacy operations model

```text
auth.users
  -> user_operations
  -> operations
```

`operations` and `user_operations` are not currently connected by a foreign key to `organizations`, `properties` or `devices`.

Wildlife Intelligence must use the canonical `organizations` and `memberships` model. The operations model remains a compatibility concern for existing portal screens, but it must not become the ownership boundary for new Wildlife evidence.

## Verified production mapping

| Domain concept | Production representation | Verified details |
| --- | --- | --- |
| Authenticated user | `auth.users` | Actor identity. |
| Organization | `organizations` | `id`, `name`, `slug`, `status`, timestamps. |
| Membership | `memberships` | Composite primary key `(organization_id, user_id)` and required `role`. |
| Site | `properties` | Required `organization_id`; composite uniqueness `(id, organization_id)`. |
| Device | `devices` | Required `organization_id` and `property_id`; composite FK to `properties(id, organization_id)`. |
| Legacy operation | `operations` | Separate tenant-like record without a verified bridge to `organizations`. |
| Legacy operation membership | `user_operations` | Links `auth.users` to `operations`; nullable free-text role. |
| Observation | `wildlife_observations` | New organization- and site-scoped evidence case. |

## Verified roles

The canonical `memberships.role` constraint permits:

- `owner`
- `admin`
- `operator`
- `technician`
- `viewer`

Unknown roles fail closed. Wildlife review permissions must be mapped to this existing set rather than introducing an unverified `reviewer` role in the first migration.

Recommended MVP capability mapping:

| Capability | Allowed roles |
| --- | --- |
| Create observation | `owner`, `admin`, `operator`, `technician` |
| View organization observations | all canonical membership roles |
| Access protected original evidence | `owner`, `admin`, `operator`, `technician`; `viewer` only if product policy explicitly enables it |
| Validate, correct or reject | `owner`, `admin`, `operator` |
| Change ownership or tenancy configuration | `owner`, `admin` |

## Existing RLS foundation

Production already uses private-schema authorization helpers:

- `private.is_org_member(organization_id)` for member reads;
- `private.has_org_role(organization_id, roles[])` for role-sensitive writes.

Verified examples include:

- `properties_select_member`;
- `properties_insert_staff`;
- `properties_update_staff`;
- `properties_delete_admin`;
- `devices_select_member`;
- `devices_manage_staff`;
- organization member read and administrator update policies.

Wildlife policies should reuse these helpers unless a security review finds a defect. Parallel membership logic would increase drift risk.

## Required identifiers

Every Wildlife observation must persist:

- `organization_id`: FK to `organizations.id`;
- `site_id`: selected `properties.id`;
- `submitted_by_user_id`: authenticated `auth.users.id` actor;
- an immutable external reference for support and audit use.

Every dependent Wildlife record must also carry `organization_id`. This deliberate redundancy enables explicit RLS, efficient tenant filtering and composite consistency constraints.

## Server-side authorization algorithm

Clients may submit a site identifier, but client-provided organization identifiers are never authoritative.

For each protected read or write, the server must:

1. Resolve the authenticated user from the Supabase session.
2. Resolve the requested `properties` row.
3. Derive `organization_id` from `properties.organization_id`.
4. Verify `(organization_id, auth.uid())` in `memberships` or call the existing private authorization helper.
5. Require an allowed canonical role for the requested action.
6. Execute the Wildlife query with both `organization_id` and `site_id` constraints.

A missing user, site, canonical membership or allowed role is a denial. The implementation must not fall back to `user_operations` or a client-supplied organization identifier.

## Database invariants

The Wildlife foundation must enforce:

1. `wildlife_observations.organization_id` references `organizations.id`.
2. `(site_id, organization_id)` references `properties(id, organization_id)`.
3. Evidence assets, metadata snapshots, analyses, scores, reviews and audit events match their observation organization.
4. Review writes require an active canonical membership with an allowed role.
5. Cross-organization reads and writes are denied by RLS, not only by application filters.
6. Privileged server code validates the same relationships even though a service-role client bypasses RLS.

The existing composite-key pattern used by `devices` is the reference implementation for observation-to-site integrity.

## Operations compatibility boundary

`operations` and `user_operations` are currently a separate legacy/portal access model.

Compatibility rules:

- Do not delete or rename either table in the Wildlife MVP.
- Do not populate Wildlife `organization_id` from `operations.id`.
- Do not treat a `user_operations` row as canonical Wildlife authorization.
- Do not silently create canonical memberships from legacy operation membership during intake.
- A future explicit bridge may map an operation to an organization, but it requires a reviewed migration, uniqueness rules and backfill verification.
- Portal presentation values derived from operations must be translated to a canonical organization/site context before a Wildlife action is allowed.

## Storage boundary

Original evidence must use a private bucket. Object keys are derived only after canonical membership and site authorization:

```text
organizations/{organization_id}/sites/{site_id}/observations/{observation_id}/original/{asset_id}/{safe_filename}
```

Derivative files use a separate `derivatives/` segment and never replace originals. Storage policies must use canonical organization membership; possession of an object path is not authorization.

## Vision service boundary

The Python vision service is an analysis processor, not an authorization authority or system of record.

```text
Authorized application workflow
  -> immutable evidence asset
  -> Wildlife vision adapter
  -> Python vision service
  -> versioned Wildlife analysis record
```

The adapter supplies correlation identifiers and an internal asset reference or short-lived signed URL. The vision service must not receive Supabase service-role credentials and must not choose an organization or site.

## Migration risks and controls

### Dual tenant concepts

Risk: portal code may present an `operations.id` where new APIs expect `organizations.id`.

Control: expose a typed canonical Wildlife context and reject unresolved operation-only contexts. Add an explicit bridge later only after verifying business identity and cardinality.

### Authorization drift

Risk: new policies duplicate membership rules differently from the established platform.

Control: reuse `private.is_org_member` and `private.has_org_role`, then add two-tenant denial tests.

### Site/organization mismatch

Risk: an observation stores a valid site and a different valid organization.

Control: use a composite FK `(site_id, organization_id) -> properties(id, organization_id)`.

### Storage/database mismatch

Risk: an object upload succeeds while its database transaction fails, or the inverse.

Control: use explicit ingestion state, deterministic paths, idempotency and audited compensating cleanup.

### Elevated backend access

Risk: service-role clients bypass RLS.

Control: keep credentials server-side and require the same canonical membership and composite site checks in privileged code.

## Implementation sequence

1. Add a server-only canonical Wildlife authorization helper using `memberships`, `organizations` and `properties`.
2. Add unit/static tests for allowed roles, denied roles, missing membership and cross-organization site selection.
3. Create Wildlife tables using composite organization/site integrity.
4. Add RLS using the existing private authorization helpers.
5. Add private Storage policies using the same canonical membership boundary.
6. Address operation-to-organization bridging separately without blocking canonical Wildlife records.

## Acceptance checks

This tenancy block is implementation-ready when:

- production names, constraints, role labels and RLS helpers are recorded;
- Wildlife uses `organizations` and `memberships` as its only canonical tenant model;
- a server helper returns `{ userId, organizationId, siteId, role }` from trusted database state;
- manipulated organization and site identifiers fail closed;
- cross-organization database and Storage tests deny access;
- no existing operation, property, membership or device record is deleted or implicitly reassigned.
