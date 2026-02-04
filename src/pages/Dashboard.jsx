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
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698235382c78cdec3bacea2f/06a1de1f9_DesignTransparentbackground-02.png" 
            alt="Logo" 
            className="h-16 md:h-20 w-auto"
          />
        </div>

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
                Manage your client portfolio and drive growth
              </p>
              <div className="inline-flex items-center gap-2 bg-[#a8b88c]/10 px-4 py-2 rounded-full mt-3">
                <span className="text-xs font-bold text-[#7a8a5e] uppercase tracking-wider">Media Specialist Dashboard</span>
              </div>
            </div>
            <div className="w-20 h-20 rounded-[2rem_2rem_2rem_0.5rem] bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center shadow-lg">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Creative Asymmetric Stats */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
          {/* First stat - Large organic shape */}
          <div className="md:col-span-5">
            <div className="bg-gradient-to-br from-white via-[#f9f8f4] to-white rounded-[3rem_3rem_3rem_1rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#a8b88c]/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#7a8a5e]/10 rounded-full -ml-16 -mb-16" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-[1.5rem_1.5rem_1.5rem_0.3rem] bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center mb-6 shadow-lg group-hover:rotate-6 transition-transform duration-500">
                  {React.createElement(stats[0].icon, { className: "w-10 h-10 text-white" })}
                </div>
                <p className="text-xs text-[#6b7055] uppercase tracking-[0.2em] font-bold mb-2">{stats[0].title}</p>
                <p className="text-6xl font-black text-[#2d3319] mb-3">{stats[0].value}</p>
                {stats[0].note && (
                  <div className="inline-flex items-center gap-2 bg-[#f5f3ed] px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
                    <p className="text-xs text-[#6b7055]">{stats[0].note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Second and Third stats - Stacked organic shapes */}
          <div className="md:col-span-7 space-y-4">
            {stats.slice(1).map((stat, idx) => {
              const Icon = stat.icon;
              const shapes = [
                'rounded-[2.5rem_1rem_2.5rem_2.5rem]',
                'rounded-[1rem_2.5rem_2.5rem_2.5rem]'
              ];
              const gradients = [
                'from-[#f9f8f4] to-white',
                'from-white to-[#f9f8f4]'
              ];
              
              return (
                <div key={stat.title} className={`bg-gradient-to-r ${gradients[idx]} ${shapes[idx]} p-6 shadow-lg hover:shadow-xl transition-all duration-500 relative overflow-hidden group`}>
                  <div className="absolute top-1/2 right-0 w-32 h-32 bg-[#a8b88c]/5 rounded-full -mr-16 transform -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-[1.2rem_1.2rem_1.2rem_0.3rem] bg-gradient-to-br from-[#8a9a6e] to-[#a8b88c] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#6b7055] uppercase tracking-[0.15em] font-bold mb-1">{stat.title}</p>
                      <p className="text-4xl font-black text-[#2d3319]">{stat.value}</p>
                      {stat.note && (
                        <p className="text-xs text-[#9ca38a] mt-2 flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-[#a8b88c] rounded-full" />
                          {stat.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Organic Business Cards with Creative Layouts */}
        <div className="space-y-6">
          {/* Header with organic shape */}
          <div className="flex items-end justify-between gap-4 mb-2">
            <div>
              <h2 className="text-3xl font-bold text-[#2d3319] mb-2">
                Your Portfolio
              </h2>
              <div className="flex items-center gap-2">
                <div className="px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-[#e8e6de]">
                  <p className="text-sm text-[#6b7055] font-medium">{businesses.length} active</p>
                </div>
                <span className="text-2xl">🌱</span>
              </div>
            </div>
            {businesses.length > 0 && (
              <Link 
                to={createPageUrl('Businesses')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white rounded-full hover:shadow-lg transition-all duration-300 font-medium"
              >
                <span>View All</span>
                <span className="text-lg">→</span>
              </Link>
            )}
          </div>
          
          {businesses.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-[3rem_3rem_3rem_1rem] p-12 text-center shadow-lg">
              <div className="w-28 h-28 rounded-[2.5rem_2.5rem_2.5rem_0.5rem] bg-gradient-to-br from-[#e8e6de] to-[#d4d2c8] flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-14 h-14 text-[#6b7055]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2d3319] mb-3">No clients yet</h3>
              <p className="text-[#6b7055] text-lg max-w-md mx-auto">
                Start by adding your first client business to manage.
              </p>
            </div>
          ) : businesses.length === 1 ? (
            /* Single business - Large featured card */
            <Link
              to={createPageUrl(`BusinessDetail?id=${businesses[0].id}`)}
              className="block group"
            >
              <div className="bg-gradient-to-br from-white via-[#f9f8f4] to-white rounded-[3rem_3rem_3rem_1rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-[#e8e6de]/50 hover:border-[#a8b88c]/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#a8b88c]/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative z-10 flex items-start gap-6">
                  {businesses[0].logo_url ? (
                    <div className="w-24 h-24 rounded-[1.8rem_1.8rem_1.8rem_0.4rem] bg-[#2d3319] flex items-center justify-center overflow-hidden shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                      <img 
                        src={businesses[0].logo_url} 
                        alt={businesses[0].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-[1.8rem_1.8rem_1.8rem_0.4rem] bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                      <Building2 className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-[#2d3319] mb-2">{businesses[0].name}</h3>
                    <p className="text-lg text-[#6b7055] capitalize mb-4">{businesses[0].industry}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-5 py-2 rounded-full font-bold text-sm shadow-md ${
                        businesses[0].status === 'active' 
                          ? 'bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white'
                          : 'bg-[#e8e6de] text-[#6b7055]'
                      }`}>
                        {businesses[0].status}
                      </span>
                      {businesses[0].city && (
                        <span className="text-sm text-[#9ca38a] flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
                          <span>📍</span>
                          <span className="font-medium">{businesses[0].city}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            /* Multiple businesses - Creative masonry-style layout */
            <div className="space-y-4">
              {/* First row - 2 cards side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businesses.slice(0, 2).map((business, idx) => (
                  <Link
                    key={business.id}
                    to={createPageUrl(`BusinessDetail?id=${business.id}`)}
                    className="block group"
                  >
                    <div className={`bg-gradient-to-br from-white to-[#f9f8f4] ${idx === 0 ? 'rounded-[2.5rem_2.5rem_2.5rem_0.8rem]' : 'rounded-[2.5rem_0.8rem_2.5rem_2.5rem]'} p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#e8e6de]/30 hover:border-[#a8b88c]/50 relative overflow-hidden h-full`}>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#a8b88c]/5 rounded-full -mr-16 -mb-16 group-hover:scale-150 transition-transform duration-700" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-5">
                          {business.logo_url ? (
                            <div className="w-16 h-16 rounded-[1.2rem_1.2rem_1.2rem_0.3rem] bg-[#2d3319] flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-500">
                              <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-[1.2rem_1.2rem_1.2rem_0.3rem] bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                              <Building2 className="w-8 h-8 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#2d3319] text-xl mb-1 truncate">{business.name}</h3>
                            <p className="text-sm text-[#6b7055] capitalize">{business.industry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-4 py-1.5 rounded-full font-bold text-xs ${
                            business.status === 'active' 
                              ? 'bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white shadow-md'
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
                ))}
              </div>

              {/* Remaining businesses - 3 column grid */}
              {businesses.length > 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {businesses.slice(2, 8).map((business, idx) => {
                    const shapes = [
                      'rounded-[2rem_2rem_2rem_0.5rem]',
                      'rounded-[2rem_0.5rem_2rem_2rem]',
                      'rounded-[0.5rem_2rem_2rem_2rem]',
                      'rounded-[2rem_2rem_0.5rem_2rem]',
                      'rounded-[2rem_0.5rem_2rem_2rem]',
                      'rounded-[0.5rem_2rem_2rem_2rem]'
                    ];
                    
                    return (
                      <Link
                        key={business.id}
                        to={createPageUrl(`BusinessDetail?id=${business.id}`)}
                        className="block group"
                      >
                        <div className={`bg-white ${shapes[idx % 6]} p-5 shadow-md hover:shadow-xl transition-all duration-500 border border-[#e8e6de]/30 hover:border-[#a8b88c]/50 relative overflow-hidden`}>
                          <div className="absolute top-0 right-0 w-24 h-24 bg-[#a8b88c]/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                          
                          <div className="relative z-10">
                            <div className="mb-4">
                              {business.logo_url ? (
                                <div className="w-14 h-14 rounded-[1rem_1rem_1rem_0.2rem] bg-[#2d3319] flex items-center justify-center overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-500 mb-3">
                                  <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-14 h-14 rounded-[1rem_1rem_1rem_0.2rem] bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 mb-3">
                                  <Building2 className="w-7 h-7 text-white" />
                                </div>
                              )}
                              <h3 className="font-bold text-[#2d3319] text-base mb-1 truncate">{business.name}</h3>
                              <p className="text-xs text-[#6b7055] capitalize truncate">{business.industry}</p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-3 py-1 rounded-full font-semibold text-[10px] ${
                                business.status === 'active' 
                                  ? 'bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white'
                                  : 'bg-[#e8e6de] text-[#6b7055]'
                              }`}>
                                {business.status}
                              </span>
                              {business.city && (
                                <span className="text-[10px] text-[#9ca38a]">📍 {business.city}</span>
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
          )}
        </div>
      </div>
    </div>
  );
}