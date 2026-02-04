import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building2, Users, TrendingUp, AlertCircle } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        // Redirect to setup if no agency_id
        if (!currentUser.agency_id) {
          window.location.href = createPageUrl('Setup');
          return;
        }
        
        setUser(currentUser);

        let businessList = [];
        
        // Load businesses based on role
        if (currentUser.user_role === 'client') {
          // Clients see only their business
          businessList = await base44.entities.Business.filter({ 
            client_user_id: currentUser.id 
          });
        } else {
          // All other roles see businesses in their agency
          businessList = await base44.entities.Business.filter({ 
            agency_id: currentUser.agency_id 
          });
        }

        setBusinesses(businessList);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Total Businesses', 
      value: businesses.length, 
      icon: Building2,
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      title: 'Active Campaigns', 
      value: 0, 
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
      note: 'Coming soon'
    },
    { 
      title: 'Team Members', 
      value: 0, 
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      note: 'Coming soon'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#c8d4a8] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Creative Header */}
        <div className="mb-10 relative">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="inline-block mb-3">
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
                  <span className="text-xs text-[#6b7055] font-medium uppercase tracking-wider">Dashboard</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#2d3319] mb-3 leading-tight">
                Hey {user?.full_name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-[#6b7055] text-lg max-w-2xl">
                {user?.user_role === 'client' 
                  ? 'Your business insights at a glance'
                  : 'Manage and grow your business portfolio'}
              </p>
            </div>
            <div className="w-20 h-20 rounded-[2rem_2rem_2rem_0.5rem] bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center shadow-lg">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Ultra Creative Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const patterns = [
              { bg: 'bg-gradient-to-br from-white to-[#f9f8f4]', accent: 'from-[#a8b88c] to-[#8a9a6e]', shape: 'rounded-[2.5rem_2.5rem_2.5rem_0.5rem]' },
              { bg: 'bg-gradient-to-bl from-white to-[#f9f8f4]', accent: 'from-[#7a8a5e] to-[#a8b88c]', shape: 'rounded-[2.5rem_0.5rem_2.5rem_2.5rem]' },
              { bg: 'bg-gradient-to-tr from-white to-[#f9f8f4]', accent: 'from-[#8a9a6e] to-[#7a8a5e]', shape: 'rounded-[0.5rem_2.5rem_2.5rem_2.5rem]' }
            ];
            const pattern = patterns[idx];
            
            return (
              <div key={stat.title} className={`${pattern.bg} ${pattern.shape} p-7 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden group`}>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
                </div>

                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-[1.2rem] bg-gradient-to-br ${pattern.accent} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#6b7055] uppercase tracking-widest font-semibold">{stat.title}</p>
                    <p className="text-5xl font-black text-[#2d3319] tracking-tight">
                      {stat.value}
                    </p>
                    {stat.note && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-1.5 h-1.5 bg-[#a8b88c] rounded-full" />
                        <p className="text-xs text-[#9ca38a]">{stat.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Revolutionary Business Cards */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl overflow-hidden border border-white/50">
          <div className="px-8 py-6 bg-gradient-to-r from-white/50 to-transparent border-b border-[#e8e6de]/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#2d3319] mb-1">
                  {user?.user_role === 'client' ? 'Your Business' : 'Your Portfolio'}
                </h2>
                <p className="text-sm text-[#6b7055]">{businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} • Growing strong 🌱</p>
              </div>
              {businesses.length > 0 && user?.user_role !== 'client' && (
                <Link 
                  to={createPageUrl('Businesses')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white rounded-full hover:shadow-lg transition-all duration-300 text-sm font-medium"
                >
                  <span>View All</span>
                  <span className="text-lg">→</span>
                </Link>
              )}
            </div>
          </div>
          
          <div className="p-8">
            {businesses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 rounded-[2rem_2rem_2rem_0.5rem] bg-gradient-to-br from-[#e8e6de] to-[#d4d2c8] flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-12 h-12 text-[#6b7055]" />
                </div>
                <h3 className="text-xl font-bold text-[#2d3319] mb-2">No businesses yet</h3>
                <p className="text-[#6b7055] max-w-md mx-auto">
                  {user?.user_role === 'client'
                    ? 'Your agency is setting up your business profile.'
                    : 'Start your journey by adding your first business.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {businesses.slice(0, 6).map((business, idx) => {
                  const shapes = [
                    'rounded-[2rem_2rem_2rem_0.4rem]',
                    'rounded-[2rem_0.4rem_2rem_2rem]',
                    'rounded-[0.4rem_2rem_2rem_2rem]',
                    'rounded-[2rem_2rem_0.4rem_2rem]',
                    'rounded-[2rem_0.4rem_2rem_2rem]',
                    'rounded-[0.4rem_2rem_2rem_2rem]'
                  ];
                  const gradients = [
                    'from-[#f9f8f4] via-white to-[#f9f8f4]',
                    'from-white via-[#f9f8f4] to-white',
                    'from-[#f9f8f4] to-white'
                  ];
                  
                  return (
                    <Link
                      key={business.id}
                      to={createPageUrl(`BusinessDetail?id=${business.id}`)}
                      className="block group"
                    >
                      <div className={`bg-gradient-to-br ${gradients[idx % 3]} ${shapes[idx % 6]} p-6 hover:shadow-2xl transition-all duration-500 border border-[#e8e6de]/30 hover:border-[#a8b88c]/50 relative overflow-hidden`}>
                        {/* Animated hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#a8b88c]/0 to-[#a8b88c]/0 group-hover:from-[#a8b88c]/5 group-hover:to-[#a8b88c]/10 transition-all duration-500" />
                        
                        <div className="relative z-10">
                          {/* Business Icon/Logo */}
                          <div className="flex items-center gap-4 mb-6">
                            {business.logo_url ? (
                              <div className="w-16 h-16 rounded-[1.2rem] bg-[#2d3319] flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                <img 
                                  src={business.logo_url} 
                                  alt={business.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-[1.2rem] bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                <Building2 className="w-8 h-8 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-[#2d3319] truncate text-lg mb-1">{business.name}</h3>
                              <p className="text-sm text-[#6b7055] capitalize">{business.industry}</p>
                            </div>
                          </div>

                          {/* Business Info */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-4 py-1.5 rounded-full font-semibold text-xs shadow-sm ${
                              business.status === 'active' 
                                ? 'bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white'
                                : 'bg-[#e8e6de] text-[#6b7055]'
                            }`}>
                              {business.status}
                            </span>
                            {business.city && (
                              <span className="text-xs text-[#9ca38a] flex items-center gap-1">
                                <span>📍</span>
                                <span>{business.city}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}