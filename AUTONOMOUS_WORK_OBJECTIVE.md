# Autonomous Work Objective

## Objective

Deliver a production-ready, end-to-end Wildlife Intelligence evidence intake workflow inside SegurIA, progressing through architecture, data, backend, frontend, integration, security, validation and documentation until every closure criterion in this document and `roadmap.md` is satisfied.

The workflow must support:

```text
Authenticated member
-> authorized organization and site
-> evidence upload
-> immutable private original
-> SHA-256 verification
-> metadata snapshot with provenance
-> versioned AI assessment
-> deterministic Evidence Score
-> append-only human review
-> organization-scoped history and audit trail
```

## Scope

### In scope

- Consolidation of the existing organization, membership, property/site and user model.
- Supabase migrations, constraints, indexes, RLS and private Storage policies.
- Wildlife observation, evidence asset, metadata snapshot, AI analysis, Evidence Score, human review and audit-event persistence.
- Authenticated intake with access validation, file validation, hashing, storage and idempotency.
- Metadata extraction with provenance, warnings and explicit distinction between embedded, user-supplied, derived and system-generated values.
- Versioned AI assessment with structured output, uncertainty and failure handling.
- Deterministic, explainable and versioned Evidence Score integration.
- Append-only human review and status transitions.
- Mobile-first portal UI, observation history and protected evidence access.
- Python vision adapter boundary without depending on an untrained model.
- Automated verification, production build, deployment checks, operational documentation and issue updates.

### Out of scope unless required to close the objective

- Training or claiming production accuracy for a specialized wildlife model.
- Replacing the existing SegurIA portal, authentication or organization theming.
- Building a second tenancy system or a parallel vision platform.
- Public access to original evidence or sensitive coordinates.
- Claims that EXIF, GPS, timestamps, AI output or an Evidence Score independently prove authenticity.
- Unrelated website redesigns or features.

## Execution rules

1. Work directly on `main`, as explicitly authorized for this objective.
2. Use small, coherent changes. One functional concern per commit.
3. Do not combine unrelated implementation work in one commit.
4. Run the relevant verification before committing a functional block.
5. Every functional commit must be followed by deployment verification.
6. A functional block is not closed until its Vercel deployment reaches `READY`.
7. After a block is verified, update `roadmap.md` in a separate commit.
8. The roadmap commit records:
   - completed checklist items;
   - functional commit SHA;
   - deployment state and URL or identifier when available;
   - tests and checks performed;
   - data and behavior preserved;
   - known risks and pending work;
   - next priority.
9. Do not mark work complete based only on contracts, migrations, mock UI or documentation. The capability must be wired into the application where the roadmap requires it.
10. Preserve existing production behavior unless a documented migration requires a change.
11. Prefer additive, reversible migrations before destructive changes.
12. Never delete or overwrite evidence history, AI analyses, scores, reviews or audit records to simulate a clean state.
13. Do not bypass RLS or organization authorization in client-facing flows.
14. Do not trust organization, site, user or role identifiers supplied by the browser without server-side resolution and verification.
15. Do not invent metadata, model confidence, deployment results, test results or completion status.
16. When a required credential, production-only decision or irreversible business rule is unavailable, document the blocker in `roadmap.md` and continue with the next independent block where safe.

## Commit protocol

### Functional commit

A functional commit contains one reviewable implementation block, for example:

- tenancy migration;
- Wildlife schema and RLS;
- intake hashing;
- metadata extraction;
- AI analysis persistence;
- Evidence Score persistence;
- review workflow;
- one coherent UI capability;
- tests for one capability.

Recommended commit style:

```text
feat(wildlife): add organization-scoped observation schema
fix(wildlife): enforce site membership during intake
test(wildlife): cover cross-organization evidence access
docs(wildlife): document evidence retention policy
```

### Roadmap commit

A roadmap update is committed separately after the corresponding deployment is `READY` and verification is recorded.

Recommended commit style:

```text
chore(roadmap): close wildlife observation schema block
```

## Deployment protocol

For each functional commit:

```text
commit to main
-> Vercel deployment created
-> inspect deployment state
-> if failed, inspect logs and fix in a new functional commit
-> wait for READY
-> perform available smoke verification
-> update roadmap in a separate commit
```

A block remains `IN PROGRESS` when the deployment is queued, building, cancelled or failed.

Documentation-only commits that trigger Vercel still require a deployment check, but they do not prove any untested functional capability.

## Preservation rules

The following must be preserved unless an explicitly documented and reversible migration changes them:

- Supabase Auth identities and sessions.
- Existing organizations/operations and memberships.
- Existing properties/sites and device relationships.
- Existing alerts, leads, contact submissions and activity history.
- Existing portal routes, organization theming and authorized navigation.
- Existing Wildlife TypeScript contracts, unless migrated with compatibility notes.
- Original evidence bytes after successful intake.
- All historical metadata snapshots, AI analyses, scores, human reviews and audit events.

## Evidence and AI rules

- The central record is an observation, not merely an uploaded photo.
- Original evidence is immutable and private by default.
- SHA-256 is calculated and persisted before downstream analysis.
- Derivatives are stored separately and explicitly identified.
- Embedded metadata, user statements, derived values and system values remain distinguishable.
- Metadata absence or inconsistency may be reported but must not be presented as proof of fraud.
- AI output is versioned, structured and explicit about uncertainty and image limitations.
- General-purpose model output must not fabricate numerical confidence or unsupported facts.
- Human review supplements history and never overwrites previous AI output or reviews.
- Evidence Score measures documented evidence completeness/quality, not authenticity probability.

## Security rules

- Every Wildlife domain record is organization-scoped.
- Site access is validated against authenticated membership.
- RLS is enabled for all browser-accessible Wildlife tables.
- Private Storage access is organization-aware and time-limited where signed URLs are used.
- Sensitive coordinates are not exposed by default.
- Cross-organization table and file access must be tested and denied.
- Service-role access is restricted to trusted server paths and is never exposed to the browser.

## Limits and stop conditions

Pause only the affected block when one of these conditions occurs:

- An irreversible migration needs a business decision not represented in the repository.
- A required external credential or production secret is unavailable.
- Production data shape contradicts the verified repository model and cannot be safely inferred.
- A persistent deployment or platform failure cannot be resolved from available logs.
- Continuing would risk data loss, cross-tenant exposure or breaking authentication.

When blocked:

1. Record the exact blocker and evidence in `roadmap.md`.
2. Preserve the last verified state.
3. Continue with independent work that does not conceal or worsen the blocker.
4. Never mark the blocked checklist item complete.

## Closure criteria

The autonomous objective closes only when all of the following are true:

- An authenticated organization member can select only an authorized site.
- A supported image can be uploaded from mobile or desktop.
- The exact original is stored privately and its SHA-256 is persisted.
- Metadata extraction records provenance, warnings, extractor name and version.
- Embedded and user-supplied time/location data remain distinguishable.
- A versioned structured AI assessment can be persisted without invented metadata.
- A deterministic and explainable Evidence Score is persisted as a new version.
- An authorized reviewer can validate, correct or reject an assessment.
- Prior analyses, scores and reviews remain available.
- Observation history is organization-scoped and filterable.
- Audit events cover material workflow transitions.
- Cross-organization database and Storage access is denied by verified tests.
- Intake validation, idempotency, malformed metadata and AI failure paths are tested.
- Lint, type checking, relevant tests and the production build pass.
- The final functional deployment is `READY` and smoke verification succeeds.
- Documentation matches the implemented architecture, setup, privacy rules, capabilities and limitations.
- `roadmap.md` contains no incomplete closure item and records the final verification evidence.
- GitHub issues #16 and #17 accurately reflect completion.

## Definition of done

The objective is done only when the complete demonstrated workflow operates in the deployed application and all closure criteria above are recorded as verified in `roadmap.md`.

A contract, mock, local-only implementation, unexecuted migration or successful build without a `READY` deployment is not sufficient.