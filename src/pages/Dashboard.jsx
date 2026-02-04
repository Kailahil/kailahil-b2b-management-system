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
    <div className="min-h-screen bg-[#f5f3ed] px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#2d3319] mb-2">
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-[#6b7055] text-base">
            {user?.user_role === 'client' 
              ? 'View your business performance and insights'
              : 'Here\'s what\'s happening across your managed businesses'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#a8b88c] flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <p className="text-sm text-[#6b7055] mb-2">{stat.title}</p>
                <p className="text-4xl font-bold text-[#2d3319] mb-1">
                  {stat.value}
                </p>
                {stat.note && (
                  <p className="text-xs text-[#9ca38a] mt-2">{stat.note}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent Businesses */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#e8e6de]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#2d3319]">
                {user?.user_role === 'client' ? 'Your Business' : 'Recent Businesses'}
              </h2>
              {businesses.length > 0 && user?.user_role !== 'client' && (
                <Link 
                  to={createPageUrl('Businesses')}
                  className="text-sm text-[#a8b88c] hover:text-[#8a9a6e] font-medium"
                >
                  View all →
                </Link>
              )}
            </div>
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
                {businesses.slice(0, 6).map((business) => (
                  <Link
                    key={business.id}
                    to={createPageUrl(`BusinessDetail?id=${business.id}`)}
                    className="block"
                  >
                    <div className="bg-[#f9f8f4] rounded-2xl p-5 hover:bg-[#f3f1e8] transition-all duration-300 cursor-pointer border border-transparent hover:border-[#a8b88c]/30">
                      <div className="flex items-center gap-3 mb-4">
                        {business.logo_url ? (
                          <div className="w-14 h-14 rounded-2xl bg-[#2d3319] flex items-center justify-center overflow-hidden">
                            <img 
                              src={business.logo_url} 
                              alt={business.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-[#a8b88c] flex items-center justify-center">
                            <Building2 className="w-7 h-7 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#2d3319] truncate text-base">{business.name}</h3>
                          <p className="text-sm text-[#6b7055] capitalize">{business.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-3 py-1.5 rounded-full font-medium ${
                          business.status === 'active' 
                            ? 'bg-[#a8b88c] text-white'
                            : 'bg-[#e8e6de] text-[#6b7055]'
                        }`}>
                          {business.status}
                        </span>
                        {business.city && <span className="text-[#9ca38a]">• {business.city}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}