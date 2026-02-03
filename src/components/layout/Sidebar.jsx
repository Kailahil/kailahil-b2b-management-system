import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Home, Building2, Settings, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Sidebar({ currentPageName, user, isOpen, onClose }) {
  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const navigation = [
    { name: 'Dashboard', page: 'Dashboard', icon: Home },
    { name: 'Businesses', page: 'Businesses', icon: Building2 },
    { name: 'Settings', page: 'Settings', icon: Settings },
  ];

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white w-64 fixed left-0 top-0 z-40 transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight">Marketing ERP</h1>
        <p className="text-xs text-slate-400 mt-1">Multi-tenant SaaS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white/10 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.user_role?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full mt-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}