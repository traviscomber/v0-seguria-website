# Wildlife Intelligence Autonomous Roadmap

This is the principal execution board for `AUTONOMOUS_WORK_OBJECTIVE.md`.

## Status legend

- `[ ]` Pending
- `[-]` In progress or blocked
- `[x]` Completed and verified

A block may be marked `[x]` only after its functional commit has deployed to Vercel with state `READY` and the verification evidence is recorded here.

## Current status

- Objective: Wildlife Intelligence evidence intake MVP end to end
- GitHub objective: #17
- Related MVP issue: #16
- Current phase: 0 — autonomous execution bootstrap
- Current priority: verify the bootstrap deployments, then consolidate tenancy and site ownership
- Overall state: IN PROGRESS

## Phase 0 — Autonomous execution bootstrap

- [x] Create GitHub objective #17.
- [x] Define scope, execution rules, limits and closure criteria in `AUTONOMOUS_WORK_OBJECTIVE.md`.
- [x] Create `roadmap.md` as the principal execution board.
- [-] Verify Vercel deployment for commit `846103012f185966f4476ee03d448940afc72a6c`.
- [ ] Verify Vercel deployment for this roadmap bootstrap commit.
- [ ] Record both deployment identifiers and final states.

### Preserved

- Existing application code and routes.
- Existing Supabase integration and domain data.
- Existing Wildlife and vision contracts.
- Existing deployment behavior.

### Verification performed

- GitHub write to `main` succeeded for `AUTONOMOUS_WORK_OBJECTIVE.md`.
- `roadmap.md` created as a separate commit, in accordance with the commit protocol.

### Pending

- Resolve Vercel project/team identifiers and verify both bootstrap deployments reach `READY`.
- Begin Phase 1 after bootstrap deployment verification.

## Phase 1 — Architecture and tenancy consolidation

- [ ] Verify the repository's production-facing organization and membership resolution.
- [ ] Verify the actual use of `operations` and `user_operations`.
- [ ] Verify the current relationship between organizations and `properties`.
- [ ] Identify legacy paths based on `properties.user_id`.
- [ ] Define the canonical organization, membership, site and user mapping for Wildlife.
- [ ] Document compatibility and migration risks.
- [ ] Verify the Python vision service boundary and define its Wildlife adapter contract.
- [ ] Add tests or static verification for the selected organization/site authorization path.
- [ ] Deploy the consolidation block and verify `READY`.
- [ ] Record preserved behavior, verification and next priority.

## Phase 2 — Database and private Storage foundation

- [ ] Add a safe organization-to-property/site migration where required.
- [ ] Create `wildlife_observations`.
- [ ] Create `wildlife_evidence_assets`.
- [ ] Create `wildlife_metadata_snapshots`.
- [ ] Create `wildlife_ai_analyses`.
- [ ] Create `wildlife_evidence_scores`.
- [ ] Create `wildlife_human_reviews`.
- [ ] Create `wildlife_audit_events`.
- [ ] Add foreign keys, indexes, state constraints and version fields.
- [ ] Add append-only protections where appropriate.
- [ ] Enable and test RLS for every Wildlife table.
- [ ] Enforce matching organization IDs between site and observation.
- [ ] Configure a private evidence bucket.
- [ ] Add organization-aware Storage policies.
- [ ] Separate original and derivative paths.
- [ ] Document retention and coordinate-redaction rules.
- [ ] Deploy the foundation block and verify `READY`.

## Phase 3 — Evidence intake backend

- [ ] Add authenticated evidence intake.
- [ ] Resolve organization membership server-side.
- [ ] Validate authorized site access.
- [ ] Validate MIME type, extension, size and image dimensions.
- [ ] Calculate SHA-256 before downstream analysis.
- [ ] Preserve the exact original in private Storage.
- [ ] Generate a stable external observation reference.
- [ ] Create observation and evidence asset records safely.
- [ ] Add idempotency and duplicate-original handling.
- [ ] Record creation and upload audit events.
- [ ] Add intake success and failure tests.
- [ ] Deploy the intake block and verify `READY`.

## Phase 4 — Metadata extraction

- [ ] Extract available EXIF and normalized metadata.
- [ ] Preserve raw values where useful.
- [ ] Record provenance for normalized values.
- [ ] Record extraction warnings.
- [ ] Record extractor name, version and timestamp.
- [ ] Keep embedded and user-supplied time/location separate.
- [ ] Report inconsistencies without authenticity claims.
- [ ] Add complete, partial, malformed and absent metadata fixtures.
- [ ] Deploy the metadata block and verify `READY`.

## Phase 5 — Versioned AI assessment

- [ ] Define strict structured output aligned with Wildlife contracts.
- [ ] Add a versioned prompt that prohibits invented metadata and unsupported facts.
- [ ] Represent uncertainty and image limitations explicitly.
- [ ] Persist provider, model, schema version and prompt version.
- [ ] Preserve every analysis attempt as a new version.
- [ ] Add safe retries, timeout and failure handling.
- [ ] Define the adapter boundary for future Python vision events.
- [ ] Avoid specialized-model performance claims before validation.
- [ ] Add schema and failure-path tests.
- [ ] Deploy the AI assessment block and verify `READY`.

## Phase 6 — Evidence Score

- [ ] Integrate the existing deterministic Evidence Score.
- [ ] Validate component and total ranges.
- [ ] Persist component explanations and score version.
- [ ] Recalculation creates a new record.
- [ ] Clarify that the score is not authenticity probability.
- [ ] Add complete, partial, missing and contradictory evidence tests.
- [ ] Deploy the scoring block and verify `READY`.

## Phase 7 — Human review

- [ ] Authorize reviewers using organization membership roles.
- [ ] Support validate, correct and reject decisions.
- [ ] Preserve corrected common and scientific names separately.
- [ ] Preserve append-only review history.
- [ ] Update observation status without deleting prior analyses or reviews.
- [ ] Record review audit events.
- [ ] Add permission and transition tests.
- [ ] Deploy the review block and verify `READY`.

## Phase 8 — Portal user experience

- [ ] Add a mobile-first upload flow inside the existing portal.
- [ ] Use authorized organization and site context.
- [ ] Show upload progress and actionable errors.
- [ ] Preview metadata with clear provenance categories.
- [ ] Add an observation result screen.
- [ ] Explain Evidence Score components.
- [ ] Display AI uncertainty and limitations.
- [ ] Add a reviewer workspace.
- [ ] Add organization-scoped observation history.
- [ ] Add filters for site, date, status and proposed species.
- [ ] Protect evidence access with authenticated or signed access.
- [ ] Preserve existing organization theme and navigation.
- [ ] Add relevant UI and route tests.
- [ ] Deploy the portal block and verify `READY`.

## Phase 9 — Integration and observability

- [ ] Add structured logs for intake, Storage, extraction, AI, scoring and review.
- [ ] Record processing latency and failure states.
- [ ] Add dependency health checks.
- [ ] Ensure intake does not depend on an untrained ONNX model.
- [ ] Document camera/RTSP ingestion through the vision adapter.
- [ ] Reconcile or document overlapping domain contracts.
- [ ] Deploy the integration block and verify `READY`.

## Phase 10 — Security and end-to-end validation

- [ ] Test cross-organization database denial.
- [ ] Test cross-organization Storage denial.
- [ ] Test unauthorized site selection.
- [ ] Test malicious filenames and unsupported file types.
- [ ] Test oversized files and invalid dimensions.
- [ ] Verify stored original bytes against SHA-256.
- [ ] Test idempotency and retries.
- [ ] Test malformed and missing metadata.
- [ ] Test AI schema and provider failures.
- [ ] Test reviewer permissions.
- [ ] Run lint.
- [ ] Run type checking.
- [ ] Run relevant automated tests.
- [ ] Run production build.
- [ ] Add Wildlife checks to the repository verification workflow.
- [ ] Deploy final functional validation and verify `READY`.
- [ ] Perform deployed smoke verification.

## Phase 11 — Documentation and closure

- [ ] Update architecture documentation to match implementation.
- [ ] Document environment variables and local setup.
- [ ] Document migrations and private Storage setup.
- [ ] Document privacy, retention and coordinate redaction.
- [ ] Document demonstrated capabilities and limitations.
- [ ] Add an operational runbook.
- [ ] Update issues #16 and #17.
- [ ] Confirm every closure criterion in `AUTONOMOUS_WORK_OBJECTIVE.md`.
- [ ] Confirm no open roadmap item remains.
- [ ] Verify final documentation deployment reaches `READY`.
- [ ] Mark the objective complete.

## Execution log

### 2026-07-27 — Bootstrap started

Functional/document commit:

- `846103012f185966f4476ee03d448940afc72a6c` — `docs: define autonomous work objective`

Verification:

- GitHub commit to `main`: succeeded.
- Vercel deployment: pending verification.

Data preserved:

- No application, database or Storage behavior changed.

Next priority:

1. Verify Vercel deployment state for the objective document.
2. Verify deployment state for the roadmap commit.
3. Audit and consolidate tenancy in Phase 1.
