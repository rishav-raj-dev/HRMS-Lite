'use client';

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SetupPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      const response = await fetch('/api/setup');
      const data = await response.json();
      setInitialized(data.initialized);
      if (data.initialized) {
        setError(null);
      }
    } catch (err: any) {
      setError('Failed to check database status');
      console.error(err);
    }
  }

  async function handleSetup() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/setup', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        setInitialized(true);
        toast({
          title: 'Success',
          description: 'Database initialized successfully with sample data!',
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setError(data.details || data.error || 'Failed to initialize database');
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      const message = err.message || 'Failed to initialize database';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">HRMS Lite Setup</h1>
        <p className="text-slate-600 mb-6">Initialize your database to get started</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {initialized === null && (
          <p className="text-slate-600 text-center py-4">Checking database status...</p>
        )}

        {initialized === true && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">✓ Database Ready</p>
            <p className="text-green-700 text-sm mt-1">Your database is initialized and ready to use.</p>
          </div>
        )}

        {initialized === false && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 text-sm">
                This will create the necessary tables and load sample data.
              </p>
            </div>
            <Button
              onClick={handleSetup}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Initializing...' : 'Initialize Database'}
            </Button>
          </div>
        )}

        {initialized === true && (
          <Button
            onClick={() => (window.location.href = '/')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
