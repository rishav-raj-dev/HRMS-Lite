import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const search = searchParams.get('search'); // 👈 was missing, employeeId removed

    // Used by AttendanceForm to pre-populate existing records
    if (date) {
      const result = await query(
        `SELECT id, employee_id, date, status, remarks FROM attendance WHERE date = $1`,
        [date]
      );
      return NextResponse.json({ attendance: result.rows });
    }

    // Used by AttendanceList with filters
    let sql = `
      SELECT a.id, a.employee_id, e.name, e.position, a.date, a.status, a.remarks
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND e.name ILIKE $${params.length}`;
    }
    if (fromDate) {
      params.push(fromDate);
      sql += ` AND a.date >= $${params.length}`;
    }
    if (toDate) {
      params.push(toDate);
      sql += ` AND a.date <= $${params.length}`;
    }

    sql += ` ORDER BY a.date DESC, e.name ASC`;

    const result = await query(sql, params);
    return NextResponse.json({ attendance: result.rows });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('hi')

    // Normalize to array whether single or bulk
    const records = Array.isArray(body) ? body : [body];
    console.log('records: ', records);

    const validStatuses = ['Present', 'Absent', 'Leave'];
    const results = [];
    const errors = [];

    for (const record of records) {
      const { employee_id, date, status, remarks } = record;

      console.log('Processing record:', { employee_id, date, status, remarks }); // 👈 add this

      if (!employee_id || !date || !status) {
        errors.push({ employee_id, error: 'Missing required fields' });
        continue;
      }

      if (!validStatuses.includes(status)) {
        errors.push({ employee_id, error: 'Invalid status' });
        continue;
      }

      try {
        const result = await query(
          `INSERT INTO attendance (employee_id, date, status, remarks)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (employee_id, date) DO NOTHING
           RETURNING *`,
          [employee_id, date, status, remarks || null]
        );

        if (result.rowCount === 0) {
          errors.push({ employee_id, error: 'Attendance already marked for this date' });
        } else {
          results.push(result.rows[0]);
        }
      } catch (err) {
        errors.push({ employee_id, error: 'Insert failed' });
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ errors }, { status: 409 });
    }

    return NextResponse.json({ attendance: results, errors }, { status: 201 });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 });
  }
}
