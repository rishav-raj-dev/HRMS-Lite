-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
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

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Present', 'Absent', 'Leave')),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- Sample data (optional - can be removed)
INSERT INTO employees (name, email, position, department, hire_date, salary) VALUES
('John Doe', 'john.doe@company.com', 'Software Engineer', 'Engineering', '2022-01-15', 75000),
('Jane Smith', 'jane.smith@company.com', 'Product Manager', 'Product', '2021-06-20', 85000),
('Mike Johnson', 'mike.johnson@company.com', 'HR Manager', 'HR', '2020-03-10', 65000),
('Sarah Williams', 'sarah.williams@company.com', 'DevOps Engineer', 'Engineering', '2022-09-01', 80000),
('Emily Brown', 'emily.brown@company.com', 'UX Designer', 'Design', '2023-02-15', 70000)
ON CONFLICT (email) DO NOTHING;

-- Sample attendance data
INSERT INTO attendance (employee_id, date, status) VALUES
(1, CURRENT_DATE - INTERVAL '1 day', 'Present'),
(1, CURRENT_DATE, 'Present'),
(2, CURRENT_DATE - INTERVAL '1 day', 'Present'),
(2, CURRENT_DATE, 'Absent'),
(3, CURRENT_DATE - INTERVAL '1 day', 'Present'),
(3, CURRENT_DATE, 'Present'),
(4, CURRENT_DATE - INTERVAL '1 day', 'Leave'),
(4, CURRENT_DATE, 'Present'),
(5, CURRENT_DATE - INTERVAL '1 day', 'Present'),
(5, CURRENT_DATE, 'Present')
ON CONFLICT (employee_id, date) DO NOTHING;
