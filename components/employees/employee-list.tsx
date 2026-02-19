'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

const LIMIT = 10;

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const fetchEmployees = useCallback(async (searchVal: string, offsetVal: number) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchVal) params.append('search', searchVal);
      params.append('limit', String(LIMIT));
      params.append('offset', String(offsetVal));

      const response = await fetch(`/api/employees?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch employees');
        setEmployees([]);
        return;
      }

      setEmployees(data.employees || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees. Please check your database connection.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEmployees('', 0);
  }, []);

  // Debounced search
  const handleSearch = (value: string) => {
    setSearch(value);
    setOffset(0);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => fetchEmployees(value, 0), 400);
    setDebounceTimer(timer);
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    fetchEmployees(search, newOffset);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Employee deleted successfully');
        fetchEmployees(search, offset);
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
    fetchEmployees(search, offset);
    toast.success('Employee added successfully');
  };

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Employees</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Employee'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </Card>
      )}

      {/* Form */}
      {showForm && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <EmployeeForm onSuccess={handleEmployeeAdded} onCancel={() => setShowForm(false)} />
        </Card>
      )}

      {/* Search */}
      {!error && (
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by name, position or department..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="focus-visible:ring-1 focus-visible:ring-primary"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {total} employee{total !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading employees...
        </div>
      ) : employees.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {search ? 'No employees match your search.' : 'No employees yet. Add one to get started.'}
          </p>
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => handlePageChange(offset - LIMIT)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + LIMIT >= total}
              onClick={() => handlePageChange(offset + LIMIT)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}