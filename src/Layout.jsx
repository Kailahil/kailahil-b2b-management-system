import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Home, Building2, FileText, BarChart3, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './components/utils';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
        base44.auth.redirectToLogin();
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

  const navItems = [
    { name: 'Dashboard', page: 'Dashboard', icon: Home },
    { name: 'Businesses', page: 'Businesses', icon: Building2 },
    { name: 'Reviews', page: 'Reviews', icon: FileText },
    { name: 'Content', page: 'ContentPipeline', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-[#f5f3ed] pb-24">
      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-[#7a8a5e] backdrop-blur-lg rounded-full px-6 py-4 shadow-2xl">
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className="group relative"
                >
                  <div className={`transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#a8b88c] p-3 rounded-2xl' 
                      : 'p-3 hover:bg-[#6b7a4e]/50 rounded-2xl'
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-white' : 'text-white/70'
                    }`} />
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#c8d4a8] rounded-full" />
                  )}
                </Link>
              );
            })}
            
            {/* Settings Divider */}
            <div className="w-px h-8 bg-white/20" />
            
            {/* Settings */}
            <Link
              to={createPageUrl('Settings')}
              className="group relative"
            >
              <div className={`transition-all duration-300 ${
                currentPageName === 'Settings'
                  ? 'bg-[#a8b88c] p-3 rounded-2xl' 
                  : 'p-3 hover:bg-[#6b7a4e]/50 rounded-2xl'
              }`}>
                <Settings className={`w-5 h-5 transition-colors ${
                  currentPageName === 'Settings' ? 'text-white' : 'text-white/70'
                }`} />
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="group relative"
            >
              <div className="p-3 hover:bg-[#6b7a4e]/50 rounded-2xl transition-all duration-300">
                <LogOut className="w-5 h-5 text-white/70" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}