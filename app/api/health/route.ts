import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Check if tables already exist
    const checkTables = await query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'employees')`
    );

    if (checkTables.rows[0].exists) {
      return NextResponse.json(
        { message: 'Database already initialized' },
        { status: 200 }
      );
    }

    // Create employees table
    await query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        position VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        hire_date DATE NOT NULL,
        salary NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create attendance table
    await query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('Present', 'Absent', 'Leave')),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, date)
      )
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email)`);

    return NextResponse.json(
      { message: 'Database initialized successfully', tables_created: true },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const checkTables = await query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'employees')`
    );

    return NextResponse.json({
      health: checkTables.rows[0].exists,
      message: checkTables.rows[0].exists ? 'Database is initialized' : 'Database needs initialization.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { health: false, error: 'Could not check database status' },
      { status: 500 }
    );
  }
}
