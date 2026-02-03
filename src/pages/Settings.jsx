import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Users, Shield } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        if (!currentUser.agency_id) {
          window.location.href = createPageUrl('Setup');
          return;
        }
        
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isAdmin = user?.user_role === 'agency_admin';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500">Manage your account and preferences</p>
      </div>

      {/* Account Settings */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Full Name</label>
                <p className="text-slate-900 font-medium mt-1">{user?.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="text-slate-900 font-medium mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Role</label>
                <p className="text-slate-900 font-medium mt-1 capitalize">{user?.user_role?.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management - Admin Only */}
      {isAdmin && (
        <Card className="mb-6 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
            <p className="text-slate-500 text-sm mt-1">Invite and manage team members</p>
          </CardHeader>
          <CardContent className="p-6">
            <EmptyState
              icon={Users}
              title="User management coming soon"
              description="Invite team members, assign roles, and manage permissions."
            />
          </CardContent>
        </Card>
      )}

      {/* Security */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Password</h3>
              <Button variant="outline">Change Password</Button>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-slate-500 mb-2">Add an extra layer of security to your account</p>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}