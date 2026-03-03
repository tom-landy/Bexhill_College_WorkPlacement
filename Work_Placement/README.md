# College Placement Platform

Production-oriented internal web app for FE/college careers and work placement operations. Built for daily staff, learner, and employer use with auditable workflows, strict access controls, and evidence exports.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- NextAuth (Credentials provider for all roles)
- Prisma ORM
- PostgreSQL (Render Postgres in production, Docker Compose locally)
- Zod validation
- Nodemailer SMTP with dev logging fallback
- Private S3-compatible object storage with signed URLs

## Core reliability and compliance features

- Server-side RBAC checks on protected pages and API routes
- Employer data isolation by `EmployerAccountLink -> EmployerContact -> Placement.supervisorContactId`
- Immutable `AuditEvent` records for critical actions
- Explicit status history tables:
  - `PlacementStatusHistory`
  - `PlacementLogStatusHistory`
  - `ProspectStatusHistory`
- Password security:
  - Argon2 hashing
  - Minimum 12-character password policy
  - Forgot/reset for all users with hashed, expiring, single-use tokens
  - Rate limiting and cooldown for login/reset flows
- Export endpoints for evidence portability (`/api/exports?type=...&format=csv|json`)
- Health check endpoint for Render: `/health` (includes DB connectivity check)

## Local setup

1. Copy env file.

```bash
cp .env.example .env
```

2. Start local Postgres.

```bash
docker compose up -d
```

3. Install and prepare DB.

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
```

4. Run app.

```bash
npm run dev
```

## Demo accounts

Admin account:
- User: `Admin` (or `admin@college.local`)
- Password: `Alpha1234*`

Other seeded users password: `CollegePassphrase2026`

- Careers Lead: `careers@college.local`
- Placement Officer: `placement@college.local`
- Tutor: `tutor@college.local`
- Employer Supervisor: `employer@college.local`
- Students: `student1@college.local` to `student8@college.local`

## Student import and placement assignment

- Student CSV/Excel import is available on `/students` for Admin users.
- Supported upload formats: `.csv`, `.xlsx`, `.xls`
- Required columns: `name`, `email`, `yearGroup`, `tutorGroup`
- Optional columns: `tutorEmail`, `pp`, `send`
- Student-to-employer assignment is available on `/placements` for Admin and Placement Officer users.

## Seed data included

- 1 Admin, 1 Careers Lead, 1 Placement Officer, 1 Tutor, 8 Students, 1 Employer Supervisor
- 5 Employers with contacts
- 6 Opportunities across pipeline stages
- 5 Placements with mixed statuses (2-3 linked to employer supervisor)
- Compliance checklists for placements
- 12 placement logs with mixed tutor and employer statuses
- 10 careers activities with Gatsby tags and mixed completion records
- 3 prospective employers (converted, awaiting outreach, rejected)

## Render deployment

### Service architecture

- Render Web Service for Next.js app
- Render Postgres (paid plan recommended for operational reliability)
- Render Cron Job for nightly operational tasks

`render.yaml` is included for Blueprint-based provisioning.

### Build and start commands

- Build command: `npm install && npm run prisma:generate && npm run build`
- Predeploy command: `npm run prisma:deploy`
- Start command: `npm run start`
- Health check path: `/health`

### Required environment variables

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `APP_BASE_URL`
- `EMAIL_DEV_MODE`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`

### Evidence upload storage on Render

Do not store evidence uploads on local filesystem in Render web services. Render web service disks are ephemeral by default. Use private S3-compatible object storage and store only object keys/metadata in Postgres.

## Render Cron Job plan (nightly)

Configure cron job (or use included `render.yaml` cron service):

- Schedule: nightly at 01:00 (`0 1 * * *`)
- Command: `npm run cron:nightly`
- Tasks:
  - integrity counts (users, placements, logs, audit rows)
  - write nightly system `AuditEvent`
  - optional future extension: scheduled export bundles to object storage

## Backing up data on Render

### Logical backups

For Render Postgres, create logical backups from Render dashboard and export/download them for long-term retention.

Important limits:

- Logical backups created in Render are retained for 7 days after creation
- Implement long-term off-platform retention (for example secure object storage or institutional backup store)

### Plan guidance

Avoid free Postgres plans for operational use. Free plans have durability/retention limitations and can expire, which is unsuitable for funding evidence requirements.

## Exports for evidence and portability

Use `/api/exports?type=<dataset>&format=csv`.

Supported `type` values:

- `users` (staff roles only)
- `students`
- `employers`
- `employer_contacts`
- `interactions`
- `opportunities`
- `placements`
- `compliance`
- `placement_logs`
- `careers_activities`
- `activity_completions`
- `prospects`
- `outreach_emails`
- `audit_events` (admin only)

Exports include stable IDs and timestamps for reconstruction.

## Admin runbook

### Invite employer supervisor

1. Create employer contact.
2. Generate invite token (hashed in DB; single use; expiry applied).
3. Send invite link `/invites/[token]`.
4. Employer signs in and consumes invite token.

### Reset password

1. User requests reset via `/forgot-password`.
2. System issues single-use token (hashed, 1-hour expiry) and sends email.
3. User completes reset on `/reset-password/[token]`.
4. Auth and audit events are written.

### Deactivate/reactivate user

Use admin user management flow in `/admin/users`.

### Export evidence pack

1. Open `/exports`.
2. Download required CSV datasets.
3. Archive in secure institutional storage with date stamp (`dd/mm/yyyy`).

## Manual test checklist

- Login success/failure and cooldown behaviour after repeated failures
- Forgot password token expires and cannot be reused
- Invite token expires and cannot be reused
- Employer supervisor cannot access unassigned placements
- Student cannot edit submitted prospect
- Placement log tutor approval and employer verification state transitions recorded in history and audit
- Evidence uploads only use signed URLs (no local disk writes)
- Export files generate with expected headers and non-empty rows
- `/health` returns `200` and DB status when database is available

## Automated tests

Run:

```bash
npm test
```

Current automated coverage includes:

- Employer isolation logic
- Student edit restriction for submitted prospects
- Invite/reset token expiry and single-use logic
- CSV export headers and non-empty rows

## Known limitations and next steps

- Several required workflow pages are scaffolded but still need richer UI and full server action implementations for all status transitions.
- Add optional error monitoring integration (e.g. Sentry) for alerting.
- Add integration tests against a real Postgres test database for full route-level verification.
- Add encrypted scheduled export packaging and long-term retention automation.
