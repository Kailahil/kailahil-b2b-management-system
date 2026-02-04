import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Home, Building2, FileText, BarChart3, Settings, LogOut, Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './components/utils';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pages that don't need authentication or navigation
  const publicPages = ['Welcome', 'EmployeeLogin'];
  const isPublicPage = publicPages.includes(currentPageName);

  useEffect(() => {
    // Skip auth check for public pages
    if (isPublicPage) {
      setLoading(false);
      return;
    }

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
  }, [currentPageName, isPublicPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f3ed]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  // For public pages, render without navigation
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-[#f5f3ed]">
        {children}
      </div>
    );
  }

  const isMediaSpecialist = !!localStorage.getItem('employeeAuth');

  const getNavItems = () => {
    if (isMediaSpecialist) {
      return [
        { name: 'Dashboard', page: 'Dashboard', icon: Home },
        { name: 'Businesses', page: 'Businesses', icon: Building2 },
        { name: 'Chat', page: 'MediaSpecialistChat', icon: MessageCircle },
        { name: 'Content', page: 'ContentPipeline', icon: FileText },
        { name: 'Settings', page: 'Settings', icon: Settings }
      ];
    } else if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', page: 'Dashboard', icon: Home },
        { name: 'Businesses', page: 'Businesses', icon: Building2 },
        { name: 'Reviews', page: 'Reviews', icon: Star },
        { name: 'Content', page: 'ContentPipeline', icon: FileText }
      ];
    } else {
      // Client-only navigation - outcome focused
      return [
        { name: 'Home', page: 'ClientDashboard', icon: Home },
        { name: 'Work', page: 'ClientWork', icon: FileText },
        { name: 'Insights', page: 'ClientInsights', icon: Star },
        { name: 'Chat', page: 'ClientChat', icon: MessageCircle },
        { name: 'Reports', page: 'ClientReports', icon: BarChart3 },
        { name: 'Settings', page: 'ClientSettings', icon: Settings }
      ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-[#f5f3ed] pb-28">
      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>

      {/* Bottom Navigation - Fixed positioning with safe area */}
      <div className="fixed bottom-0 left-0 right-0 z-[99999] pointer-events-none pb-safe">
        <div className="pb-6 px-4 pointer-events-none">
          <div className="max-w-sm mx-auto pointer-events-auto">
            <div className={`backdrop-blur-xl rounded-full px-3 py-3.5 shadow-[0_8px_32px_rgba(122,138,94,0.4)] ${
              user?.role === 'admin' 
                ? 'bg-gradient-to-r from-[#7a8a5e] via-[#6d7d51] to-[#7a8a5e]'
                : 'bg-gradient-to-r from-[#8a9a6e] via-[#7a8a5e] to-[#8a9a6e]'
            }`} style={{ minWidth: isMediaSpecialist ? '450px' : (user?.role === 'admin' ? '400px' : '500px') }}>
              <div className="flex items-center justify-around">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className="relative flex items-center justify-center"
                    >
                      <div className={`transition-all duration-300 ${
                        isActive 
                          ? 'bg-white/20 backdrop-blur-sm p-3 rounded-2xl scale-110 shadow-lg' 
                          : 'p-3 hover:bg-white/10 rounded-2xl'
                      }`}>
                        <Icon className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-white' : 'text-white/60'
                        }`} />
                      </div>
                      {isActive && (
                        <div className="absolute -bottom-1 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}