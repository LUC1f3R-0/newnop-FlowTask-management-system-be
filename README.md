# FlowTask Backend

**Frontend Repository:** `[<link>](https://github.com/LUC1f3R-0/newnop-FlowTask-management-system-fe.git)`

FlowTask Backend is the API service for the FlowTask task management system. It handles authentication, OTP email verification, role-based authorization, task CRUD operations, task assignment, soft delete, admin-only recovery, user management, health checks, and scheduled database cleanup jobs.

This backend is built with **Node.js**, **NestJS**, **TypeScript**, **Prisma**, and **MySQL/MariaDB**.

---

## Project Purpose

This backend supports a role-based task management application where users can create, assign, track, update, and delete tasks. The system supports two roles:

- **USER**
- **ADMIN**

Normal users can only access their own visible tasks. Admin users can access all active tasks, user data, and deleted tasks.

The backend also includes scheduled cleanup jobs to permanently remove old unverified users and old soft-deleted tasks.

---

## Main Backend Responsibilities

The backend is responsible for:

- User registration
- Login
- Logout
- Refresh token handling
- Email OTP verification
- Resending email verification OTP
- Cookie-based JWT authentication
- API key protection
- Role-based access control
- Task creation
- Task listing
- Task details
- Task editing
- Task soft delete
- Admin deleted task listing
- Admin deleted task restore
- User listing for admins
- Assignable user listing
- Dashboard auth role message
- Health check
- Database health check
- SMTP email sending
- Scheduled cleanup cron jobs

---

## Important Links

### Frontend Repository

```txt
<link>
```

### Backend Base URL

Local example:

```txt
http://localhost:3000/api/v1
```

Production example:

```txt
https://your-backend-domain.com/api/v1
```

---

## Technology Stack

The backend uses:

- **Node.js** for runtime
- **NestJS** for backend structure
- **TypeScript** for type safety
- **Prisma** for database access
- **MySQL/MariaDB** as the database
- **Prisma MariaDB Adapter** for database connection
- **JWT** for access and refresh tokens
- **HTTP-only cookies** for token storage
- **bcrypt** for password hashing and OTP hashing
- **class-validator** for DTO validation
- **Joi** for environment variable validation
- **Nodemailer / SMTP service** for OTP email sending
- **@nestjs/schedule** for cron jobs
- **cookie-parser** for reading cookies
- **CORS configuration** for frontend-backend communication

---

## Project Folder Design

The backend follows a modular NestJS structure.

```txt
backend/
├── prisma/
│   ├── schema.prisma
│   ├── admin-seed.ts
│   └── migrations/
│
├── generated/
│   └── prisma/
│       ├── client.ts
│       ├── enums.ts
│       ├── models.ts
│       └── models/
│
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── app.config.ts
│   │   └── valication.config.ts
│   │
│   ├── common/
│   │   ├── cors/
│   │   │   └── cors.config.ts
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts
│   │   │   ├── response-message.decorator.ts
│   │   │   └── serialize.decorator.ts
│   │   ├── guards/
│   │   │   ├── access-token-cookie.guard.ts
│   │   │   └── api-key.guard.ts
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts
│   │   │   └── serialize.interceptor.ts
│   │   ├── pipes/
│   │   │   └── app-validation.pipe.ts
│   │   ├── responses/
│   │   │   └── api-response.ts
│   │   └── validators/
│   │       └── match.validator.ts
│   │
│   ├── infastructure/
│   │   ├── database/
│   │   │   ├── database.module.ts
│   │   │   ├── database-status.service.ts
│   │   │   └── prisma.service.ts
│   │   └── smtp/
│   │       ├── smtp.module.ts
│   │       ├── smtp.service.ts
│   │       ├── smtp-status.service.ts
│   │       └── mails/
│   │           └── verification-otp.mail.ts
│   │
│   └── modules/
│       ├── auth/
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   ├── auth.repository.ts
│       │   ├── auth.service.ts
│       │   └── dto/
│       │       └── auth.dto.ts
│       │
│       ├── users/
│       │   ├── users.controller.ts
│       │   ├── users.module.ts
│       │   ├── users.repository.ts
│       │   ├── users.service.ts
│       │   └── dto/
│       │       └── user.dto.ts
│       │
│       ├── tasks/
│       │   ├── tasks.controller.ts
│       │   ├── tasks.module.ts
│       │   ├── tasks.repository.ts
│       │   ├── tasks.service.ts
│       │   └── dto/
│       │       └── tasks.dto.ts
│       │
│       ├── dashboard/
│       │   ├── dashboard.controller.ts
│       │   ├── dashboard.module.ts
│       │   └── dashboard.service.ts
│       │
│       ├── cleanup/
│       │   ├── cleanup.module.ts
│       │   └── cleanup.service.ts
│       │
│       └── healthCheck/
│           ├── health.controller.ts
│           └── health.module.ts
│
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
└── README.md
```

---

## Architecture Design

The backend uses a clean module-based design.

### Controller Layer

Controllers handle incoming HTTP requests.

Examples:

- `AuthController`
- `TasksController`
- `UsersController`
- `DashboardController`
- `HealthController`

Controllers should not contain heavy business logic. They mainly receive request data and call service methods.

### Service Layer

Services contain business logic.

Examples:

- `AuthService`
- `TasksService`
- `UsersService`
- `DashboardService`
- `CleanupService`

Services handle rules such as:

- Login validation
- OTP verification
- Role checking
- User visibility rules
- Admin-only rules
- Cleanup logic
- Task permission checking

### Repository Layer

Repositories handle database queries through Prisma.

Examples:

- `AuthRepository`
- `TasksRepository`
- `UsersRepository`

Repositories are responsible for:

- Finding records
- Creating records
- Updating records
- Deleting records
- Selecting safe fields
- Returning formatted objects

### Infrastructure Layer

The infrastructure layer contains reusable system services.

Examples:

- `PrismaService`
- `DatabaseStatusService`
- `SmtpService`
- `SmtpStatusService`

---

## Global API Prefix

The backend sets this global prefix:

```txt
/api/v1
```

So every backend route starts with:

```txt
/api/v1
```

Example:

```txt
POST /api/v1/auth/login
GET /api/v1/tasks
GET /api/v1/health
```

---

## Authentication Design

The backend uses two tokens:

1. **Access Token**
   - Stored in an HTTP-only cookie named `accessToken`
   - Short lifetime
   - Used to access protected routes

2. **Refresh Token**
   - Stored in an HTTP-only cookie named `refreshToken`
   - Longer lifetime
   - Used to refresh the access token

The access token contains:

```txt
sub  = user uuid
role = user role
type = access
```

The refresh token contains:

```txt
sub  = user uuid
sid  = session uuid
type = refresh
```

Refresh sessions are stored in the `session` table.

---

## Security Design

The backend uses several security layers.

### API Key Guard

Most routes require an API key in the request header:

```txt
x-api-key: your_x_api_key
```

The API key is checked against:

```env
X_API_KEY=your_x_api_key
```

The health route is public and does not require the API key.

### Access Token Cookie Guard

Protected routes require a valid `accessToken` cookie.

Protected modules include:

- Tasks
- Users
- Dashboard

If the cookie is missing or invalid, the backend returns an unauthorized response.

### Role-Based Authorization

The backend supports two roles:

```txt
ADMIN
USER
```

Admin users can access admin-only features such as:

- All tasks
- Deleted tasks
- Restore deleted tasks
- All users

Normal users can only access tasks that they created or tasks assigned to them.

### Password and OTP Hashing

Passwords are hashed using bcrypt before saving to the database.

OTP codes are also hashed before saving. The raw OTP is only sent to the user's email.

---

## Database Design

The backend uses Prisma with MySQL/MariaDB.

### Main Tables

The system uses these main tables:

- `users`
- `session`
- `task`

### Users Table

The user table stores account information.

Important fields:

```txt
id
uuid
name
email
password
role
isEmailVerified
OTPHashed
OTPExpiredAt
createdAt
updatedAt
```

Purpose:

- Stores registered users
- Stores hashed password
- Stores role
- Stores email verification status
- Stores OTP hash and OTP expiry date

### Session Table

The session table stores refresh token sessions.

Important fields:

```txt
id
uuid
userId
refreshTokenHash
expiresAt
revokedAt
createdAt
updatedAt
```

Purpose:

- Stores refresh token sessions
- Supports logout
- Supports refresh token validation
- Allows sessions to be revoked or deleted

### Task Table

The task table stores task data.

Important fields:

```txt
id
uuid
title
description
priority
status
dueDate
deletedAt
createdById
assignedToId
createdAt
updatedAt
```

Purpose:

- Stores task information
- Links each task to a creator
- Optionally links each task to an assigned user
- Supports soft delete using `deletedAt`

### Enums

The backend uses enums for roles, task priority, and task status.

```txt
Role:
- ADMIN
- USER

TaskPriority:
- LOW
- MEDIUM
- HIGH

TaskStatus:
- TODO
- IN_PROGRESS
- COMPLETED
```

Frontend labels can show these as:

```txt
TODO        -> Open
IN_PROGRESS -> In Progress
COMPLETED   -> Done
```

---

## API Response Format

Most successful responses follow this format:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {},
  "meta": null,
  "errors": null
}
```

Validation errors follow this style:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "meta": null,
  "errors": [
    {
      "field": "email",
      "messages": ["Email must be a valid email address"]
    }
  ]
}
```

Paginated responses include pagination metadata.

Example:

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": {
    "tasks": []
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 1
  },
  "errors": null
}
```

Depending on the service return structure, task pagination may also be returned inside the `data` object.

---

## API Design

All routes below are prefixed with:

```txt
/api/v1
```

Most routes also require:

```txt
x-api-key: your_x_api_key
```

Protected routes require valid cookies.

---

## Health API

### GET `/health`

Checks whether the backend service and database are healthy.

Auth:

```txt
Public route
```

Response includes:

- Service status
- Database status
- SMTP status note
- Timestamp

---

## Auth API

### GET `/auth/me`

Returns the currently authenticated user.

Auth:

```txt
x-api-key required
accessToken cookie required
```

---

### POST `/auth/register`

Registers a new user and sends an email verification OTP.

Auth:

```txt
x-api-key required
```

Request body:

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```

Rules:

- Email must be valid.
- Password must have at least 8 characters.
- Password must include a letter.
- Password must include a number.
- Password must include a symbol.
- Confirm password must match password.
- New users are created as `USER` by default.
- Email is not verified until OTP verification succeeds.

---

### POST `/auth/login`

Logs in a verified user.

Auth:

```txt
x-api-key required
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

On success:

- Creates refresh session
- Sets access token cookie
- Sets refresh token cookie
- Returns public user data

If the user email is not verified:

- Backend sends a fresh OTP
- Backend rejects login with email verification required message

---

### POST `/auth/logout`

Logs out the current user.

Auth:

```txt
x-api-key required
refreshToken cookie used when available
```

Behavior:

- Deletes/revokes the matching refresh session
- Clears access token cookie
- Clears refresh token cookie

---

### POST `/auth/refresh`

Refreshes the access token using the refresh token cookie.

Auth:

```txt
x-api-key required
refreshToken cookie required
```

Behavior:

- Validates refresh token
- Validates active session
- Creates a new access token
- Updates access token cookie

---

### POST `/auth/verify-email`

Verifies user email using OTP.

Auth:

```txt
x-api-key required
```

Request body:

```json
{
  "email": "john@example.com",
  "otp": "12345"
}
```

Rules:

- OTP must be 5 digits.
- OTP must match the hashed OTP in the database.
- OTP must not be expired.
- After success, `isEmailVerified` becomes `true`.
- OTP fields are cleared after verification.

---

### POST `/auth/resend-verification-otp`

Sends a fresh OTP to an unverified user.

Auth:

```txt
x-api-key required
```

Request body:

```json
{
  "email": "john@example.com"
}
```

---

## Dashboard API

### GET `/dashboard`

Returns a simple role-based dashboard message.

Auth:

```txt
x-api-key required
accessToken cookie required
```

Behavior:

- If user is admin, returns admin message.
- If user is normal user, returns user message.

---

## Tasks API

### GET `/tasks`

Returns active tasks.

Auth:

```txt
x-api-key required
accessToken cookie required
```

Query parameters:

```txt
page
limit
search
status
priority
```

Example:

```txt
GET /api/v1/tasks?page=1&limit=10&search=design&status=TODO&priority=HIGH
```

Behavior:

- Admin users see all active tasks.
- Normal users only see tasks they created or tasks assigned to them.
- Only active tasks are returned.
- Active tasks are tasks where `deletedAt` is `null`.
- Supports pagination.
- Supports title/description search.
- Supports status filter.
- Supports priority filter.

---

### GET `/tasks/:id`

Returns one task by task UUID.

Auth:

```txt
x-api-key required
accessToken cookie required
```

Behavior:

- Admin can view active task details.
- Normal users can view task details only if they created it or it is assigned to them.

---

### POST `/tasks/create`

Creates a new task.

Auth:

```txt
x-api-key required
accessToken cookie required
```

Request body:

```json
{
  "title": "Create landing page",
  "description": "Build the landing page UI",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2026-07-10",
  "assignedToId": "assigned-user-uuid"
}
```

Rules:

- Title is required.
- Description is optional.
- Priority can be `LOW`, `MEDIUM`, or `HIGH`.
- Status can be `TODO`, `IN_PROGRESS`, or `COMPLETED`.
- Due date is optional.
- Assigned user is optional.
- Created task is linked to the logged-in user as creator.

---

### PATCH `/tasks/:id`

Updates a task.

Auth:

```txt
x-api-key required
accessToken cookie required
```

Request body example:

```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "MEDIUM",
  "status": "IN_PROGRESS",
  "dueDate": "2026-07-15",
  "assignedToId": "assigned-user-uuid"
}
```

Behavior:

- Admin can update tasks.
- Normal users can update tasks they created or tasks assigned to them.
- Admin can also edit deleted tasks from the admin deleted tasks page.

---

### DELETE `/tasks/:id`

Soft deletes a task.

Auth:

```txt
x-api-key required
accessToken cookie required
```

Behavior:

- The task is not immediately removed from the database.
- The backend sets `deletedAt` to the current date and time.
- The task disappears from normal task lists.
- Admin can still see it in the deleted tasks page.

---

### GET `/tasks/deleted`

Returns soft-deleted tasks.

Auth:

```txt
x-api-key required
accessToken cookie required
ADMIN only
```

Query parameters:

```txt
page
limit
search
status
priority
```

Behavior:

- Only admins can access this endpoint.
- Returns tasks where `deletedAt` is not null.
- Supports pagination.
- Supports search.
- Supports status filter.
- Supports priority filter.

---

### PATCH `/tasks/:id/restore`

Restores a soft-deleted task.

Auth:

```txt
x-api-key required
accessToken cookie required
ADMIN only
```

Behavior:

- Only admins can restore deleted tasks.
- Sets `deletedAt` back to `null`.
- The task becomes visible again in normal active task lists.

---

## Users API

### GET `/users`

Returns all users.

Auth:

```txt
x-api-key required
accessToken cookie required
ADMIN only
```

Query parameters:

```txt
search
```

Behavior:

- Only admin users can access all users.
- Supports search by name or email.
- Used by the admin users page.

---

### GET `/users/me`

Returns the logged-in user's profile data.

Auth:

```txt
x-api-key required
accessToken cookie required
```

---

### GET `/users/assignable`

Returns assignable users for task assignment.

Auth:

```txt
x-api-key required
accessToken cookie required
```

Query parameters:

```txt
search
```

Behavior:

- Returns users that can be assigned to tasks.
- Excludes the currently logged-in user when required.
- Used by task create/edit forms.

---

## Role and Permission Rules

### Normal User

A normal user can:

- Register
- Verify email
- Login
- View own profile
- View own dashboard
- Create tasks
- View tasks created by them
- View tasks assigned to them
- Edit visible tasks
- Soft delete visible tasks
- Assign tasks to available users

A normal user cannot:

- View all system tasks
- View all users
- View deleted tasks page
- Restore deleted tasks
- Access admin-only endpoints

### Admin User

An admin user can:

- Login as admin
- View admin dashboard
- View all active tasks
- View all users
- View deleted tasks
- Edit deleted tasks
- Restore deleted tasks
- Soft delete tasks
- Search and filter all tasks
- Manage task visibility through restore

---

## Soft Delete Design

The backend uses soft delete for tasks.

When a task is deleted:

```txt
deletedAt = current date and time
```

The task is not immediately removed from the database.

Active task lists only show:

```txt
deletedAt = null
```

Admin deleted task list shows:

```txt
deletedAt is not null
```

When admin restores a task:

```txt
deletedAt = null
```

After restore, the task appears again in the normal active tasks page.

---

## Scheduled Cron Jobs

The backend includes two separate scheduled cron jobs inside:

```txt
src/modules/cleanup/cleanup.service.ts
```

The cleanup module is registered in:

```txt
src/app.module.ts
```

The scheduler is enabled with:

```ts
ScheduleModule.forRoot()
```

---

### Cron Job 1: Delete Old Unverified Users

Method:

```txt
deleteOldUnverifiedUsers()
```

Schedule:

```txt
Every day at midnight
```

Purpose:

Permanently deletes users who registered but did not verify their email for more than one month.

Condition:

```txt
isEmailVerified = false
createdAt <= one month ago
```

Before deleting the user, the cron job also:

- Deletes sessions belonging to those users.
- Removes task assignments where those users are assigned.
- Deletes tasks created by those users because `createdById` is required.
- Permanently deletes the users.

Important:

This is a hard delete. The data is permanently removed from the database.

---

### Cron Job 2: Delete Old Soft-Deleted Tasks

Method:

```txt
deleteOldSoftDeletedTasks()
```

Schedule:

```txt
Every day at 12:30 AM
```

Purpose:

Permanently deletes tasks that have been soft deleted for more than one month.

Condition:

```txt
deletedAt is not null
deletedAt <= one month ago
```

Important:

This uses the `deletedAt` date that was inserted when the task was soft deleted.

This is a hard delete. The task is permanently removed from the database.

---

## Important Cron Job Notes

Cron jobs only run while the backend Node.js process is running.

If the backend is stopped, sleeping, or not running continuously, the cron jobs will not run.

For cPanel or VPS hosting:

- Make sure the Node app is running continuously.
- Restart the app after deployment.
- Check logs to confirm cleanup messages.

For serverless/Lambda-style deployment:

- Internal cron jobs may not run reliably because serverless functions do not stay alive.
- Use an external scheduler if deploying as serverless.

---

## Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=mysql://username:password@localhost:3306/flowtask
DB_SSL=false
DB_LOGGING=false

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

CORS_ORIGINS=http://localhost:5173

X_API_KEY=your_secret_api_key
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword@123
```

---

## Environment Variable Details

### `PORT`

Backend server port.

Default:

```txt
3000
```

### `NODE_ENV`

Use:

```txt
development
production
```

In production, cookies are configured with production-safe settings.

### `DATABASE_URL`

MySQL/MariaDB database connection URL.

Example:

```txt
mysql://root:password@localhost:3306/flowtask
```

### `DB_SSL`

Use SSL for database connection.

Example:

```txt
DB_SSL=true
```

### `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

Used to send OTP verification emails.

For Gmail, use an app password, not your normal Gmail password.

### `CORS_ORIGINS`

Allowed frontend URLs.

One frontend:

```txt
CORS_ORIGINS=http://localhost:5173
```

Multiple frontends:

```txt
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
```

### `X_API_KEY`

Secret API key required in request headers.

Frontend must send this as:

```txt
x-api-key
```

### `JWT_ACCESS_SECRET`

Secret used to sign and verify access tokens.

### `JWT_REFRESH_SECRET`

Secret used to sign and verify refresh tokens.

### `ADMIN_EMAIL` and `ADMIN_PASSWORD`

Used for the seeded admin account.

---

## How to Change the Admin Account

To change the admin login details, update the backend environment variables:

```env
ADMIN_EMAIL=newadmin@example.com
ADMIN_PASSWORD=NewStrongPassword@123
```

Then run the admin seed script.

Common command:

```bash
npx tsx prisma/admin-seed.ts
```

If `tsx` is not installed, install it first:

```bash
npm install -D tsx
npx tsx prisma/admin-seed.ts
```

After seeding, log in from the frontend using the new admin email and password.

### Important Admin Config Note

The current config file should map admin values like this:

```ts
email: process.env.ADMIN_EMAIL
password: process.env.ADMIN_PASSWORD
```

If the config file has email/password swapped or a typo like `passowrd`, correct it before relying on config-based admin seeding.

Recommended config:

```ts
export const adminConfig = registerAs('admin', () => ({
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
}));
```

Recommended validation defaults:

```ts
ADMIN_EMAIL: Joi.string().trim().default('admin@gmail.com'),
ADMIN_PASSWORD: Joi.string().trim().default('Password@Admin123'),
```

---

## Installation

Install backend dependencies:

```bash
npm install
```

Install schedule package if it is not already installed:

```bash
npm install @nestjs/schedule
```

Install Nest CLI for building:

```bash
npm install -D @nestjs/cli
```

Generate Prisma client:

```bash
npx prisma generate
```

Run database migrations locally:

```bash
npx prisma migrate dev
```

For production deployment, run:

```bash
npx prisma migrate deploy
```

Build the backend:

```bash
npm run build
```

Start development server:

```bash
npm run start:dev
```

Start production server:

```bash
npm run start:prod
```

---

## cPanel / Hosting Build Note

If the server shows this error:

```txt
sh: nest: command not found
```

It means the Nest CLI binary is not available on the server.

Fix option 1:

```bash
npm install --save-dev @nestjs/cli --include=dev
npm run build
```

Fix option 2:

```bash
npx --yes -p @nestjs/cli nest build
```

You can also change the build script in `package.json`:

```json
{
  "scripts": {
    "build": "npx --yes -p @nestjs/cli nest build"
  }
}
```

Do not run `npm audit fix --force` during deployment unless you are ready to handle breaking dependency upgrades.

---

## Development Run Order

Recommended local run order:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx tsx prisma/admin-seed.ts
npm run start:dev
```

Then start the frontend separately.

---

## Production Deployment Checklist

Before deployment:

- Set production `.env` values.
- Set correct `DATABASE_URL`.
- Set correct `CORS_ORIGINS`.
- Set strong `X_API_KEY`.
- Set strong `JWT_ACCESS_SECRET`.
- Set strong `JWT_REFRESH_SECRET`.
- Set SMTP credentials.
- Run Prisma migrations.
- Generate Prisma client.
- Build the backend.
- Start/restart the Node.js app.
- Confirm `/api/v1/health` works.
- Confirm login works.
- Confirm cron jobs are registered in logs.

---

## CORS Design

The backend reads allowed frontend origins from:

```env
CORS_ORIGINS
```

Allowed methods:

```txt
GET
POST
PUT
PATCH
DELETE
OPTIONS
```

Allowed headers include:

```txt
Content-Type
Accept
Authorization
X-Request-Id
Idempotency-Key
x-api-key
```

Credentials are enabled so cookies can be sent between frontend and backend.

---

## Cookie Design

The backend sets authentication cookies:

```txt
accessToken
refreshToken
```

Access token cookie:

- Path: `/`
- HTTP-only
- Short expiry

Refresh token cookie:

- Path: `/api/v1/auth`
- HTTP-only
- Longer expiry

In production, cookies use secure production settings.

---

## Validation Design

The backend uses a global validation pipe.

Validation behavior:

- Removes non-whitelisted fields.
- Rejects unknown fields.
- Transforms incoming values where possible.
- Returns formatted validation errors.

Example validation error format:

```json
{
  "field": "password",
  "messages": ["Password must be at least 8 characters"]
}
```

---

## DTO Design

DTO files define request validation rules.

### Register DTO

Fields:

```txt
fullName
email
password
confirmPassword
```

Rules:

- Full name required
- Email required and valid
- Password required
- Confirm password required
- Password and confirm password must match

### Login DTO

Fields:

```txt
email
password
```

### Verify DTO

Fields:

```txt
email
otp
```

OTP must be exactly 5 digits.

### Task DTO

Create/update task fields:

```txt
title
description
priority
status
dueDate
assignedToId
```

---

## Task Workflow

Task statuses:

```txt
TODO
IN_PROGRESS
COMPLETED
```

User-friendly labels:

```txt
TODO        -> Open
IN_PROGRESS -> In Progress
COMPLETED   -> Done
```

Task priorities:

```txt
LOW
MEDIUM
HIGH
```

Task relationship:

```txt
createdById  -> required creator
assignedToId -> optional assigned user
```

---

## Search and Filtering

Task list supports:

```txt
search
status
priority
page
limit
```

Search checks:

- Task title
- Task description

Admin users search across all active tasks.

Normal users search only their visible tasks.

Deleted task search is admin-only.

---

## Pagination

Task list endpoints support pagination.

Query example:

```txt
GET /api/v1/tasks?page=1&limit=10
```

Pagination response contains:

```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3
}
```

---

## Health Check

Health route:

```txt
GET /api/v1/health
```

This checks database connection using:

```txt
SELECT 1
```

If database is connected, the service returns healthy status.

---

## SMTP / Email Verification

The backend sends OTP email for:

- New registration
- Login attempt before email verification
- Resend OTP request

OTP settings:

```txt
OTP length: 5 digits
OTP expiry: 10 minutes
OTP storage: hashed in database
```

After email verification:

- `isEmailVerified` becomes true
- OTP hash is cleared
- OTP expiry is cleared

---

## Access Token and Refresh Token Lifetimes

Current token constants:

```txt
Access token: 15 minutes
Refresh token: 7 days
Email OTP: 10 minutes
```

---

## What Was Specially Added

The following important features were added to improve the system:

### 1. Deleted Tasks API

Admin-only deleted task API was added.

Endpoints:

```txt
GET /tasks/deleted
PATCH /tasks/:id/restore
```

Purpose:

- Admin can view soft-deleted tasks.
- Admin can edit deleted tasks.
- Admin can restore deleted tasks.

### 2. Task Details API

Task details endpoint was added.

Endpoint:

```txt
GET /tasks/:id
```

Purpose:

- Frontend task detail and edit pages can fetch a single task.

### 3. Backend Task Search

Task list supports search by title and description.

Query:

```txt
search
```

### 4. Backend Pagination

Task list supports:

```txt
page
limit
```

### 5. Admin Users API

Admin can fetch users.

Endpoint:

```txt
GET /users
```

### 6. Cleanup Cron Jobs

Two scheduled cleanup jobs were added.

Cron 1:

```txt
Delete users who are not email verified for more than one month.
```

Cron 2:

```txt
Delete tasks that have been soft deleted for more than one month.
```

### 7. Admin Restore Flow

Admin can restore a soft-deleted task by setting:

```txt
deletedAt = null
```

---

## Example Request Headers

For protected requests, send:

```txt
x-api-key: your_x_api_key
Cookie: accessToken=...
```

Axios frontend should use:

```txt
withCredentials: true
```

---

## Example API Testing With cURL

Health check:

```bash
curl -i http://localhost:3000/api/v1/health
```

Login:

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_x_api_key" \
  -d '{"email":"admin@example.com","password":"Password@Admin123"}'
```

Get tasks:

```bash
curl -i http://localhost:3000/api/v1/tasks?page=1\&limit=10 \
  -H "x-api-key: your_x_api_key" \
  --cookie "accessToken=your_access_token"
```

Get deleted tasks:

```bash
curl -i http://localhost:3000/api/v1/tasks/deleted?page=1\&limit=10 \
  -H "x-api-key: your_x_api_key" \
  --cookie "accessToken=your_admin_access_token"
```

Restore deleted task:

```bash
curl -i -X PATCH http://localhost:3000/api/v1/tasks/task-uuid/restore \
  -H "x-api-key: your_x_api_key" \
  --cookie "accessToken=your_admin_access_token"
```

---

## Troubleshooting

### `nest: command not found`

Install Nest CLI or use npx:

```bash
npm install -D @nestjs/cli
npx --yes -p @nestjs/cli nest build
```

### Prisma client missing

Run:

```bash
npx prisma generate
```

### Database connection failed

Check:

```env
DATABASE_URL
DB_SSL
```

Also check whether the database user, password, host, and database name are correct.

### CORS error

Check:

```env
CORS_ORIGINS
```

Make sure the frontend URL is included exactly.

Example:

```env
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
```

### Login works locally but not production

Check:

- `NODE_ENV`
- cookie secure settings
- HTTPS availability
- CORS credentials
- frontend `withCredentials`
- correct API base URL

### Email OTP not received

Check:

```env
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
```

For Gmail, use an app password.

### Deleted tasks page returns 404

Make sure backend has these routes:

```txt
GET /api/v1/tasks/deleted
PATCH /api/v1/tasks/:id/restore
```

Also restart the backend after deployment.

### Deleted tasks page returns 403

The logged-in user is not admin.

Use an admin account.

---

## Important Security Notes

- Do not commit `.env` to GitHub.
- Do not expose `X_API_KEY`.
- Use strong JWT secrets.
- Use strong admin password.
- Use HTTPS in production.
- Rotate secrets if they are leaked.
- Do not share production cookies.
- Keep SMTP app password private.
- Avoid running destructive seed scripts on production unless you know what they do.

---

## README Summary

This backend provides the complete API for the FlowTask frontend. It includes authentication, authorization, OTP email verification, task CRUD, user management, admin task recovery, soft delete, search, filtering, pagination, database health checks, and scheduled cleanup cron jobs.

The most important admin-only backend features are:

- View all tasks
- View all users
- View deleted tasks
- Edit deleted tasks
- Restore deleted tasks
- Permanently clean old deleted tasks through cron

The most important cleanup features are:

- Delete users who remain unverified for more than one month
- Delete tasks that remain soft deleted for more than one month
