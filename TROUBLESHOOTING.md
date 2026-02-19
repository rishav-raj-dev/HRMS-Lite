# Troubleshooting Guide

## Common Issues

### 1. "Database not initialized" Error

**Problem:** You see alerts saying "Database not initialized. Please visit /setup to initialize the database."

**Solution:**
1. Visit the `/setup` page in your app
2. Click the "Initialize Database" button
3. The system will create tables and load sample data
4. You'll be redirected to the dashboard

### 2. 500 Internal Server Error when fetching data

**Problem:** The API returns 500 errors when you try to load employees or attendance.

**Solution:**
- This usually means the database tables don't exist yet
- Follow the setup process above
- Check that `DATABASE_URL` is set in your environment variables

### 3. "DATABASE_URL is not configured" Error

**Problem:** You see errors about DATABASE_URL not being set.

**Solution:**
1. Go to your project's Vars section (in the v0 sidebar)
2. Add a new environment variable:
   - Name: `DATABASE_URL`
   - Value: Your Neon PostgreSQL connection string
3. Refresh the page

### 4. Connection to database failed

**Problem:** Error messages about "connect ECONNREFUSED" or "FATAL: role does not exist"

**Solution:**
- Verify your `DATABASE_URL` is correct
- Check that your Neon database is active
- Try reconnecting the Neon integration

### 5. Hydration mismatch errors

**Problem:** React errors about "server rendered HTML didn't match the client"

**Solution:**
- This usually resolves after you initialize the database
- Clear your browser cache and refresh
- Ensure `DATABASE_URL` is set before loading the page

## How to Initialize the Database

### Option 1: Using the Setup Page (Recommended)

1. Start your app
2. Go to the home page - you should see a setup alert
3. Click "Go to Setup" or navigate to `/setup`
4. Click "Initialize Database" button
5. Wait for success message and automatic redirect

### Option 2: Direct Setup API Call

If the setup page doesn't work:

```bash
curl -X POST http://localhost:3000/api/setup
```

This should return:
```json
{
  "message": "Database initialized successfully",
  "tables_created": true
}
```

## Verifying Setup

After initializing, you can verify the database is set up:

1. Visit `/setup` page - it should show "Database is already initialized"
2. Try the Employees page - you should see 5 sample employees
3. Try the Attendance page - you should see today's attendance records

## Database Schema

The system creates two main tables:

### employees table
- `id` (Primary Key)
- `name` (Employee name)
- `email` (Unique email)
- `position` (Job title)
- `department` (Department name)
- `hire_date` (Hire date)
- `salary` (Annual salary)
- `created_at`, `updated_at` (Timestamps)

### attendance table
- `id` (Primary Key)
- `employee_id` (Foreign Key to employees)
- `date` (Attendance date)
- `status` (Present/Absent/Leave)
- `remarks` (Optional notes)
- `created_at`, `updated_at` (Timestamps)

## Still Having Issues?

1. **Check DATABASE_URL:**
   - Verify it's set in environment variables
   - Make sure it's a valid Neon connection string

2. **Clear Browser Cache:**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear browser cache

3. **Check Neon Status:**
   - Ensure your Neon project is active
   - Verify you have database permissions

4. **Review Logs:**
   - Check your server console for detailed error messages
   - Look for SQL errors that might indicate schema issues

5. **Try Reinitializing:**
   - If something went wrong, visit `/setup` again
   - The system handles re-initialization gracefully
