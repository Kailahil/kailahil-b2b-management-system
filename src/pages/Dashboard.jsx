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
    <div className="min-h-screen bg-[#f5f3ed] px-4 py-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header with organic shape */}
        <div className="mb-8 relative">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#d4e0b3] rounded-full opacity-30 blur-2xl" />
          <div className="absolute -bottom-2 -left-2 w-32 h-32 bg-[#a8b88c] rounded-full opacity-20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-semibold text-[#2d3319] mb-2">
              Welcome back, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-[#6b7055] text-base">
              {user?.user_role === 'client' 
                ? 'View your business performance and insights'
                : 'Here\'s what\'s happening across your managed businesses'}
            </p>
          </div>
        </div>

        {/* Stats Grid - Creative Shapes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const shapes = [
              'rounded-[2rem_2rem_2rem_0.5rem]', // Organic bottom-left
              'rounded-[2rem_0.5rem_2rem_2rem]', // Organic top-right
              'rounded-[0.5rem_2rem_2rem_2rem]'  // Organic top-left
            ];
            const decorations = [
              { top: '10%', right: '15%', size: 'w-16 h-16', opacity: 'opacity-10' },
              { top: '20%', left: '10%', size: 'w-20 h-20', opacity: 'opacity-15' },
              { bottom: '15%', right: '10%', size: 'w-14 h-14', opacity: 'opacity-20' }
            ];
            return (
              <div key={stat.title} className={`bg-white ${shapes[idx]} p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden`}>
                <div className={`absolute ${decorations[idx].top ? 'top-[' + decorations[idx].top + ']' : ''} ${decorations[idx].bottom ? 'bottom-[' + decorations[idx].bottom + ']' : ''} ${decorations[idx].left ? 'left-[' + decorations[idx].left + ']' : ''} ${decorations[idx].right ? 'right-[' + decorations[idx].right + ']' : ''} ${decorations[idx].size} bg-[#a8b88c] rounded-full ${decorations[idx].opacity}`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs text-[#6b7055] mb-1 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-3xl font-bold text-[#2d3319]">
                    {stat.value}
                  </p>
                  {stat.note && (
                    <p className="text-xs text-[#9ca38a] mt-2">{stat.note}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Businesses - Creative Layout */}
        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#e8e6de] flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#2d3319]">
              {user?.user_role === 'client' ? 'Your Business' : 'Recent Businesses'}
            </h2>
            {businesses.length > 0 && user?.user_role !== 'client' && (
              <Link 
                to={createPageUrl('Businesses')}
                className="text-sm text-[#a8b88c] hover:text-[#8a9a6e] font-medium flex items-center gap-1"
              >
                View all <span className="text-lg">→</span>
              </Link>
            )}
          </div>
          <div className="p-6">
            {businesses.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No businesses yet"
                description={
                  user?.user_role === 'client'
                    ? 'Your agency is setting up your business profile.'
                    : 'Start by adding your first business to track and manage.'
                }
                actionLabel={user?.user_role === 'agency_admin' ? 'Add Business' : null}
                onAction={() => window.location.href = createPageUrl('Businesses')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.slice(0, 6).map((business, idx) => {
                  const cardShapes = [
                    'rounded-[1.5rem_1.5rem_1.5rem_0.3rem]',
                    'rounded-[1.5rem_0.3rem_1.5rem_1.5rem]',
                    'rounded-[0.3rem_1.5rem_1.5rem_1.5rem]',
                    'rounded-[1.5rem_1.5rem_0.3rem_1.5rem]',
                    'rounded-[1.5rem_0.3rem_1.5rem_1.5rem]',
                    'rounded-[1.5rem_1.5rem_1.5rem_0.3rem]'
                  ];
                  return (
                    <Link
                      key={business.id}
                      to={createPageUrl(`BusinessDetail?id=${business.id}`)}
                      className="block group"
                    >
                      <div className={`bg-gradient-to-br from-[#f9f8f4] to-[#f3f1e8] ${cardShapes[idx % 6]} p-5 hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-[#a8b88c]/30 relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#a8b88c] rounded-full opacity-5 -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                            {business.logo_url ? (
                              <div className="w-14 h-14 rounded-2xl bg-[#2d3319] flex items-center justify-center overflow-hidden shadow-sm">
                                <img 
                                  src={business.logo_url} 
                                  alt={business.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center shadow-sm">
                                <Building2 className="w-7 h-7 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[#2d3319] truncate text-base">{business.name}</h3>
                              <p className="text-sm text-[#6b7055] capitalize">{business.industry}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            <span className={`px-3 py-1.5 rounded-full font-medium ${
                              business.status === 'active' 
                                ? 'bg-[#a8b88c] text-white'
                                : 'bg-[#e8e6de] text-[#6b7055]'
                            }`}>
                              {business.status}
                            </span>
                            {business.city && <span className="text-[#9ca38a]">📍 {business.city}</span>}
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