'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AttendanceForm } from './attendance-form';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: number;
  employee_id: number;
  name: string;
  position: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  remarks?: string;
}

interface Employee {
  id: number;
  name: string;
}

export function AttendanceList() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({
    search: '',
    fromDate: today,
    toDate: today,
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);

      const response = await fetch(`/api/attendance?${params}`);
      const data = await response.json();
      setAttendance(data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to fetch attendance records. Please check your database connection.');
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setAttendance(attendance.filter(a => a.id !== id));
        toast.success('Record deleted successfully');
      } else {
        toast.error('Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  };

  const handleAttendanceAdded = () => {
    setShowForm(false);
    fetchAttendance();
    toast.success('Attendance marked successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Absent':  return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Leave':   return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: 'Present' | 'Absent' | 'Leave') => {
    const styles = {
      Present: 'bg-green-100 text-green-700',
      Absent:  'bg-red-100 text-red-700',
      Leave:   'bg-yellow-100 text-yellow-700',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Attendance</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? 'Cancel' : '+ Mark Attendance'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-800">{error}</p>
          {/* <p className="text-xs text-red-600 mt-2">Please ensure the database is initialized. Visit /setup to initialize.</p> */}
        </Card>
      )}

      {/* Form */}
      {showForm && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <AttendanceForm
            employees={employees}
            onSuccess={handleAttendanceAdded}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 space-y-3">
        <Label className="text-sm font-semibold text-foreground">Filters</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="search" className="text-xs text-muted-foreground">Search Employee</Label>
            <Input
              id="search"
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fromDate" className="text-xs text-muted-foreground">From Date</Label>
            <Input
              id="fromDate"
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="toDate" className="text-xs text-muted-foreground">To Date</Label>
            <Input
              id="toDate"
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              className="focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading attendance records...
        </div>
      ) : !error && attendance.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-sm">No attendance records found for the selected filters.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employee</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Position</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Remarks</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(record => (
                  <tr key={record.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary text-xs font-semibold">
                            {record.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{record.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{record.position}</td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{record.remarks || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 rounded-full"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}