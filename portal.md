# Revive Repair Co. — Client Portal Specification

**Version:** 2.0  
**Date:** May 2026  
**Purpose:** Full product specification for a rebuild of the Revive Repair Co. client portal **without Clerk**. This document is the source of truth for a new development team implementing the portal from scratch.

---

## 1. Overview

The portal is a web application served at `/portal` (e.g., `reviverepairco.com/portal`). It gives three types of users — admins, technicians (crew), and clients — role-specific views into construction projects managed by Revive Repair Co.

Authentication uses a fully custom email/password + invite-token system. Clerk is not used anywhere in this build.

---

## 2. Tech Stack (Recommended)

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend API:** Express.js (separate service) or Next.js API routes
- **Database:** PostgreSQL with Drizzle ORM (schema defined in Section 6)
- **Auth:** Custom session-based auth — httpOnly cookie containing a signed JWT (see Section 3)
- **File Storage:** S3-compatible object storage (AWS S3 or Replit Object Storage)
- **AI:** OpenAI-compatible API (for task suggestions and SOW parsing)
- **Email:** SMTP (Zoho or similar) for invite and notification emails

---

## 3. Authentication (Custom — No Clerk)

### 3.1 How It Works

1. **Admin creates users** by entering their email, role, and (if CLIENT) which client company they belong to.
2. The system sends an **invite email** with a unique one-time token link (e.g., `/portal/accept-invite?token=abc123`).
3. The invited user clicks the link, sets their password, and their account is activated.
4. All subsequent logins are email + password.
5. Sessions are managed via **httpOnly cookie** containing a signed JWT (signed with `SESSION_SECRET`).
6. On each authenticated API request the server validates the token and loads the user profile from the database.

### 3.2 Token Lifecycle

- JWT expiry: 8 hours (sliding window — refresh on each request).
- Invite tokens: one-time use, expire after 72 hours. Stored as a bcrypt hash in the database.
- Password reset tokens: one-time use, expire after 1 hour. Same storage pattern.

### 3.3 Auth Endpoints

```
POST /api/v1/auth/invite
  Role: ADMIN only
  Body: { email, role, clientId?, displayName? }
  - Creates a pending user_profile row (status: INVITED)
  - Generates secure random token, stores bcrypt hash in user_profile
  - Sends invite email with link: /portal/accept-invite?token=<raw>

POST /api/v1/auth/accept-invite
  Public
  Body: { token, password, displayName? }
  - Validates token (hash compare, not expired)
  - Hashes password with bcrypt, clears invite token fields, sets status: ACTIVE
  - Creates session JWT cookie, returns user profile

POST /api/v1/auth/login
  Public
  Body: { email, password }
  - Validates credentials
  - Creates session JWT cookie, returns user profile

POST /api/v1/auth/logout
  Any authenticated user
  - Clears session cookie

GET /api/v1/auth/me
  Any authenticated user
  - Returns current user profile

POST /api/v1/auth/forgot-password
  Public
  Body: { email }
  - Generates reset token, sends email with reset link

POST /api/v1/auth/reset-password
  Public
  Body: { token, password }
  - Validates token, sets new bcrypt password hash
```

### 3.4 Route Protection (Frontend Middleware)

- `/portal/admin/*` → requires role `ADMIN`
- `/portal/client/*` → requires role `CLIENT`
- `/portal/crew/*` → requires role `CREW`
- Unauthenticated users are redirected to `/portal/sign-in`
- After login, redirect to role home:
  - ADMIN → `/portal/admin/dashboard`
  - CLIENT → `/portal/client/projects`
  - CREW → `/portal/crew/today`

---

## 4. Roles & Permissions

| Role | Description |
|------|-------------|
| `ADMIN` | Revive staff. Full access. Creates projects, manages users and clients, approves work, manages all data. |
| `CREW` | Field technician. Sees only assigned tasks. Clocks in/out, marks tasks done, uploads photos. |
| `CLIENT` | Homeowner or business owner. Sees only their own projects. Approves change orders, makes selections, signs off on completed work. |

---

## 5. Feature Specifications

---

### 5.1 Admin Features

#### 5.1.1 Dashboard — `/admin/dashboard`

KPI summary cards:

| Card | Value |
|------|-------|
| Active Projects | Count of projects with status `ACTIVE` or `PLANNED` |
| Awaiting PM Review | Count of main tasks with status `PM_REVIEW` |
| Awaiting Client Signoff | Count of main tasks with status `CLIENT_SIGNOFF` |
| Daily Tasks Today | Count of daily tasks scheduled for today (Eastern Time) |
| Overdue | Count of `NOT_STARTED` daily tasks with `scheduledDate` in the past |

Below KPIs: list of the 8 most recently updated projects (name + status badge), each linking to the project detail page.

---

#### 5.1.2 Projects — `/admin/projects`

List of all projects. Filterable by status, client, and name search.

Each row: project name, client name, status badge, last updated.

**Create Project** (`/admin/projects/new`):
- Client (required, dropdown)
- Project Name (required)
- Description
- Site Address (line1, city, state, zip — stored as JSON)
- Status (default: PLANNED)
- Project Manager (dropdown of ADMIN users)
- Start Date, Target End Date

---

#### 5.1.3 Project Detail — `/admin/projects/[id]`

Tabbed interface:

**Overview Tab**
- Project info: name, description, client, project manager, dates, site address, project status, invoice status.
- Inline editable — click any field to edit, save triggers `PATCH /api/v1/projects/:id`.

**Work Tab**

Hierarchical work breakdown structure. Admin builds the project plan here.

```
Project
  └── Work Type  (e.g. "Roofing", "Siding", "Gutters")
        └── Main Task  (e.g. "Install Ice and Water Shield")
              └── Daily Task  (e.g. "Apply membrane along east eave")
```

- Add / edit / delete Work Types (name, description, sort order).
- Add / edit / delete Main Tasks per work type:
  - Fields: name, description, estimated duration (days), start date, end date, dependency on another main task, materials list (array of { name, quantity, unit, cost }).
  - **AI Suggest** button → `POST /api/v1/ai/suggest-main-tasks` → returns AI-generated name/description/estimatedDays suggestions for this work type. Admin selects which to add.
- Add / edit / delete Daily Tasks per main task:
  - Fields: title, description, assigned crew member (dropdown), scheduled date.
  - **AI Suggest** button → `POST /api/v1/ai/suggest-daily-tasks` → returns AI-generated step suggestions. Admin selects which to add.
- Drag-to-reorder work types, main tasks, and daily tasks (updates `sort_order`).
- **SOW Import Panel**: Admin uploads a PDF or `.txt` Scope of Work document. System parses it (`POST /api/v1/ai/parse-sow`) and sends text to AI (`POST /api/v1/ai/build-from-sow`) which returns a full work type → main task → daily task hierarchy. Admin previews and imports with one click.

**Schedule Tab**
- Read-only chronological list of all main tasks.
- Shows sort order number, name, start/end dates, estimated duration, status badge.

**Approvals Tab**

Two sections:

1. **Pending Photos** — task photos with `pm_status = PENDING`.
   - Thumbnail grid with task context (task title, uploaded by, upload date).
   - Click → full-size modal with caption.
   - **Approve** → sets `pm_status = APPROVED`.
   - **Reject** → prompts for rejection reason → sets `pm_status = REJECTED`, stores reason.
   - Badge on tab showing pending count.

2. **Main Tasks in PM Review** — main tasks with status `PM_REVIEW`.
   - List with task name and work type.
   - **Advance to Client Signoff** → sets status to `CLIENT_SIGNOFF`.
   - **Return to In Progress** → sets status back to `IN_PROGRESS`.

**Documents Tab**
- List of project documents: filename, category, description, size, upload date.
- Upload button: file picker + category + description → `POST /api/v1/documents`.
- Download link per document.

**Activity Tab**
- Chronological audit trail of all actions on the project.
- Shows: action verb, entity type, timestamp.

---

#### 5.1.4 Change Orders — `/admin/projects/[id]/change-orders`

| Status Flow | |
|------------|--|
| `DRAFT` | Admin creates and edits freely |
| `SENT` | Admin sends to client for approval |
| `APPROVED` | Client approved |
| `REJECTED` | Client rejected |

- Create change order: title, description, reason, cost impact (dollar amount), schedule impact (JSON: `{ addedDays, description }`), affected main task IDs.
- **Send to Client** button advances DRAFT → SENT.
- Client approves or rejects via their portal view.
- Admin sees approval timestamp and approving user once approved.

---

#### 5.1.5 Daily Logs — `/admin/projects/[id]/daily-logs`

One log per project per calendar day. Unique constraint enforced at DB level.

Fields per log: date, weather (`{ conditions, tempF, notes }`), crew notes, delays, safety notes, photos (array of object keys).

Admin can view all logs, edit any log, and see associated photos.

---

#### 5.1.6 Selections — `/admin/projects/[id]/selections`

Material or design choices the client must make.

- Create selection: name (e.g., "Shingle Color"), options (array of `{ label, description, imageUrl? }`), optional deadline, optional link to work type or main task.
- Status: `PENDING` → `APPROVED` (client chose) / `REJECTED`.
- Admin sees the client's choice index once submitted.

---

#### 5.1.7 Punch Items — `/admin/projects/[id]/punch-items`

Defects or incomplete work items found during inspection that must be corrected before closeout.

| Status | Who can set |
|--------|-------------|
| `OPEN` | Created by admin |
| `IN_PROGRESS` | Assignee crew or admin |
| `RESOLVED` | Assignee crew or admin |
| `VERIFIED` | Admin only |

- Create: description, assigned crew member, optional work type, optional deadline.
- Photos can be attached (stored as JSON array of object storage keys on the record).

---

#### 5.1.8 Checklists — `/admin/checklists`

Reusable quality-control inspection checklists.

**Templates** (global):
- Create: name, list of items (`{ label, required: boolean }`).
- Edit / update template items.

**Instances** (applied to a work type or main task on a specific project):
- Admin applies a template to a work type or main task, creating a checklist instance.
- Each item tracks status: `PENDING`, `PASS`, `FAIL`.
- Crew marks items PASS or FAIL with optional notes.
- Instance status flips to `COMPLETE` when all required items are PASS.

---

#### 5.1.9 Time Tracking — `/admin/projects/[id]/time`

Admin read-only view of crew time entries for a project:
- Filterable by user and date range.
- Columns: user name, clock-in time, clock-out time, duration, linked daily task, notes.
- Total hours per user summary.

---

#### 5.1.10 Users — `/admin/users`

Full user management.

- List all users (filterable by role and client).
- Columns: display name, email, role, client (if CLIENT), status (INVITED / ACTIVE / ARCHIVED).
- **Invite User**: email, role, optional display name, optional client (required for CLIENT role).
- **Edit user**: role, client assignment, display name, email, phone.
- **Archive user**: soft delete — sets `archived_at`. Archived users cannot log in.

---

#### 5.1.11 Clients — `/admin/clients`

Client company management.

- List: company name, primary contact, email, phone, project count.
- **Create**: company name, primary contact name, email, phone, billing address, notes.
- **Client Detail** (`/admin/clients/[id]`): client info + list of their projects + list of their user accounts.
- **Edit** any field.
- **Archive**: soft delete.

---

### 5.2 Client Features

Clients see only data for their own company (`client_id` on their user profile).

#### 5.2.1 Projects — `/client/projects`

List of all projects for the client's company:
- Project name, status badge, start date, target end date.
- Click → project detail.

#### 5.2.2 Project Detail — `/client/projects/[id]`

Read-only progress view:
- Project name, description, status, target end date.
- For each **Work Type**: name, status.
  - For each **Main Task**: name, status, progress bar (% of daily tasks marked DONE).
  - If status is `CLIENT_SIGNOFF`: **"Sign Off →"** button appears.

#### 5.2.3 Main Task Signoff — `/client/main-tasks/[id]/signoff`

When a main task reaches `CLIENT_SIGNOFF`, client reviews and signs off:
- Shows main task name, description, approved photo gallery.
- Client types their full name as a digital signature.
- Submit → `POST /api/v1/main-tasks/:id/signoff` → sets `client_signed_at`, `client_signed_by_user_id`, `client_signature_name`, advances status to `COMPLETE`.
- Redirects back to project detail.

#### 5.2.4 Change Orders

Client sees change orders in `SENT` status for their projects:
- Title, description, reason, cost impact, schedule impact.
- **Approve** → `POST /api/v1/change-orders/:id/approve`
- **Reject** → prompts for optional reason → `POST /api/v1/change-orders/:id/reject`

#### 5.2.5 Selections

Client sees pending selections requiring a choice:
- Selection name, options (each with label, description, optional image), optional deadline.
- Client clicks their choice and confirms.
- Submit → `PATCH /api/v1/selections/:id` with `{ clientChoice: <index>, status: "APPROVED" }`.

---

### 5.3 Crew (Technician) Features

Crew see only projects they are assigned to (at least one `daily_task.assigned_to_user_id = user.id`).

All crew views are **mobile-first** — crew use phones on job sites. Large tap targets, fast load times.

#### 5.3.1 Today — `/crew/today`

Primary crew landing screen:
- Personalized greeting (Good morning / afternoon / evening, [name]).
- Today's date.
- All daily tasks assigned to this crew member for today (Eastern Time), grouped by main task.
- Each task card: title, scheduled date, status badge.
- Tap → task detail.
- "Full checklist" link per main task group → main task view.
- Empty state if no tasks today.

#### 5.3.2 Upcoming — `/crew/upcoming`

Crew member's upcoming daily tasks beyond today:
- Grouped by date.
- Same card format as Today.

#### 5.3.3 Main Task Checklist — `/crew/main-task/[id]`

Full list of all daily tasks within a main task:
- Main task name and description.
- Each daily task with status badge.
- Overall progress indicator (X of Y done).
- Tap a task → task detail.

#### 5.3.4 Daily Task Detail — `/crew/task/[id]`

The primary working screen:
- Task title, description, scheduled date, status badge.
- **Mark Complete** → sets status `DONE`, records `completed_at` and `completed_by_user_id`. Optionally prompts for notes and hours logged before confirming.
- **Add Photo** → device camera or file picker → `POST /api/v1/photos/daily-tasks/:id/photos` (multipart). Optional caption. Photo appears in list below with `PENDING` review badge.
- Photo gallery of previously uploaded photos for this task.
- Crew notes text field (saved on the daily task record).

#### 5.3.5 Clock In / Clock Out — `/crew/clock-in`

Simple time tracking screen:
- If no open time entry: **Clock In** button.
  - Select project (dropdown of assigned projects).
  - Optional: link to a specific daily task.
  - Optional notes.
  - Submit → `POST /api/v1/time-entries/clock-in`.
- If an open entry exists: shows project name, elapsed time, **Clock Out** button.
  - Submit → `POST /api/v1/time-entries/:id/clock-out`.

#### 5.3.6 Done Screen — `/crew/done`

Simple confirmation screen shown after marking a task complete or clocking out. Success message + link back to Today.

---

## 6. Database Schema

PostgreSQL. All PKs are UUIDs generated randomly. All timestamps use timezone.

### Enums

```sql
user_role:                    ADMIN, CREW, CLIENT
user_status:                  INVITED, ACTIVE, ARCHIVED
project_status:               PLANNED, ACTIVE, ON_HOLD, COMPLETE, CANCELLED
invoice_status:               NOT_INVOICED, INVOICED, PAID
work_type_status:             NOT_STARTED, IN_PROGRESS, COMPLETE
main_task_status:             NOT_STARTED, IN_PROGRESS, PM_REVIEW, CLIENT_SIGNOFF, COMPLETE
daily_task_status:            NOT_STARTED, DONE
photo_pm_status:              PENDING, APPROVED, REJECTED
document_category:            CONTRACT, PERMIT, RECEIPT, OTHER
comment_entity_type:          PROJECT, WORK_TYPE, MAIN_TASK, DAILY_TASK
punch_item_status:            OPEN, IN_PROGRESS, RESOLVED, VERIFIED
change_order_status:          DRAFT, SENT, APPROVED, REJECTED
selection_status:             PENDING, APPROVED, REJECTED
checklist_instance_status:    IN_PROGRESS, COMPLETE
checklist_item_status:        PENDING, PASS, FAIL
```

### `client`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| company_name | varchar(255) | Not null |
| primary_contact_name | varchar(255) | Not null |
| email | varchar(255) | Not null, unique |
| phone | varchar(50) | |
| billing_address | jsonb | `{ line1, city, state, zip }` |
| notes | text | |
| archived_at | timestamp tz | Null = active |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `user_profile`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| role | user_role | Default: CREW |
| status | user_status | Default: INVITED |
| client_id | uuid FK → client | Required when role = CLIENT |
| display_name | varchar(255) | Not null |
| email | varchar(255) | Not null, unique |
| phone | varchar(50) | |
| password_hash | varchar(255) | bcrypt; null until invite accepted |
| invite_token_hash | varchar(255) | bcrypt hash of raw one-time token |
| invite_token_expires_at | timestamp tz | |
| reset_token_hash | varchar(255) | bcrypt hash of raw reset token |
| reset_token_expires_at | timestamp tz | |
| archived_at | timestamp tz | Null = active |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

> No `clerk_user_id` — authentication is entirely custom.

### `project`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| client_id | uuid FK → client | Not null, restrict on delete |
| name | varchar(255) | Not null |
| description | text | |
| site_address | jsonb | `{ line1, city, state, zip }` |
| status | project_status | Default: PLANNED |
| project_manager_user_id | uuid FK → user_profile | Set null on delete |
| start_date | date | |
| target_end_date | date | |
| actual_end_date | date | |
| invoice_status | invoice_status | Default: NOT_INVOICED |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `work_type`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → project | Cascade delete |
| name | varchar(255) | |
| description | text | |
| sort_order | integer | Default: 0 |
| status | work_type_status | Default: NOT_STARTED |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `main_task`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| work_type_id | uuid FK → work_type | Cascade delete |
| name | varchar(255) | |
| description | text | |
| sort_order | integer | Default: 0 |
| status | main_task_status | Default: NOT_STARTED |
| start_date | date | |
| end_date | date | |
| estimated_duration_days | integer | |
| depends_on | uuid FK → main_task (self) | Optional predecessor task |
| materials | jsonb | Array of `{ name, quantity, unit, cost }` |
| pm_reviewed_at | timestamp tz | |
| pm_reviewed_by_user_id | uuid FK → user_profile | |
| client_signed_at | timestamp tz | |
| client_signed_by_user_id | uuid FK → user_profile | |
| client_signature_name | varchar(255) | Typed name as digital signature |
| completion_document_id | uuid FK → completion_document | |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `daily_task`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| main_task_id | uuid FK → main_task | Cascade delete |
| assigned_to_user_id | uuid FK → user_profile | The crew member |
| scheduled_date | date | |
| title | varchar(255) | |
| description | text | |
| status | daily_task_status | Default: NOT_STARTED |
| completed_at | timestamp tz | |
| completed_by_user_id | uuid FK → user_profile | |
| crew_notes | text | |
| hours_logged | decimal(5,2) | |
| sort_order | integer | Default: 0 |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `task_photo`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| daily_task_id | uuid FK → daily_task | Cascade delete |
| object_key | varchar(500) | Storage object path |
| original_filename | varchar(255) | |
| mime_type | varchar(100) | |
| size_bytes | integer | |
| uploaded_by_user_id | uuid FK → user_profile | |
| pm_status | photo_pm_status | Default: PENDING |
| pm_reject_reason | text | |
| caption | text | |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `project_document`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → project | Cascade delete |
| object_key | varchar(500) | |
| original_filename | varchar(255) | |
| mime_type | varchar(100) | |
| size_bytes | integer | |
| uploaded_by_user_id | uuid FK → user_profile | |
| category | document_category | Default: OTHER |
| description | text | |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `completion_document`

Auto-generated summary document compiled when a main task is signed off.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| main_task_id | uuid FK → main_task | Unique — one per main task |
| compiled_at | timestamp tz | |
| compiled_by_user_id | uuid FK → user_profile | |
| client_view_token | varchar(255) | Unique token for unauthenticated share link |
| payload | jsonb | Snapshot of task data, photos, signoff details |
| created_at | timestamp tz | |

### `comment`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| entity_type | comment_entity_type | What the comment is on |
| entity_id | uuid | ID of the entity |
| author_user_id | uuid FK → user_profile | |
| body | text | Not null |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `activity_log`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → project | Cascade delete |
| actor_user_id | uuid FK → user_profile | |
| verb | varchar(100) | e.g. `project_created`, `status_change:ACTIVE→COMPLETE` |
| entity_type | varchar(100) | e.g. `PROJECT`, `MAIN_TASK`, `TASK_PHOTO` |
| entity_id | uuid | |
| meta | jsonb | Additional context |
| created_at | timestamp tz | |

### `punch_item`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → project | Cascade delete |
| work_type_id | uuid FK → work_type | Optional |
| description | text | Not null |
| assignee_id | uuid FK → user_profile | Crew member responsible |
| photos | jsonb | Array of object storage keys |
| deadline | date | |
| status | punch_item_status | Default: OPEN |
| created_by_user_id | uuid FK → user_profile | Not null |
| verified_by_user_id | uuid FK → user_profile | Admin who verified |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `change_order`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → project | Cascade delete |
| title | varchar(255) | |
| description | text | |
| reason | text | |
| cost_impact | decimal(12,2) | Dollar amount |
| schedule_impact | jsonb | `{ addedDays, description }` |
| status | change_order_status | Default: DRAFT |
| affected_main_task_ids | uuid[] | Array of main task IDs |
| created_by_user_id | uuid FK → user_profile | Not null |
| client_approved_at | timestamp tz | |
| client_approved_by_user_id | uuid FK → user_profile | |
| rejection_reason | text | |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `daily_log`

One log per project per calendar day (unique constraint on `project_id, date`).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → project | Cascade delete |
| date | date | Not null |
| weather | jsonb | `{ conditions, tempF, notes }` |
| crew_notes | text | |
| delays | text | |
| safety_notes | text | |
| photos | jsonb | Array of object storage keys |
| created_by_user_id | uuid FK → user_profile | Not null |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `selection`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → project | Cascade delete |
| work_type_id | uuid FK → work_type | Optional |
| main_task_id | uuid FK → main_task | Optional |
| name | varchar(255) | e.g. "Shingle Color" |
| options | jsonb | Array of `{ label, description, imageUrl? }` |
| deadline | date | |
| client_choice | integer | Index into options array |
| status | selection_status | Default: PENDING |
| created_by_user_id | uuid FK → user_profile | Not null |
| created_at | timestamp tz | |
| updated_at | timestamp tz | |

### `time_entry`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → user_profile | Cascade delete |
| project_id | uuid FK → project | Cascade delete |
| daily_task_id | uuid FK → daily_task | Optional |
| clock_in | timestamp tz | Not null |
| clock_out | timestamp tz | Null = still clocked in |
| notes | text | |
| created_at | timestamp tz | |

### `checklist_template`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | varchar(255) | |
| items | jsonb | Array of `{ label: string, required: boolean }` |
| created_at | timestamp tz | |

### `checklist_instance`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| template_id | uuid FK → checklist_template | |
| work_type_id | uuid FK → work_type | Optional |
| main_task_id | uuid FK → main_task | Optional |
| status | checklist_instance_status | Default: IN_PROGRESS |
| created_at | timestamp tz | |

### `checklist_item_instance`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| instance_id | uuid FK → checklist_instance | Cascade delete |
| template_item_index | integer | Index into template.items array |
| status | checklist_item_status | Default: PENDING |
| completed_by_user_id | uuid FK → user_profile | |
| completed_at | timestamp tz | |
| notes | text | |

---

## 7. API Specification

Base path: `/api/v1`

All endpoints except those marked **Public** require a valid session cookie. Role enforcement is noted per endpoint group.

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/invite` | ADMIN | Invite a new user (sends email) |
| POST | `/auth/accept-invite` | Public | Set password, activate account |
| POST | `/auth/login` | Public | Email + password login |
| POST | `/auth/logout` | Any | Clear session |
| GET | `/auth/me` | Any | Current user profile |
| POST | `/auth/forgot-password` | Public | Send reset email |
| POST | `/auth/reset-password` | Public | Set new password via token |

### Projects

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/projects` | All | List (scoped by role) |
| POST | `/projects` | ADMIN | Create |
| GET | `/projects/:id` | All | Get with full work breakdown |
| PATCH | `/projects/:id` | ADMIN | Update |
| GET | `/projects/:id/activity` | All | Activity feed |

### Work Types

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/work-types` | ADMIN | Create |
| PATCH | `/work-types/:id` | ADMIN | Update |
| DELETE | `/work-types/:id` | ADMIN | Delete |

### Main Tasks

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/main-tasks` | All | List (filterable by workTypeId, status) |
| POST | `/main-tasks` | ADMIN | Create |
| GET | `/main-tasks/:id` | All | Get with daily tasks |
| PATCH | `/main-tasks/:id` | ADMIN | Update |
| DELETE | `/main-tasks/:id` | ADMIN | Delete |
| POST | `/main-tasks/:id/submit-review` | CREW/ADMIN | Advance to PM_REVIEW |
| POST | `/main-tasks/:id/approve-review` | ADMIN | Advance to CLIENT_SIGNOFF |
| POST | `/main-tasks/:id/return-review` | ADMIN | Return to IN_PROGRESS |
| POST | `/main-tasks/:id/signoff` | CLIENT | Client signs off → COMPLETE |

### Daily Tasks

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/daily-tasks` | All | List (filterable by date, mainTaskId, assignedToUserId, status) |
| POST | `/daily-tasks` | ADMIN | Create |
| GET | `/daily-tasks/:id` | All | Get single |
| PATCH | `/daily-tasks/:id` | ADMIN/assignee | Update (status, notes, hours, etc.) |
| DELETE | `/daily-tasks/:id` | ADMIN | Delete |

### Photos

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/photos?dailyTaskId=` | All (scoped) | List photos for a task |
| GET | `/photos?projectId=` | All (scoped) | List all photos for a project |
| POST | `/photos/daily-tasks/:id/photos` | ADMIN/assignee | Upload photo (multipart) |
| POST | `/photos/:id/approve` | ADMIN | Approve |
| POST | `/photos/:id/reject` | ADMIN | Reject with reason |
| DELETE | `/photos/:id` | ADMIN/uploader | Delete |
| GET | `/photos/:id/file` | All (scoped) | Proxy raw file bytes |
| GET | `/photos/:id/url` | All (scoped) | Get proxy URL |

### Documents

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/documents?projectId=` | All (scoped) | List |
| POST | `/documents` | ADMIN | Upload (multipart) |
| DELETE | `/documents/:id` | ADMIN | Delete |
| GET | `/documents/:id/file` | All (scoped) | Proxy file bytes |

### Users

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/users` | ADMIN | List all |
| GET | `/users/directory` | Any | Minimal list (id + displayName + role) for dropdowns |
| GET | `/users/:id` | ADMIN | Get single |
| PATCH | `/users/:id` | ADMIN | Update |
| DELETE | `/users/:id` | ADMIN | Archive (soft delete) |

### Clients

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/clients` | ADMIN | List all |
| POST | `/clients` | ADMIN | Create |
| GET | `/clients/:id` | ADMIN | Get with users and projects |
| PATCH | `/clients/:id` | ADMIN | Update |
| DELETE | `/clients/:id` | ADMIN | Archive |

### Change Orders

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/change-orders?projectId=` | ADMIN/CREW | List |
| POST | `/change-orders` | ADMIN | Create (DRAFT) |
| PATCH | `/change-orders/:id` | ADMIN | Update (while DRAFT) |
| POST | `/change-orders/:id/send` | ADMIN | Advance to SENT |
| POST | `/change-orders/:id/approve` | ADMIN/CLIENT | Approve |
| POST | `/change-orders/:id/reject` | ADMIN/CLIENT | Reject |

### Daily Logs

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/daily-logs?projectId=&from=&to=` | ADMIN/CREW | List |
| POST | `/daily-logs` | ADMIN/CREW | Create (one per project per day) |
| PATCH | `/daily-logs/:id` | ADMIN/CREW | Update |

### Selections

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/selections?projectId=` | ADMIN/CLIENT (scoped) | List |
| POST | `/selections` | ADMIN | Create |
| PATCH | `/selections/:id` | ADMIN/CLIENT | Update (client makes choice) |

### Punch Items

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/punch-items?projectId=` | ADMIN/CREW | List |
| POST | `/punch-items` | ADMIN | Create |
| PATCH | `/punch-items/:id` | ADMIN/assignee | Update status |

### Time Entries

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/time-entries?userId=&projectId=&from=&to=` | ADMIN/CREW | List |
| POST | `/time-entries/clock-in` | ADMIN/CREW | Clock in |
| POST | `/time-entries/:id/clock-out` | ADMIN/CREW | Clock out |

### Checklists

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/checklists/templates` | ADMIN/CREW | List templates |
| POST | `/checklists/templates` | ADMIN | Create template |
| PATCH | `/checklists/templates/:id` | ADMIN | Update template |
| GET | `/checklists/instances` | ADMIN/CREW | List instances |
| POST | `/checklists/instances` | ADMIN/CREW | Create instance from template |
| GET | `/checklists/instances/:id` | ADMIN/CREW | Get instance with items |
| POST | `/checklists/items/:id/complete` | ADMIN/CREW | Mark item PASS |
| POST | `/checklists/items/:id/fail` | ADMIN/CREW | Mark item FAIL |

### Comments

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/comments?entityType=&entityId=` | All | List |
| POST | `/comments` | Any | Add comment |
| DELETE | `/comments/:id` | ADMIN/author | Delete |

### AI

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/ai/suggest-main-tasks` | ADMIN | AI suggests main tasks for a work type |
| POST | `/ai/suggest-daily-tasks` | ADMIN | AI suggests daily steps for a main task |
| POST | `/ai/parse-sow` | ADMIN | Upload PDF/txt, returns extracted text |
| POST | `/ai/build-from-sow` | ADMIN | AI parses SOW text into full work breakdown |

---

## 8. Business Logic Rules

### Main Task Status Transitions

```
NOT_STARTED
    ↓ (at least one daily task marked DONE — auto-advance)
IN_PROGRESS
    ↓ (crew submits / admin advances)
PM_REVIEW
    ↓ admin approves          ↓ admin returns
CLIENT_SIGNOFF             IN_PROGRESS
    ↓ client signs off
COMPLETE
```

Auto-advance: when a daily task is marked DONE, if the parent main task is still `NOT_STARTED`, advance it to `IN_PROGRESS`.

### Photo Approval

- All crew-uploaded photos start as `PENDING`.
- Admin approves or rejects each photo.
- Rejected photos can be re-uploaded.
- A main task should only be submitted for PM review after all required photos are approved (enforce in UI, optional API enforcement).

### Client Data Scoping

- CLIENT users can only access projects where `project.client_id = user.client_id`.
- Never expose any other client's projects, change orders, selections, or documents.

### Crew Data Scoping

- CREW users can only see projects they have at least one assigned daily task on.
- CREW users can only upload photos to tasks they are assigned to.
- CREW users can update punch item status to `IN_PROGRESS` or `RESOLVED` only if they are the assignee.
- Only ADMIN can set punch item status to `VERIFIED`.

### Soft Deletion

Never hard-delete users or clients. Set `archived_at`. Archived records are hidden from all list endpoints by default. Admin can pass `?includeArchived=true` to see them.

### Activity Logging

Write an `activity_log` record for every significant action. Minimum required events:

- `project_created`
- `project_status_changed`
- `main_task_status_changed`
- `daily_task_completed`
- `photo_uploaded`
- `photo_approved`
- `photo_rejected`
- `photo_deleted`
- `change_order_created`
- `change_order_sent`
- `change_order_approved`
- `change_order_rejected`
- `client_signoff_completed`
- `document_uploaded`
- `document_deleted`
- `user_invited`
- `punch_item_created`
- `punch_item_verified`

---

## 9. Email Notifications

All emails sent via SMTP. Use HTML templates with Revive Repair Co. branding.

| Trigger | Recipient | Subject |
|---------|-----------|---------|
| User invited | Invited user | "You've been invited to the Revive Portal" |
| Password reset requested | User | "Reset your Revive Portal password" |
| Change order sent to client | CLIENT users on the project | "Action required: Review a change order for [Project Name]" |
| Main task ready for client signoff | CLIENT users on the project | "Action required: Sign off on completed work for [Project Name]" |
| Selection requires client choice | CLIENT users on the project | "Action required: Make a selection for [Project Name]" |
| Daily task assigned to crew member | CREW user | "New task assigned: [Task Title]" |

---

## 10. File Storage

Use S3-compatible object storage (AWS S3 or Replit Object Storage).

### Key Organization

```
photos/{client_id}/{project_id}/{daily_task_id}/{uuid}-{filename}
documents/{project_id}/{uuid}-{filename}
```

### Access Rules

- **Never serve files directly** from public storage URLs.
- All file access goes through authenticated API proxy endpoints:
  - `GET /api/v1/photos/:id/file`
  - `GET /api/v1/documents/:id/file`
- The API validates the user's permission before proxying bytes.
- Upload size limit: **20 MB** per file.
- Accepted photo types: JPEG, PNG, HEIC, WebP.
- Accepted document types: PDF, DOCX, DOC, TXT, XLSX.

---

## 11. AI Features

Requires an OpenAI API key (or compatible endpoint).

### Main Task Suggestions

When admin adds a work type, they can click **"AI Suggest Tasks"**. System sends:
- Project name and description
- Work type name and description

AI returns 3–8 suggested main task objects: `{ name, description, estimatedDays }`. Admin selects which to add.

### Daily Task Suggestions

When admin adds a main task, they can click **"AI Suggest Steps"**. System sends:
- Project and work type context
- Main task name and description
- Existing daily task titles (to avoid duplicates)

AI returns 4–10 daily step objects: `{ title, description }`. Admin selects which to add.

### SOW Import

1. Admin uploads a PDF or `.txt` Scope of Work to a project.
2. API extracts text (`POST /api/v1/ai/parse-sow`).
3. Text is sent to AI (`POST /api/v1/ai/build-from-sow`) which returns a structured plan:
   ```json
   {
     "workTypes": [
       {
         "name": "Roofing",
         "description": "...",
         "mainTasks": [
           {
             "name": "Remove Existing Shingles",
             "description": "...",
             "estimatedDays": 2,
             "dailyTasks": [
               { "title": "Strip east face", "description": "..." }
             ]
           }
         ]
       }
     ]
   }
   ```
4. Admin previews the proposed structure and clicks **Import** to create all records in one transaction.

**Important:** Prompt the AI to respond with valid JSON only — no markdown fences, no explanation text.

---

## 12. UI / UX Guidelines

### Color Palette

| Token | Value | Use |
|-------|-------|-----|
| Primary | `#0f172a` (dark navy) | Text, headings, backgrounds |
| Amber accent | `#f59e0b` | Buttons, highlights, active states |
| Surface | `#f8fafc` | Card backgrounds |
| Border | `#e2e8f0` | Dividers, card borders |
| Error | `#ef4444` | Errors, rejected states |
| Success | `#22c55e` | Complete, approved, done states |

### Typography

Inter or equivalent clean sans-serif. 14–16px body, 12px labels/badges.

### Navigation

**Admin:**
- Left sidebar: Dashboard, Projects, Clients, Users, Checklists.
- Top bar: user display name + logout.

**Crew:**
- Bottom navigation bar: Today, Upcoming, Clock In, Done.
- Top bar: greeting + date.

**Client:**
- Top navigation: Projects link + user menu with logout.

### Status Badges

| Status value | Color |
|-------------|-------|
| PLANNED, PENDING, NOT_STARTED | Gray |
| ACTIVE, IN_PROGRESS, SENT, INVITED | Blue |
| PM_REVIEW | Amber/Yellow |
| CLIENT_SIGNOFF | Purple/Violet |
| COMPLETE, APPROVED, DONE, PASS, VERIFIED, PAID, ACTIVE (user) | Green |
| CANCELLED, REJECTED, FAIL, ARCHIVED | Red |
| ON_HOLD | Orange |

### Responsive

- Admin: desktop-first, responsive to tablet.
- Crew: **mobile-first**. Large tap targets (min 44px), minimal chrome.
- Client: works well on both mobile and desktop.

---

## 13. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret for signing JWTs (min 32 chars, random) |
| `SMTP_HOST` | Yes | Email server hostname |
| `SMTP_PORT` | Yes | Email server port (typically 465 or 587) |
| `SMTP_USER` | Yes | SMTP username |
| `SMTP_PASSWORD` | Yes | SMTP password |
| `SMTP_FROM` | Yes | From address (`noreply@reviverepairco.com`) |
| `STORAGE_BUCKET` | Yes | Object storage bucket name |
| `STORAGE_ENDPOINT` | Yes | S3-compatible endpoint URL |
| `STORAGE_ACCESS_KEY_ID` | Yes | Storage access key |
| `STORAGE_SECRET_ACCESS_KEY` | Yes | Storage secret |
| `OPENAI_API_KEY` | Yes | OpenAI (or compatible) API key |
| `OPENAI_BASE_URL` | No | Override base URL for AI proxy |
| `PORTAL_PUBLIC_URL` | Yes | Full public URL of portal (`https://reviverepairco.com/portal`) |
| `PORT` | Yes | Server port |

---

## 14. Out of Scope

The following are **not** included in this spec:

- Payment processing or invoicing
- Native iOS / Android apps (crew interface is a mobile-responsive web app)
- Real-time push notifications (email only)
- Multi-tenant SaaS architecture
- Public-facing quote or estimate flow
- Accounting software integrations (QuickBooks, etc.)

---

## 15. Glossary

| Term | Definition |
|------|------------|
| **Client** | A homeowner or business that hired Revive. One client can have multiple projects. |
| **Project** | A specific construction job at a site address. Belongs to one client. |
| **Work Type** | A category of work within a project (e.g., Roofing, Siding, Gutters). |
| **Main Task** | A major phase or activity within a work type. Goes through PM review and client signoff. |
| **Daily Task** | A single-day, single-crew-member step within a main task. The atomic unit of work. |
| **Task Photo** | A photo uploaded by crew to document daily task completion. Requires admin approval. |
| **Change Order** | A formal document requesting client approval for scope or cost changes. |
| **Punch Item** | A defect or incomplete item found during inspection. Must be corrected before closeout. |
| **Selection** | A material or design choice the client must make (e.g., shingle color). |
| **Daily Log** | A written field record of conditions and progress for a given project and day. |
| **Checklist Template** | A reusable inspection checklist (e.g., "Pre-Roofing QC Inspection"). |
| **Checklist Instance** | A checklist template applied to a specific work type or main task on a project. |
| **SOW** | Scope of Work — a document describing the work to be performed on a project. |
| **PM** | Project Manager — an admin user assigned to oversee a specific project. |
| **Crew / Technician** | A field worker who performs the physical construction work. |
