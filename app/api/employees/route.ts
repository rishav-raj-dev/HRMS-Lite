import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const result = await query(
      'SELECT id, name, email, position, department, hire_date, salary FROM employees ORDER BY name ASC'
    );
    return NextResponse.json({ employees: result.rows });
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    
    // Check if it's a "table doesn't exist" error
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: '' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, position, department, hire_date, salary } = body;

    if (!name || !email || !position || !department || !hire_date || !salary) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO employees (name, email, position, department, hire_date, salary)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, position, department, hire_date, salary`,
      [name, email, position, department, hire_date, salary]
    );

    return NextResponse.json({ employee: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
