import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building2, CheckCircle2 } from 'lucide-react';
import { createPageUrl } from '../components/utils';

export default function Setup() {
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser.agency_id) {
        setInitialized(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    setInitializing(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('initializeAgency', {});
      
      if (response.data.success) {
        setInitialized(true);
        setTimeout(() => {
          window.location.href = createPageUrl('Dashboard');
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to initialize');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Complete!</h2>
            <p className="text-slate-600 mb-4">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Welcome to Marketing ERP</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Let's set up your agency</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">What we'll create:</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Your agency workspace: <strong>AgencyFlow</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Admin account for: <strong>{user?.email}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Multi-tenant data structure</span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button 
              onClick={handleInitialize}
              disabled={initializing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg"
            >
              {initializing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Initializing...
                </>
              ) : (
                'Initialize Agency'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}