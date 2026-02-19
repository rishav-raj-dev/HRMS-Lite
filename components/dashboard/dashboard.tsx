'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Calendar, TrendingUp, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  leaveToday: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    leaveToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all employees
        const empResponse = await fetch('/api/employees');
        const empData = await empResponse.json();
        
        if (!empResponse.ok) {
          // setError('Unable to load dashboard data. Please initialize the database.');
          setStats({
            totalEmployees: 0,
            presentToday: 0,
            absentToday: 0,
            leaveToday: 0,
          });
          return;
        }

        const totalEmployees = empData.employees?.length || 0;

        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0];
        const attResponse = await fetch(`/api/attendance?fromDate=${today}&toDate=${today}`);
        const attData = await attResponse.json();

        const attendance = attData.attendance || [];
        const presentToday = attendance.filter((a: any) => a.status === 'Present').length;
        const absentToday = attendance.filter((a: any) => a.status === 'Absent').length;
        const leaveToday = attendance.filter((a: any) => a.status === 'Leave').length;

        setStats({
          totalEmployees,
          presentToday,
          absentToday,
          leaveToday,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: Calendar,
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'On Leave',
      value: stats.leaveToday,
      icon: TrendingUp,
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Welcome to HRMS Lite</p>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-800">{error}</p>
          <p className="text-xs text-red-600 mt-2">
            <a href="/setup" className="underline">Click here to initialize the database</a>
          </p>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Info</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Attendance Rate Today</span>
            <span className="text-foreground font-semibold">
              {stats.totalEmployees > 0
                ? `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}%`
                : '0'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Marked Attendance</span>
            <span className="text-foreground font-semibold">
              {stats.presentToday + stats.absentToday + stats.leaveToday} / {stats.totalEmployees}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
