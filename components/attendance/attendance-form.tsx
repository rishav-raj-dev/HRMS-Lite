'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Status = 'Present' | 'Absent' | 'Leave';

interface EmployeeRow {
  id: number;
  name: string;
  selected: boolean;
  status: Status;
  remarks: string;
  // If already marked, store the attendance record id and original values
  attendanceId: number | null;
  originalStatus: Status | null;
  originalRemarks: string;
}

interface AttendanceFormProps {
  employees: Array<{ id: number; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

const STATUS_STYLES: Record<Status, string> = {
  Present: 'bg-green-100 text-green-700 border-green-300',
  Absent:  'bg-red-100 text-red-700 border-red-300',
  Leave:   'bg-yellow-100 text-yellow-700 border-yellow-300',
};

const STATUS_BADGE: Record<Status, string> = {
  Present: 'bg-green-100 text-green-700',
  Absent:  'bg-red-100 text-red-700',
  Leave:   'bg-yellow-100 text-yellow-700',
};

export function AttendanceForm({ employees, onSuccess, onCancel }: AttendanceFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  const [employeeList, setEmployeeList] = useState<EmployeeRow[]>(
    employees.map(emp => ({
      ...emp,
      selected: false,
      status: 'Present',
      remarks: '',
      attendanceId: null,
      originalStatus: null,
      originalRemarks: '',
    }))
  );

  // Fetch existing attendance for the selected date
  const fetchAttendance = useCallback(async (selectedDate: string) => {
    try {
      setFetching(true);
      const res = await fetch(`/api/attendance?date=${selectedDate}`);
      const data = await res.json();

      const markedMap = new Map<number, { id: number; status: Status; remarks: string }>();
      (data.attendance ?? []).forEach((a: any) => {
        markedMap.set(a.employee_id, { id: a.id, status: a.status, remarks: a.remarks ?? '' });
      });

      setEmployeeList(employees.map(emp => {
        const marked = markedMap.get(emp.id);
        return {
          ...emp,
          selected: false,
          status: marked?.status ?? 'Present',
          remarks: marked?.remarks ?? '',
          attendanceId: marked?.id ?? null,
          originalStatus: marked?.status ?? null,
          originalRemarks: marked?.remarks ?? '',
        };
      }));
    } catch {
      toast.error('Failed to fetch attendance for this date');
    } finally {
      setFetching(false);
    }
  }, [employees]);

  useEffect(() => {
    fetchAttendance(date);
  }, [date]);

  const filtered = employeeList
    .filter(emp => emp.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, search ? employeeList.length : 10);

  const selectedCount = employeeList.filter(e => e.selected).length;
  const allSelected = filtered.length > 0 && filtered.every(e => e.selected);

  const toggleAll = () => {
    const ids = new Set(filtered.map(e => e.id));
    setEmployeeList(prev =>
      prev.map(e => ids.has(e.id) ? { ...e, selected: !allSelected } : e)
    );
  };

  const toggleEmployee = (id: number) => {
    setEmployeeList(prev =>
      prev.map(e => e.id === id ? { ...e, selected: !e.selected } : e)
    );
  };

  const setStatus = (id: number, status: Status) => {
    setEmployeeList(prev =>
      prev.map(e => e.id === id ? { ...e, status } : e)
    );
  };

  const setRemarks = (id: number, remarks: string) => {
    setEmployeeList(prev =>
      prev.map(e => e.id === id ? { ...e, remarks } : e)
    );
  };

  const bulkSetStatus = (status: Status) => {
    setEmployeeList(prev =>
      prev.map(e => e.selected ? { ...e, status } : e)
    );
  };

  // Check if a row has actually changed from its saved state
  const isDirty = (emp: EmployeeRow) => {
    if (!emp.attendanceId) return true; // new record, always submit
    return emp.status !== emp.originalStatus || emp.remarks !== emp.originalRemarks;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selected = employeeList.filter(e => e.selected);
    if (selected.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    // Only submit rows that have actually changed
    const dirtySelected = selected.filter(isDirty);
    if (dirtySelected.length === 0) {
      toast.info('No changes to save');
      return;
    }

    const toCreate = dirtySelected.filter(e => !e.attendanceId);
    const toUpdate = dirtySelected.filter(e => !!e.attendanceId);

    try {
      setLoading(true);
      const requests: Promise<Response>[] = [];

      // POST new records in bulk
      if (toCreate.length > 0) {
        requests.push(
          fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              toCreate.map(e => ({
                employee_id: e.id,
                date,
                status: e.status,
                remarks: e.remarks,
              }))
            ),
          })
        );
      }

      // PATCH existing records individually
      toUpdate.forEach(e => {
        requests.push(
          fetch(`/api/attendance/${e.attendanceId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: e.status, remarks: e.remarks }),
          })
        );
      });

      await Promise.all(requests);

      toast.success(
        `Saved: ${toCreate.length} new, ${toUpdate.length} updated`
      );
      onSuccess();
      fetchAttendance(date); // refresh marked state
    } catch {
      toast.error('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Date picker */}
      <div className="flex items-center gap-4">
        <div className="space-y-1.5 w-48">
          <Label className="text-sm font-medium text-foreground">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="focus-visible:ring-1 focus-visible:ring-primary"
            required
          />
        </div>

        {selectedCount > 0 && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Mark {selectedCount} selected as:
            </Label>
            <div className="flex gap-2">
              {(['Present', 'Absent', 'Leave'] as Status[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => bulkSetStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${STATUS_STYLES[s]}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search + Select All */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="focus-visible:ring-1 focus-visible:ring-primary"
        />
        <button
          type="button"
          onClick={toggleAll}
          className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap underline underline-offset-2"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {!search && employeeList.length > 10 && (
        <p className="text-xs text-muted-foreground -mt-3">
          Showing 10 of {employeeList.length} employees. Search to find others.
        </p>
      )}

      {/* Employee List */}
      <div className="border border-border rounded-lg overflow-hidden divide-y divide-border max-h-72 overflow-y-auto">
        {fetching ? (
          <div className="p-6 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading attendance...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">No employees found</div>
        ) : (
          filtered.map(emp => (
            <div
              key={emp.id}
              className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                emp.selected ? 'bg-primary/5' : 'hover:bg-muted/40'
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={emp.selected}
                onChange={() => toggleEmployee(emp.id)}
                className="h-4 w-4 accent-primary cursor-pointer shrink-0"
              />

              {/* Avatar */}
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary text-xs font-semibold">
                  {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>

              {/* Name + already marked badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{emp.name}</span>
                  {emp.attendanceId && !emp.selected && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[emp.originalStatus!]}`}>
                      {emp.originalStatus}
                    </span>
                  )}
                  {/* Show dirty indicator if selected and changed */}
                  {/* {emp.selected && emp.attendanceId && isDirty(emp) && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-600">
                      edited
                    </span>
                  )} */}
                </div>
              </div>

              {/* Status toggle — only when selected */}
              {emp.selected && (
                <>
                  <div className="flex gap-1 shrink-0">
                    {(['Present', 'Absent', 'Leave'] as Status[]).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(emp.id, s)}
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                          emp.status === s
                            ? STATUS_STYLES[s]
                            : 'bg-transparent text-muted-foreground border-border hover:border-foreground'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={emp.remarks}
                    onChange={(e) => setRemarks(emp.id, e.target.value)}
                    placeholder="Remarks"
                    className="w-32 h-8 text-xs focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-sm text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} employee(s) selected` : 'No employees selected'}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={loading} className="w-24">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || selectedCount === 0} className="w-36">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving...
              </span>
            ) : `Save ${selectedCount || ''} Attendance`}
          </Button>
        </div>
      </div>

    </form>
  );
}