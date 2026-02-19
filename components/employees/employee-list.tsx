'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { EmployeeForm } from './employee-form';
import { toast } from 'sonner';

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  hire_date: string;
  salary: number;
}

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/employees');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch employees');
        setEmployees([]);
        return;
      }

      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees. Please check your database connection.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setEmployees(employees.filter(e => e.id !== id));
        toast.success('Employee deleted successfully');
      } else {
        toast.error('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const handleEmployeeAdded = () => {
    setShowForm(false);
    fetchEmployees();
    toast.success('Employee added successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Employees</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-800">{error}</p>
          {/* <p className="text-xs text-red-600 mt-2">Please ensure the database is initialized. Visit /setup to initialize.</p> */}
        </Card>
      )}

      {showForm && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <EmployeeForm onSuccess={handleEmployeeAdded} onCancel={() => setShowForm(false)} />
        </Card>
      )}

      {!error && employees.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No employees yet. Add one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {employees.map(employee => (
            <Card key={employee.id} className="p-4 hover:shadow-md transition-all duration-200 border border-border">
              <div className="flex items-center justify-between">

                {/* Avatar + Name & Email */}
                <div className="flex items-center gap-4 w-1/3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {employee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{employee.name}</div>
                    <div className="text-xs text-muted-foreground">{employee.email}</div>
                  </div>
                </div>

                {/* Position & Department */}
                <div className="w-1/3">
                  <div className="text-sm font-medium text-foreground">{employee.position}</div>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {employee.department}
                  </span>
                </div>

                {/* Salary + Delete */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Salary</div>
                    <div className="text-sm font-semibold text-foreground">₹{employee.salary.toLocaleString()}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(employee.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
