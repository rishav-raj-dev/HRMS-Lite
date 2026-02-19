'use client';

import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/dashboard/dashboard';
import { EmployeeList } from '@/components/employees/employee-list';
import { AttendanceList } from '@/components/attendance/attendance-list';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Calendar, AlertCircle } from 'lucide-react';

type Page = 'dashboard' | 'employees' | 'attendance';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [health, setHealth] = useState<boolean | null>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function correctHealth(){
      const response = await fetch('/api/health', {'method': 'POST'});
      const data = await response.json();
      if (!data.health){
        setHealth(data.health);
        setTimeout(()=>{
          window.location.href = '/';
        },2000);
      }
      else {
        setHealth(data.health);
      }
    }
    async function checkHealth() {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        if (!data.health){
          await correctHealth();
        }
        else{
          setHealth(data.health);
        }
      } catch (err) {
        setError('Failed to check database status');
        console.error(err);
      }
    }
    checkHealth();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">HRMS</h1>
              <p className="text-sm text-muted-foreground mt-1">Human Resource Management System</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!health && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Unable to Reach the Database</h3>
              <p className="text-yellow-800 text-sm mt-1">
                We're having trouble connecting to the database right now. Some features may not work as expected. Please try again in a moment — if the problem persists, contact your system administrator.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <>
            <div className="mb-8 flex gap-2 flex-wrap">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id as Page)}
                    variant={currentPage === item.id ? 'default' : 'outline'}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>

            {/* Content */}
            <div className="rounded-lg">
              {currentPage === 'dashboard' && <Dashboard />}
              {currentPage === 'employees' && <EmployeeList />}
              {currentPage === 'attendance' && <AttendanceList />}
            </div>
          </>
      </div>
    </div>
  );
}
