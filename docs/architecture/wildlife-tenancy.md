# Wildlife Intelligence Tenancy Boundary

## Purpose

This document defines the authorization and ownership boundary that every Wildlife Intelligence database row, Storage object, API operation and portal route must follow.

It is an implementation contract for the evidence-intake MVP. It does not rename or delete existing production tables.

## Canonical mapping

| Domain concept | Existing platform representation | Wildlife usage |
| --- | --- | --- |
| Authenticated user | `auth.users` | Actor identity only; it is not the tenant boundary. |
| Organization | `operations` | Canonical tenant and data-isolation boundary. |
| Membership | `user_operations` | Authorizes a user to act inside an organization and carries the applicable role. |
| Site | `properties` | Operational location owned by exactly one organization for Wildlife purposes. |
| Device | `devices` | Optional capture source associated with a site. |
| Observation | `wildlife_observations` | Organization- and site-scoped evidence case. |

The required ownership chain is:

```text
auth.users
  -> user_operations
  -> operations
  -> properties
  -> wildlife_observations
```

A Wildlife request is authorized only when the authenticated user has an active membership in the organization that owns the selected site.

## Required identifiers

Every Wildlife observation must persist:

- `organization_id`: the canonical tenant identifier;
- `site_id`: the selected `properties.id`;
- `submitted_by_user_id`: the authenticated actor;
- an immutable external reference for support and audit use.

Every dependent Wildlife record must carry `organization_id` even when that value can be reached through an observation foreign key. This deliberate redundancy enables explicit RLS policies, simpler audit queries and tenant-consistency constraints.

## Server-side authorization algorithm

Clients may submit a site identifier, but they may not choose or assert an organization identifier as authoritative.

For each write or protected read, the server must:

1. Resolve the authenticated user from the Supabase session.
2. Resolve active `user_operations` memberships for that user.
3. Resolve the requested `properties` row.
4. Determine the site's owning `operations.id` on the server.
5. Require a matching active membership for that operation.
6. Derive `organization_id` from the authorized site relationship.
7. execute the Wildlife query with both `organization_id` and `site_id` constraints.

A missing user, membership, site or ownership match is a denial. The implementation must not fall back to client-provided organization data.

## Role boundary

The minimum role policy for the MVP is:

| Capability | Required membership |
| --- | --- |
| Create an observation | Active organization member |
| View organization observations | Active organization member |
| Download protected original evidence | Active organization member with evidence access |
| Validate, correct or reject an observation | Reviewer or administrator role |
| Change organization/site ownership | Administrator role outside the Wildlife workflow |

Exact existing role labels must be mapped explicitly when the authorization helper is implemented. Unknown roles fail closed.

## Legacy compatibility

Historical `properties.user_id = auth.uid()` ownership is a legacy user-ownership path. It may remain temporarily for existing portal behavior, but it must not become the ownership model for new Wildlife records.

Compatibility rules:

- Do not remove `properties.user_id` in the Wildlife foundation migration.
- Do not copy `properties.user_id` into `wildlife_observations.organization_id`.
- Prefer an explicit organization/operation foreign key on `properties`.
- Where an existing property has no organization relationship, classify it as unmigrated and block Wildlife intake for that site until ownership is resolved.
- Do not silently create an organization from an individual user during evidence intake.

## Database invariants

The database foundation must enforce the following invariants:

1. A site belongs to one canonical organization for Wildlife access.
2. An observation's `organization_id` equals the organization that owns its `site_id`.
3. Evidence assets, metadata snapshots, analyses, scores, reviews and audit events have the same `organization_id` as their observation.
4. Human reviewers have an active membership in the observation organization at write time.
5. Cross-organization reads and writes are denied by RLS, not only by application filters.
6. Service-role operations remain server-side and still validate tenant relationships before writing.

A database trigger or constrained security-definer function may be used to enforce organization/site consistency, but application validation alone is insufficient.

## Storage boundary

Original evidence must use a private bucket. The object key must be derived after authorization and include the tenant and observation boundaries:

```text
organizations/{organization_id}/sites/{site_id}/observations/{observation_id}/original/{asset_id}/{safe_filename}
```

Derivative files use a separate `derivatives/` segment and never replace the original.

Storage authorization must verify membership through database state. Possession of a predictable object path is not authorization.

## Portal boundary

The portal may display `organizationName`, available sites and a selected `propertyId`, but those values are presentation state. Every protected server operation must independently resolve authorization.

The portal must only list sites belonging to organizations for which the current user has an active membership. A stale or manipulated selection must be rejected by the server.

## Vision service boundary

The Python vision service is an analysis processor, not an authorization authority and not the system of record.

```text
Authorized application workflow
  -> immutable evidence asset
  -> Wildlife vision adapter
  -> Python vision service
  -> versioned Wildlife analysis record
```

The adapter supplies an internal asset reference or short-lived signed URL plus correlation identifiers. The vision service must not receive Supabase service-role credentials and must not independently choose an organization or site.

## Migration risks and controls

### Mixed ownership models

Risk: existing routes may rely on `properties.user_id` while new records use organization membership.

Control: introduce the organization/site relationship additively, preserve the legacy column, and migrate records explicitly before enabling Wildlife intake.

### Incomplete memberships

Risk: production users may reach portal data through historical ownership but have no `user_operations` row.

Control: report unmapped users/sites; do not synthesize membership during a Wildlife request.

### RLS policy drift

Risk: application queries appear correct while direct Supabase access crosses tenants.

Control: add denial tests using two organizations and two users for every Wildlife table and the evidence bucket.

### Storage/database mismatch

Risk: an object is uploaded but its database transaction fails, or a row is created without an object.

Control: use an explicit ingestion state, deterministic object path, idempotency key and compensating cleanup with audit records.

### Elevated backend access

Risk: service-role clients bypass RLS.

Control: keep credentials server-side and require the same membership/site consistency checks in privileged code.

## Implementation sequence

1. Confirm the exact columns and role labels in `operations`, `user_operations` and `properties`.
2. Add or verify an explicit organization foreign key on `properties`.
3. Add a single server-only authorization helper that resolves user, membership, organization and site.
4. Add static/unit tests for allowed and denied organization/site combinations.
5. Build Wildlife migrations and Storage policies on that helper and relationship.

## Acceptance checks

This tenancy block is implementation-ready when:

- the production column names and role labels are recorded;
- every site used by Wildlife has an explicit organization owner;
- a server helper returns an authorized `{ userId, organizationId, siteId, role }` context;
- manipulated organization and site identifiers fail closed;
- cross-organization database and Storage tests deny access;
- no existing property data is deleted or reassigned implicitly.
