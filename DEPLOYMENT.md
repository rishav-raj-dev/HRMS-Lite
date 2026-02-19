# HRMS Lite - Deployment Guide

## Prerequisites
- Neon Database Account (PostgreSQL serverless)
- Vercel Account
- GitHub Account (optional, for Git-based deployments)

## Step 1: Set Up Neon Database

1. Visit [Neon Console](https://console.neon.tech)
2. Create a new project
3. Create a new database
4. Copy your connection string (looks like: `postgresql://user:password@host/database`)
5. Keep this handy for the next steps

## Step 2: Deploy to Vercel (Database will be set up after)

### Option A: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository (or connect GitHub)
4. Add environment variable:
   - Name: `DATABASE_URL`
   - Value: Your Neon connection string
5. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

When prompted, add the DATABASE_URL environment variable.

## Step 3: Initialize Database

After deployment, the database still needs to be initialized:

1. Visit your deployed Vercel URL (e.g., `https://your-app.vercel.app`)
2. Click the "Go to Setup" button on the home page (if shown)
3. Or directly navigate to `/setup` page
4. Click "Initialize Database" button
5. The system will create tables and load sample data
6. You'll be redirected to the dashboard

## Step 4: Verify Deployment

1. After deployment, visit your Vercel URL
2. The app should load with the dashboard
3. Add test employees and attendance records
4. Verify all features work correctly

## Environment Variables

Required for deployment:
- `DATABASE_URL`: PostgreSQL connection string from Neon

## Database Schema

The app creates two main tables:

### employees
- id (Primary Key)
- name (VARCHAR)
- email (UNIQUE)
- position (VARCHAR)
- department (VARCHAR)
- hire_date (DATE)
- salary (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### attendance
- id (Primary Key)
- employee_id (Foreign Key to employees)
- date (DATE)
- status (Present/Absent/Leave)
- remarks (TEXT, optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE constraint on (employee_id, date)

## API Endpoints

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create new employee
- `DELETE /api/employees/[id]` - Delete employee

### Attendance
- `GET /api/attendance` - List attendance records (supports filters)
- `POST /api/attendance` - Create attendance record
- `PATCH /api/attendance/[id]` - Update attendance record
- `DELETE /api/attendance/[id]` - Delete attendance record

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correctly set in Vercel environment variables
- Check that your Neon database is active
- Ensure IP restrictions are not blocking Vercel

### Migration Failures
- Ensure DATABASE_URL is exported before running `pnpm migrate`
- Check that the database user has sufficient permissions
- Verify the database exists and is accessible

### Application Errors
- Check Vercel deployment logs for errors
- Ensure all dependencies are installed (`pnpm install`)
- Verify environment variables are set correctly

## Support

For issues or questions:
1. Check Vercel logs: `vercel logs`
2. Check Neon dashboard for database status
3. Review browser console for frontend errors

## Scaling Notes

The app uses serverless PostgreSQL (Neon) which:
- Scales automatically with demand
- Provides generous free tier for small deployments
- Can handle thousands of employees and attendance records
- Automatic backups and high availability
