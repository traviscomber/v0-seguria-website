# SegurIA — Design and System Record

Last updated: 2026-08-03  
Repository: `traviscomber/v0-seguria-website`  
Production: `https://seguria.tech`  
Primary branch: `main`

## 1. Purpose

SegurIA is a security and operational visibility platform for properties, hospitality operations and distributed sites. The product combines a public commercial website, a protected client portal, administrative tools, incident visibility, private evidence handling and a contextual support workflow.

The current product direction is intentionally restrained. The platform is functionally complete enough for the present stage. Future work should prioritize stability, simplification, visual quality, security and removal of duplication rather than adding more modules.

## 2. Product principles

1. Operational clarity before feature density.
2. A busy manager must understand status, risk and next action quickly.
3. Evidence must remain private, scoped and auditable.
4. Client-facing language should explain outcomes, not internal technical complexity.
5. Existing composition, typography, spacing and brand language should remain consistent.
6. New functionality must solve a concrete verified problem.
7. Do not introduce parallel systems when an existing screen or data model can support the need.
8. Production changes must be verified through deployment status and runtime observations.

## 3. Current product surfaces

### Public website

The public website presents SegurIA services, projects, integrations and commercial positioning. Public pages support Spanish and English routes where implemented.

### Client portal

Primary route: `/app`

The client portal provides:

- executive operational summary;
- properties and protected spaces;
- cameras and devices;
- alerts and incidents;
- evidence and activity;
- contextual support actions;
- property-specific operational views.

Property detail route:

`/app/properties/[propertyId]`

The property detail view includes:

- property header and identity;
- operational statistics;
- current incidents and priorities;
- cameras;
- devices;
- evidence;
- recent activity;
- support entry point.

Missing summary data must degrade safely. Property views must not fail when operational report data is temporarily unavailable.

### Contextual support

Primary route:

`/contacto/huilo-huilo`

Support can be opened from:

- dashboard;
- cameras;
- alerts;
- incidents;
- priority cards;
- property views.

The support page reads trusted internal query parameters, derives the correct topic, pre-fills a useful initial message, displays the received context and preserves a safe return route.

Supported structured context includes:

- origin;
- section;
- kind: camera, alert, incident or dashboard;
- property ID;
- item ID;
- item label;
- safe return path under `/app`.

External return URLs are not accepted.

### Administrative CRM

Primary route:

`/admin/leads`

The CRM provides:

- lead list and search;
- lead status management;
- notes;
- contextual origin;
- support item identifiers;
- private evidence access;
- evidence access history;
- first response timestamp;
- owner;
- SLA state;
- activity timeline.

Supported lead statuses:

- `new`;
- `contacted`;
- `qualified`;
- `proposal_sent`;
- `won`;
- `lost`.

### Operational queue

Primary route:

`/admin/queue`

The queue is intentionally simple and should not become a separate complex ticketing product.

It provides:

- priority ordering by SLA, urgency and age;
- filters for all, mine and unassigned;
- filters by SLA state;
- search;
- manual assignment;
- quick self-assignment;
- link back to the main CRM record.

Assignment changes are recorded in the lead activity log.

### Private evidence administration

Primary route:

`/admin/evidence`

This view provides:

- support submissions containing evidence;
- contextual origin;
- private signed access;
- access registration before opening;
- recent evidence access history;
- daily storage usage visibility.

Evidence must never be exposed through permanent public URLs.

## 4. Visual direction

The product uses a dark operational visual system with restrained blue accents.

Core characteristics:

- deep navy backgrounds;
- regular-weight typography rather than excessively thin text;
- limited accent brightness;
- compact operational cards;
- restrained borders and shadows;
- clear hierarchy between status, evidence and action;
- consistent rounded geometry;
- high contrast for critical actions without turning the interface into an alarm dashboard.

Administrative screens should remain dense enough for operations but readable. Client screens should feel calm, premium and easy to understand.

Do not redesign the complete interface during isolated fixes. Preserve the existing composition unless a specific redesign is approved.

## 5. Architecture

### Frontend and application layer

- Next.js App Router;
- React server and client components;
- TypeScript;
- Vercel production deployment;
- route-level authorization;
- operational APIs under `/api`.

### Data and storage

Supabase project reference:

`nzaonaqycyyzrbxcoosk`

Primary systems:

- PostgreSQL data through Supabase;
- Supabase authentication and role resolution;
- private Supabase Storage bucket for support evidence;
- JSON detail payloads stored in the existing `leads.message` field for CRM extensions that do not justify a new table.

Private evidence bucket:

`support-evidence`

### Deployment

Vercel team:

`team_OZTpx87yFUvdvneuoNbJeYS1`

Vercel project:

`prj_3kTNF2QMxVmGVRjdLzfBj9mGHkEn`

Production alias:

`seguria.tech`

All completed work described in this document is committed to `main`.

## 6. Authentication and authorization

Roles used by the product:

- `client`;
- `technician`;
- `admin`.

Rules:

- client users are redirected to `/app`;
- administrative routes reject client users;
- sensitive CRM and evidence APIs require `admin`;
- private evidence access is scoped to a selected lead and validated against the evidence record;
- operational maintenance routes require secret-based authorization;
- private operational routes should not be cached.

## 7. Support submission flow

The support form sends multipart data to:

`/api/leads`

Current attachment policy:

- maximum 4 files;
- maximum 10 MB per file;
- maximum 25 MB per request;
- supported formats: JPEG, PNG, WEBP, PDF and MP4;
- file content is checked through magic-byte signatures;
- file MIME type must match detected content;
- storage object names are randomized;
- evidence is stored privately;
- failed lead creation removes any files uploaded during that request.

The support request stores:

- contact information;
- message;
- support context;
- evidence metadata;
- evidence byte total;
- retention metadata;
- CRM activity initialization;
- hashed client IP when a hashing secret is available;
- user agent;
- consent.

## 8. Evidence security and lifecycle

Evidence access requires an authenticated administrator.

Before a private file opens, the platform records:

- administrator;
- file;
- internal path;
- timestamp.

Access history is kept inside the lead detail object and is capped to avoid unbounded growth.

Current evidence retention policy:

- metadata target: 180 days;
- active support cases remain protected from automated deletion;
- closed cases can be processed by the retention maintenance endpoint after expiration;
- retention processing is protected by `CRON_SECRET` or `SEGURIA_MONITOR_SECRET`;
- the retention endpoint is destructive and must not be run manually without explicit authorization.

## 9. CRM activity model

The CRM activity log records:

- lead creation;
- status changes;
- notes updates;
- owner assignments;
- evidence access events in the evidence-specific history.

The general activity log is capped at 100 events per lead.

The evidence access history is capped at 50 events per lead.

The first response timestamp is fixed when a new request first leaves `new` status.

## 10. SLA model

For new support requests:

- under 2 hours: `En plazo`;
- between 2 and 4 hours: `Por vencer`;
- over 4 hours: `SLA vencido`;
- after first response: `Atendido`.

SLA is an operational indicator, not a contractual guarantee unless separately agreed with the client.

## 11. Operational monitor

Primary route:

`/api/monitor/operations`

Responsibilities include:

- marking stale gateways;
- escalating overdue notifications;
- processing notification deliveries;
- rolling back automation deployments that were not confirmed in time.

The route is production-guarded and secret-protected.

Supabase occasionally returned the transient error:

`JWT issued at future`

The monitor now performs one controlled retry after 1.5 seconds only for that exact error. All other failures remain immediate.

Do not invoke the monitor casually because it can create real escalations and automation rollbacks.

## 12. Daily evidence budget

A daily evidence storage budget is enforced before accepting new support attachments.

Default budget:

`500 MB/day`

Environment override:

`SUPPORT_EVIDENCE_DAILY_BUDGET_BYTES`

The current calculation reads existing support lead metadata for the day. It is protective but not atomic under concurrent requests.

An atomic database reservation remains a possible future hardening task, not a current product requirement.

## 13. Environment variables and secrets

Important server-side variables include:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`;
- `CRON_SECRET`;
- `SEGURIA_MONITOR_SECRET`;
- `LEAD_IP_HASH_SECRET`;
- `SUPPORT_EVIDENCE_DAILY_BUDGET_BYTES`.

`LEAD_IP_HASH_SECRET` should be configured independently rather than relying on a Supabase secret fallback.

Secrets must never be committed to the repository or exposed to client components.

## 14. Current known limitations

These are known and accepted unless a concrete operational need justifies work:

1. Evidence upload still passes through the application function rather than direct signed upload to storage.
2. Daily evidence budget calculation is approximate under concurrency.
3. Malware scanning is not implemented.
4. Real end-to-end upload tests should not be run against production without explicit approval because they create data and files.
5. Retention currently scans a bounded set and may need pagination at larger scale.
6. Visual verification across all desktop and mobile states has not been automated.
7. Historical runtime error groups can remain visible after the responsible deployment has already been replaced.

## 15. Change policy

The current functional structure is frozen:

- public website;
- client portal;
- contextual support;
- CRM;
- private evidence;
- SLA;
- operational queue;
- maintenance and monitoring.

Permitted work without a new product decision:

- bug fixes;
- security fixes;
- performance fixes;
- responsive corrections;
- visual consistency corrections;
- copy simplification;
- accessibility corrections;
- removal of duplication;
- runtime stabilization.

Avoid:

- new dashboards;
- parallel ticketing systems;
- new data models for information already stored safely;
- additional workflow states without a demonstrated need;
- broad redesign during isolated fixes;
- speculative integrations.

## 16. Verification requirements

Before declaring a change complete:

1. confirm the commit is on `main`;
2. confirm the matching Vercel deployment reaches `READY`;
3. check build logs for failures;
4. check runtime errors when the change affects server behavior;
5. avoid destructive production tests;
6. do not claim visual completion without direct visual verification;
7. state clearly when something is implemented but not visually or end-to-end verified.

## 17. Key implementation commits

Selected milestones:

- `0bca2b255f2bc4173257fa681bd28bd2eb37ae86` — support redesign and integration;
- `2431ab7bb49333710cf3c0cb54a94e43d95e18e4` — shared shell;
- `d4bb128bd70f3f4db2ed4c0f358fbddecbfaa7c2` — evidence backend;
- `02da222b1d19f3e8e0dc6ebce352545cf5a5a36c` — administrative evidence page;
- `0976766723987e1672e7490c3ba1a87eb5236ff9` — lead-scoped signed evidence access;
- `b7e923295fe8c9d662b5df0beac12507499c636c` — evidence retention endpoint;
- `11c72d3fc199abcfe39e705fe54a9684de8d3dd1` — evidence retention schedule;
- `feb4f207ec666d0d5667699b03b195f28e069599` — no-cache private routes;
- `9329d82285da29c33f71decc924220887020d348` — daily evidence budget;
- `140e4a9c4f9ad77b781b213f8b06be51da098feb` — support context reading and display;
- `258eca04d9fd3f91cda10f0b8570602cb0fbaedc` — structured support context persistence;
- `768544d47065d65e1646e1c7b986b832cfefd07b` — contextual origin in evidence administration;
- `9cf875aee433f2133e1df637d07fd907cad99e18` — evidence access audit backend;
- `eb03556f1d6b7b2c53c5c496463f16e2927c73c9` — evidence access history UI;
- `d6a8f8a8a80731199915fa5e9bc00d8416db48e3` — context and evidence audit in CRM;
- `76bf594fa83d08437626fbc93e447c24ce3181d0` — first response and activity persistence;
- `6bfc9139c59a0fb0308162a68e225a59ad36666b` — SLA and activity timeline UI;
- `1e8ac73ed90634d437223b07ffe73ced55960a39` — assignment endpoint;
- `3bef4c7643514dd451acac5931014996665621be` — operational queue;
- `84dfc454995c1089d2e693e8b279ecfac4c0af3a` — queue navigation;
- `5278038af5b0196efd907afa23f0d072d3986d6e` — defensive missing property summary handling;
- `8aa6b56f804e2ee6bbb238b5a6b0b81d7db21adb` — transient Supabase clock-skew retry.

## 18. Current production baseline

Baseline commit before this documentation update:

`8aa6b56f804e2ee6bbb238b5a6b0b81d7db21adb`

The production deployment for that baseline was verified as `READY` and active on `seguria.tech`, with no new runtime errors observed in the immediate post-deployment window.

This document is the reference for future continuation. When architecture, product scope, security behavior or operational workflow changes, update `DESIGN.md` in the same commit or immediately afterward.
