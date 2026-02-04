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
      <div className="fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-[#7a8a5e] backdrop-blur-lg rounded-full px-4 py-3 shadow-2xl">
            <div className="flex items-center justify-around gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className="group relative flex-1 flex justify-center"
                  >
                    <div className={`transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#a8b88c] p-2.5 rounded-xl scale-110' 
                        : 'p-2.5 hover:bg-[#6b7a4e]/50 rounded-xl'
                    }`}>
                      <Icon className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-white' : 'text-white/70'
                      }`} />
                    </div>
                  </Link>
                );
              })}
              
              {/* Settings */}
              <Link
                to={createPageUrl('Settings')}
                className="group relative flex-1 flex justify-center"
              >
                <div className={`transition-all duration-300 ${
                  currentPageName === 'Settings'
                    ? 'bg-[#a8b88c] p-2.5 rounded-xl scale-110' 
                    : 'p-2.5 hover:bg-[#6b7a4e]/50 rounded-xl'
                }`}>
                  <Settings className={`w-5 h-5 transition-colors ${
                    currentPageName === 'Settings' ? 'text-white' : 'text-white/70'
                  }`} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}