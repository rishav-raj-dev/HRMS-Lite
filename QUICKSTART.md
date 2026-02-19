# HRMS Lite - Quick Start Guide

## What's the 500 Error About?

The 500 error you're seeing is because the `DATABASE_URL` environment variable is not set. Here's how to fix it:

## Fix in 3 Steps:

### 1. Set DATABASE_URL Environment Variable

In the v0 sidebar, go to **Vars** section and add:
- **Key**: `DATABASE_URL`
- **Value**: Your Neon PostgreSQL connection string

Get your connection string from [Neon Console](https://console.neon.tech):
- Go to your project
- Copy the connection string (format: `postgresql://user:password@host/database?sslmode=require`)

### 2. Refresh the App

After adding the environment variable, refresh your browser. The app should now load without errors.

### 3. Initialize Database

The first time you visit the app:
- You'll see a setup prompt or can go directly to `/setup`
- Click "Initialize Database"
- This creates tables and loads sample data
- You'll see a success message and be redirected to the dashboard

## What Happens After Setup?

Once the database is initialized, you can:

1. **View Dashboard**: See total employees, today's attendance, and statistics
2. **Manage Employees**: 
   - Add new employees with name, email, position, department, hire date, salary
   - View all employees
   - Delete employees
3. **Track Attendance**:
   - Mark attendance (Present/Absent/Leave)
   - View attendance history
   - Filter by date range
   - Edit attendance records

## Deployment to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Add `DATABASE_URL` in Vercel project settings
4. Deploy
5. Visit the URL and run the setup (`/setup` page)

## API Endpoints

All API endpoints are available at:
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `DELETE /api/employees/[id]` - Delete employee
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Create attendance
- `PATCH /api/attendance/[id]` - Update attendance
- `GET /api/setup` - Check database status
- `POST /api/setup` - Initialize database

## Troubleshooting

**Still getting 500 errors?**
- Check that `DATABASE_URL` is set in Vars
- Verify the connection string is correct
- Check browser console for detailed error messages

**Setup page not working?**
- Check that your Neon database is active
- Verify your connection string has the correct credentials
- Check Vercel/app logs for detailed errors

**Tables won't create?**
- Ensure the database user has CREATE TABLE permissions
- Check that your Neon project is in good standing
- Try refreshing the setup page

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (serverless)
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Native SQL (no Prisma) for lightweight performance

## Need Help?

Check the detailed `DEPLOYMENT.md` guide for more information or visit [Vercel Docs](https://vercel.com/docs).
