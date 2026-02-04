import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, LogOut, AlertCircle } from 'lucide-react';
import { createPageUrl } from '../components/utils';

export default function MediaSpecialistSettings() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    try {
      const employeeData = JSON.parse(localStorage.getItem('employeeAuth') || '{}');
      setEmployee(employeeData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('employeeAuth');
    window.location.href = createPageUrl('Welcome');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-10">
          <div className="inline-block mb-3">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
              <span className="text-xs text-[#6b7055] font-medium uppercase tracking-wider">Settings</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2d3319] mb-3 leading-tight">
            Account Settings
          </h1>
          <p className="text-[#6b7055] text-lg">
            Manage your account and security
          </p>
        </div>

        {/* Account Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50 mb-6">
          <h2 className="text-2xl font-bold text-[#2d3319] mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-[#a8b88c]" />
            Your Account
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2d3319] mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={employee?.full_name || ''}
                disabled
                className="bg-[#f9f8f4] border-[#e8e6de] text-[#2d3319] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2d3319] mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={employee?.email || ''}
                disabled
                className="bg-[#f9f8f4] border-[#e8e6de] text-[#2d3319] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50 mb-6">
          <h2 className="text-2xl font-bold text-[#2d3319] mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#a8b88c]" />
            Security
          </h2>

          <div className="bg-[#f9f8f4] rounded-2xl p-6 border border-[#e8e6de]">
            <p className="text-[#6b7055] mb-4">
              Password changes are not currently available. Please contact your administrator if you need to reset your password.
            </p>
            <Button
              disabled
              variant="outline"
              className="border-[#e8e6de]"
            >
              Change Password
            </Button>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50">
          <h2 className="text-2xl font-bold text-[#2d3319] mb-6 flex items-center gap-2">
            <LogOut className="w-6 h-6 text-[#a8b88c]" />
            Session
          </h2>

          <div className="bg-gradient-to-r from-[#f9f8f4] to-[#f5f3ed] rounded-2xl p-6 border border-[#e8e6de] mb-4">
            <p className="text-[#6b7055] mb-4">
              Sign out from your account and return to the login page.
            </p>
          </div>

          <Button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}