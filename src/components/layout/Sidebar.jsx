import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Home, Building2, Settings, LogOut, Video, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Sidebar({ currentPageName, user, isOpen, onClose }) {
  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const navigation = [
    { name: 'Dashboard', page: 'Dashboard', icon: Home },
    { name: 'Businesses', page: 'Businesses', icon: Building2 },
    { name: 'Content Pipeline', page: 'ContentPipeline', icon: Video },
    { name: 'Reviews', page: 'Reviews', icon: MessageSquare },
    { name: 'Settings', page: 'Settings', icon: Settings },
  ];

  return (
    <div className={`flex flex-col h-full bg-cream-surface/90 backdrop-blur-2xl border-r border-white/20 text-text-primary w-64 fixed left-0 top-0 z-40 transition-transform duration-300 lg:translate-x-0 shadow-[8px_0_32px_0_rgba(134,168,134,0.08)] ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <h1 className="text-2xl font-bold tracking-tight text-primary-green-dark">Marketing ERP</h1>
        <p className="text-xs text-text-secondary mt-1">Multi-tenant SaaS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-green/20 text-primary-green-dark shadow-sm'
                  : 'text-text-secondary hover:bg-cream-surface/60 hover:text-text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-3 px-4 py-3 bg-cream-surface/50 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-green to-primary-green-dark flex items-center justify-center text-cream-surface font-semibold">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-text-primary">{user?.full_name}</p>
            <p className="text-xs text-text-secondary truncate">{user?.user_role?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full mt-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-cream-surface/50 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}