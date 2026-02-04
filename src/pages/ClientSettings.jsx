import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, User, Phone, LogOut, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../components/utils';

export default function ClientSettings() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const clientBusinessList = await base44.entities.ClientBusiness.filter({ 
          user_id: currentUser.id 
        });

        if (clientBusinessList.length > 0) {
          const businessList = await base44.entities.Business.filter({ 
            id: clientBusinessList[0].business_id 
          });
          if (businessList.length > 0) {
            setBusiness(businessList[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
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

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-10">
          <div className="inline-block mb-3">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
              <span className="text-xs text-[#6b7055] font-medium uppercase tracking-wider">Settings</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2d3319] mb-3 leading-tight">
            Account & Preferences
          </h1>
          <p className="text-[#6b7055] text-lg">
            Manage your contact info and communication settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50">
            <h2 className="text-xl font-bold text-[#2d3319] mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#7a8a5e]" />
              Your Account
            </h2>
            <div className="space-y-4">
              <div className="pb-4 border-b border-[#e8e6de]">
                <p className="text-sm text-[#6b7055] font-medium mb-1">Full Name</p>
                <p className="text-lg font-semibold text-[#2d3319]">{user?.full_name}</p>
              </div>
              <div className="pb-4 border-b border-[#e8e6de]">
                <p className="text-sm text-[#6b7055] font-medium mb-1">Email</p>
                <p className="text-lg font-semibold text-[#2d3319] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#a8b88c]" />
                  {user?.email}
                </p>
              </div>
              {business && (
                <div>
                  <p className="text-sm text-[#6b7055] font-medium mb-1">Business</p>
                  <p className="text-lg font-semibold text-[#2d3319]">{business.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Primary Contact */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50">
            <h2 className="text-xl font-bold text-[#2d3319] mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#7a8a5e]" />
              Your Media Specialist
            </h2>
            <div className="bg-[#f9f8f4] rounded-2xl p-6 border border-[#e8e6de]">
              <p className="text-sm text-[#6b7055] font-medium mb-2">Primary Point of Contact</p>
              <p className="text-lg font-semibold text-[#2d3319]">Coming Soon</p>
              <p className="text-sm text-[#9ca38a] mt-2">
                Your assigned media specialist's contact information will appear here once assigned.
              </p>
            </div>
          </div>

          {/* Support */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50">
            <h2 className="text-xl font-bold text-[#2d3319] mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#7a8a5e]" />
              Support
            </h2>
            <div className="space-y-3">
              <Button
                className="w-full bg-white border-2 border-[#e8e6de] hover:border-[#a8b88c] text-[#2d3319] hover:bg-[#f5f3ed]"
                onClick={() => window.location.href = 'mailto:support@kailahil.com'}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <p className="text-xs text-[#9ca38a] text-center">
                Email us at support@kailahil.com for any questions or concerns
              </p>
            </div>
          </div>

          {/* Logout */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-2 border-red-200 hover:bg-red-50 text-red-600 font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}