'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XCircle } from 'lucide-react';

interface EmployeeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function EmployeeForm({ onSuccess, onCancel }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<String>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.salary || isNaN(parseFloat(formData.salary)) || Number(formData.salary) < 0) {
      setErrorMessage('Please enter a valid salary');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salary: parseFloat(formData.salary),
        }),
      });
      const data = await response.json();

      if (response.ok) {
        onSuccess();
        setFormData({
          name: '',
          email: '',
          position: '',
          department: '',
          hire_date: new Date().toISOString().split('T')[0],
          salary: '',
        });
      } else if (response.status === 409) {
        setErrorMessage(data.error);
      } else {
        setErrorMessage(data.error);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setErrorMessage('Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
<form onSubmit={handleSubmit} className="space-y-6">
  
  {/* Section: Personal Info */}
  <div>
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
      Personal Information
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
          className="focus-visible:ring-1 focus-visible:ring-primary"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
          className="focus-visible:ring-1 focus-visible:ring-primary"
          required
        />
      </div>
    </div>
  </div>

  <hr className="border-border" />

  {/* Section: Job Details */}
  <div>
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
      Job Details
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="position" className="text-sm font-medium text-foreground">Position</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          placeholder="Software Engineer"
          className="focus-visible:ring-1 focus-visible:ring-primary"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="department" className="text-sm font-medium text-foreground">Department</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          placeholder="Engineering"
          className="focus-visible:ring-1 focus-visible:ring-primary"
          required
        />
      </div>
    </div>
  </div>

  <hr className="border-border" />

  {/* Section: Employment Info */}
  <div>
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
      Employment Info
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="hire_date" className="text-sm font-medium text-foreground">Hire Date</Label>
        <Input
          id="hire_date"
          type="date"
          value={formData.hire_date}
          onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
          className="focus-visible:ring-1 focus-visible:ring-primary"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="salary" className="text-sm font-medium text-foreground">
          Salary <span className="text-muted-foreground font-normal">(₹)</span>
        </Label>
        <Input
          id="salary"
          type="number"
          value={formData.salary}
          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
          placeholder="75000"
          className="focus-visible:ring-1 focus-visible:ring-primary"
          required
        />
      </div>
    </div>
  </div>

  {errorMessage.length>0 && (
    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-800">{errorMessage}</p>
      <button
        onClick={() => setErrorMessage('')}
        className="ml-4 text-red-400 hover:text-red-600 transition-colors shrink-0"
        aria-label="Dismiss error"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  )}

  {/* Actions */}
  <div className="flex gap-2 justify-end pt-2 border-t border-border">
    <Button variant="outline" type="button" onClick={onCancel} disabled={loading} className="w-24">
      Cancel
    </Button>
    <Button type="submit" disabled={loading} className="w-32">
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Adding...
        </span>
      ) : 'Add Employee'}
    </Button>
  </div>

</form>
  );
}
