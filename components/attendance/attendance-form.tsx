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
  attendanceId: number | null;
  originalStatus: Status | null;
  originalRemarks: string;
}

interface AttendanceFormProps {
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

const EMP_PAGE_SIZE = 10;

export function AttendanceForm({ onSuccess, onCancel }: AttendanceFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Server-side pagination state
  const [search, setSearch] = useState('');
  const [empPage, setEmpPage] = useState(0);
  const [totalEmps, setTotalEmps] = useState(0);

  // All rows keyed by employee id — persists selections across pages
  const [rowMap, setRowMap] = useState<Map<number, EmployeeRow>>(new Map());

  // What's visible on the current page
  const [pageRows, setPageRows] = useState<EmployeeRow[]>([]);

  const totalEmpPages = Math.ceil(totalEmps / EMP_PAGE_SIZE);
  const selectedCount = Array.from(rowMap.values()).filter(e => e.selected).length;
  const allSelected = pageRows.length > 0 && pageRows.every(e => rowMap.get(e.id)?.selected);

  // Fetch employees (server-side page + search) then merge with attendance data
  const fetchPageEmployees = useCallback(async (
    selectedDate: string,
    searchVal: string,
    page: number,
  ) => {
    try {
      setFetching(true);

      // Fetch employees for this page/search
      const empParams = new URLSearchParams();
      if (searchVal) empParams.append('search', searchVal);
      empParams.append('limit', String(EMP_PAGE_SIZE));
      empParams.append('offset', String(page * EMP_PAGE_SIZE));

      // Fetch attendance for the date in parallel
      const [empRes, attRes] = await Promise.all([
        fetch(`/api/employees?${empParams}`),
        fetch(`/api/attendance?date=${selectedDate}`),
      ]);

      const empData = await empRes.json();
      const attData = await attRes.json();

      const employees: Array<{ id: number; name: string }> = empData.employees || [];
      const total: number = empData.total || 0;
      setTotalEmps(total);

      // Build attendance lookup
      const markedMap = new Map<number, { id: number; status: Status; remarks: string }>();
      (attData.attendance ?? []).forEach((a: any) => {
        markedMap.set(a.employee_id, { id: a.id, status: a.status, remarks: a.remarks ?? '' });
      });

      // Build page rows, preserving existing selections from rowMap
      const newPageRows: EmployeeRow[] = employees.map(emp => {
        const existing = rowMap.get(emp.id);
        const marked = markedMap.get(emp.id);
        return {
          id: emp.id,
          name: emp.name,
          // Keep selection state if user already interacted with this row
          selected: existing?.selected ?? false,
          status: existing?.status ?? marked?.status ?? 'Present',
          remarks: existing?.remarks ?? marked?.remarks ?? '',
          attendanceId: marked?.id ?? null,
          originalStatus: marked?.status ?? null,
          originalRemarks: marked?.remarks ?? '',
        };
      });

      setPageRows(newPageRows);

      // Merge into rowMap so selections are preserved when paginating
      setRowMap(prev => {
        const next = new Map(prev);
        newPageRows.forEach(row => next.set(row.id, row));
        return next;
      });
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setFetching(false);
    }
  }, []); // no deps — receives everything as args

  // Re-fetch whenever date, search, or page changes
  useEffect(() => {
    fetchPageEmployees(date, search, empPage);
  }, [date, search, empPage]);

  // Search resets to page 1
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setEmpPage(0);
  };

  // Date change resets page + clears all selections
  const handleDateChange = (value: string) => {
    setDate(value);
    setEmpPage(0);
    setRowMap(new Map());
  };

  // Helpers — update rowMap and keep pageRows in sync
  const updateRow = (id: number, patch: Partial<EmployeeRow>) => {
    setRowMap(prev => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (existing) next.set(id, { ...existing, ...patch });
      return next;
    });
    setPageRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const toggleEmployee = (id: number) => {
    const current = rowMap.get(id);
    if (current) updateRow(id, { selected: !current.selected });
  };

  const toggleAll = () => {
    const ids = new Set(pageRows.map(r => r.id));
    const patch = { selected: !allSelected };
    setRowMap(prev => {
      const next = new Map(prev);
      ids.forEach(id => {
        const r = next.get(id);
        if (r) next.set(id, { ...r, ...patch });
      });
      return next;
    });
    setPageRows(prev => prev.map(r => ids.has(r.id) ? { ...r, ...patch } : r));
  };

  const setStatus = (id: number, status: Status) => updateRow(id, { status });
  const setRemarks = (id: number, remarks: string) => updateRow(id, { remarks });

  const bulkSetStatus = (status: Status) => {
    const selectedIds = new Set(
      Array.from(rowMap.values()).filter(r => r.selected).map(r => r.id)
    );
    setRowMap(prev => {
      const next = new Map(prev);
      selectedIds.forEach(id => {
        const r = next.get(id);
        if (r) next.set(id, { ...r, status });
      });
      return next;
    });
    setPageRows(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, status } : r));
  };

  const isDirty = (emp: EmployeeRow) => {
    if (!emp.attendanceId) return true;
    return emp.status !== emp.originalStatus || emp.remarks !== emp.originalRemarks;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selected = Array.from(rowMap.values()).filter(e => e.selected);
    if (selected.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

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
      toast.success(`Saved: ${toCreate.length} new, ${toUpdate.length} updated`);
      onSuccess();
    } catch {
      toast.error('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Date + Bulk actions */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="space-y-1.5 w-48">
          <Label className="text-sm font-medium text-foreground">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
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
          onChange={(e) => handleSearchChange(e.target.value)}
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

      {/* Employee List */}
      <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
        {fetching ? (
          <div className="p-6 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading employees...
          </div>
        ) : pageRows.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">No employees found</div>
        ) : (
          <>
            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {pageRows.map(emp => {
                const row = rowMap.get(emp.id) ?? emp;
                return (
                  <div
                    key={emp.id}
                    className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                      row.selected ? 'bg-primary/5' : 'hover:bg-muted/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => toggleEmployee(emp.id)}
                      className="h-4 w-4 accent-primary cursor-pointer shrink-0"
                    />

                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary text-xs font-semibold">
                        {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>

                    {/* Name + marked badge */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{emp.name}</span>
                        {row.attendanceId && !row.selected && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[row.originalStatus!]}`}>
                            {row.originalStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status toggle + remarks — only when selected */}
                    {row.selected && (
                      <>
                        <div className="flex gap-1 shrink-0">
                          {(['Present', 'Absent', 'Leave'] as Status[]).map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setStatus(emp.id, s)}
                              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                                row.status === s
                                  ? STATUS_STYLES[s]
                                  : 'bg-transparent text-muted-foreground border-border hover:border-foreground'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <Input
                          value={row.remarks}
                          onChange={(e) => setRemarks(emp.id, e.target.value)}
                          placeholder="Remarks"
                          className="w-32 h-8 text-xs focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Server-side Pagination */}
            {totalEmpPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Page {empPage + 1} of {totalEmpPages} · {totalEmps} employees
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={empPage === 0}
                    onClick={() => setEmpPage(p => p - 1)}
                    className="text-xs px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={empPage >= totalEmpPages - 1}
                    onClick={() => setEmpPage(p => p + 1)}
                    className="text-xs px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
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