# HRMS Lite — HR Management System

A lightweight Human Resource Management System for tracking employees and attendance, built with Next.js and PostgreSQL (Neon).

---

## Project Overview

HRMS Lite provides a simple, clean interface to manage your workforce day-to-day. It includes:

- **Dashboard** — At-a-glance stats for total employees, present/absent/on-leave counts today, and attendance rate
- **Employee Management** — Add, search, paginate, and delete employee records
- **Attendance Tracking** — Mark and filter attendance by employee name and date range, with support for Present, Absent, and Leave statuses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via [Neon Serverless](https://neon.tech/) |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Icons | Lucide React |

---

## Running the Project Locally

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech/) account (free tier works fine) or any PostgreSQL database

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd hrms-lite
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
DATABASE_URL=your_neon_postgres_connection_string
```

You can find your connection string in the Neon dashboard under **Connection Details**.

### 4. Initialize the database

Start the dev server first, then hit the setup endpoint once to create the required tables:

```bash
npm run dev
```

Then in a separate terminal (or your browser):

```bash
curl -X POST http://localhost:3000/api/setup
```

Or navigate to `/setup` in the browser if a setup page is present. This creates the `employees` and `attendance` tables along with necessary indexes.

### 5. Open the app

```bash
http://localhost:3000
```

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/employees` | List or create employees |
| DELETE | `/api/employees/[id]` | Delete an employee |
| GET/POST | `/api/attendance` | List or mark attendance |
| PATCH/DELETE | `/api/attendance/[id]` | Update or delete an attendance record |
| GET/POST | `/api/setup` | Check or initialize the database |

---

## Assumptions & Limitations

- **Single organization** — There is no multi-tenancy or user authentication. Anyone with access to the URL can view and modify all data.
- **One record per employee per day** — The database enforces a unique constraint on `(employee_id, date)`, so attendance can only be marked once per employee per day. Re-marking is silently ignored.
- **Attendance update via API only** — The `PATCH /api/attendance/[id]` endpoint exists but there is no edit UI; deletion is the only action available in the interface.
- **No role-based access control** — All operations are open; suitable for small internal teams.