import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const params: any[] = [];
    let whereSql = '';

    if (search) {
      params.push(`%${search}%`);
      whereSql = `WHERE e.name ILIKE $1 OR e.position ILIKE $1 OR e.department ILIKE $1`;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM employees e ${whereSql}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM employees e ${whereSql} ORDER BY name ASC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return NextResponse.json({ employees: result.rows, total });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
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
