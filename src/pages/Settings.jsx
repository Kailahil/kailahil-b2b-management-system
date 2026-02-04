import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Users, Shield, LogOut } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';
import { createPageUrl } from '../components/utils';

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
      <div className="flex items-center justify-center min-h-screen bg-[#f5f3ed]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  const isAdmin = user?.user_role === 'agency_admin';

  const handleLogout = async () => {
    const redirectUrl = user?.user_role === 'client' 
      ? createPageUrl('ClientLogin') 
      : createPageUrl('MediaLogin');
    await base44.auth.logout(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2d3319] mb-2">Settings</h1>
          <p className="text-[#6b7055] text-lg">Manage your account and preferences</p>
        </div>

        {/* Account Settings */}
        <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-[2.5rem_2.5rem_2.5rem_1rem] shadow-xl border border-[#e8e6de]/30">
          <div className="p-6 border-b border-[#e8e6de]">
            <h2 className="text-2xl font-bold text-[#2d3319] flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Account Settings
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-[#6b7055]">Full Name</label>
                  <p className="text-[#2d3319] font-medium mt-1">{user?.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-[#6b7055]">Email</label>
                  <p className="text-[#2d3319] font-medium mt-1">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-[#6b7055]">Role</label>
                  <p className="text-[#2d3319] font-medium mt-1 capitalize">{user?.user_role?.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management - Admin Only */}
        {isAdmin && (
          <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-[2.5rem_2.5rem_2.5rem_1rem] shadow-xl border border-[#e8e6de]/30">
            <div className="p-6 border-b border-[#e8e6de]">
              <h2 className="text-2xl font-bold text-[#2d3319] flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </h2>
              <p className="text-[#6b7055] text-sm mt-1">Invite and manage team members</p>
            </div>
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="User management coming soon"
                description="Invite team members, assign roles, and manage permissions."
              />
            </div>
          </div>
        )}

        {/* Security */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem_2rem_2rem_0.5rem] shadow-xl border border-[#e8e6de]/30">
          <div className="p-6 border-b border-[#e8e6de]">
            <h2 className="text-2xl font-bold text-[#2d3319] flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[#2d3319] mb-2">Password</h3>
                <Button variant="outline" className="border-[#e8e6de] text-[#6b7055] hover:bg-[#f5f3ed]">Change Password</Button>
              </div>
              <div>
                <h3 className="font-bold text-[#2d3319] mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-[#6b7055] mb-2">Add an extra layer of security to your account</p>
                <Button variant="outline" className="border-[#e8e6de] text-[#6b7055] hover:bg-[#f5f3ed]">Enable 2FA</Button>
              </div>
              <div className="pt-6 border-t border-[#e8e6de]">
                <h3 className="font-bold text-[#2d3319] mb-2">Sign Out</h3>
                <p className="text-sm text-[#6b7055] mb-3">Log out of your account and return to the login page</p>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}