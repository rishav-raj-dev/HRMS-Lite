# HRMS Lite - Human Resource Management System

A modern, full-stack HR management system built with Next.js 16, React 19, and PostgreSQL. Manage employees and track attendance with ease.

## Features

- **Employee Management**
  - Add, view, and delete employees
  - Track employee details (name, email, position, department, hire date, salary)
  - Real-time employee list updates

- **Attendance Management**
  - Mark attendance (Present, Absent, Leave)
  - Filter attendance by employee and date range
  - Add remarks to attendance records
  - Prevent duplicate attendance entries

- **Dashboard**
  - Real-time statistics
  - Total employees count
  - Today's attendance summary (Present, Absent, Leave)
  - Attendance rate calculation

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19.2** - Latest React with built-in optimizations
- **shadcn/ui** - High-quality UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - Serverless functions
- **@neondatabase/serverless** - PostgreSQL client for serverless
- **TypeScript** - Type safety

### Database
- **Neon PostgreSQL** - Serverless PostgreSQL with auto-scaling

## Getting Started

### Prerequisites
- Node.js 18+ or pnpm
- Neon account (free tier available)
- Vercel account (optional, for deployment)

### Installation

1. Clone or download the project
2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local and add your Neon DATABASE_URL
```

4. Run database migration:
```bash
pnpm migrate
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── employees/        # Employee API routes
│   │   └── attendance/       # Attendance API routes
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main application page
│   └── globals.css          # Global styles
├── components/
│   ├── dashboard/           # Dashboard components
│   ├── employees/           # Employee management components
│   ├── attendance/          # Attendance management components
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── db.ts               # Database connection
│   └── utils.ts            # Utility functions
├── scripts/
│   ├── init-db.sql         # Database schema
│   └── migrate.js          # Migration runner
└── public/                  # Static assets
```

## API Endpoints

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create new employee
- `DELETE /api/employees/[id]` - Delete employee

### Attendance
- `GET /api/attendance?employeeId=&fromDate=&toDate=` - List attendance records
- `POST /api/attendance` - Mark attendance
- `PATCH /api/attendance/[id]` - Update attendance record
- `DELETE /api/attendance/[id]` - Delete attendance record

## Database Schema

### employees
```sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  hire_date DATE NOT NULL,
  salary DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### attendance
```sql
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, date)
);
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variable: `DATABASE_URL`
4. Click Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Features Walkthrough

### Dashboard
- View total employee count
- See today's attendance summary
- Check attendance rate percentage

### Employees Page
- View all employees in a clean list
- Add new employees with all required details
- Delete employees (with confirmation)
- Real-time list updates

### Attendance Page
- Mark attendance for employees
- Filter by employee, date range
- View attendance history with status indicators
- Update attendance records
- Delete records if needed

## Sample Data

The database migration includes sample data with 5 employees and their attendance records for testing purposes.

## Performance

The app is optimized for performance:
- Serverless backend scales automatically
- PostgreSQL queries are optimized with indexes
- Frontend uses React 19's built-in optimizations
- CDN-ready deployment on Vercel

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

Feel free to fork and submit pull requests for improvements.

## License

MIT License - feel free to use this project for personal or commercial use.

## Support

For issues or questions:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review the database schema
3. Check browser console for errors
4. Review Vercel logs if deployed

## Future Enhancements

- User authentication and role-based access
- Leave management system
- Payroll integration
- Report generation (PDF exports)
- Email notifications
- Bulk attendance import
- Advanced analytics and reporting
