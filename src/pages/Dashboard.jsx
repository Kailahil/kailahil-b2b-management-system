import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building2, Users, TrendingUp, AlertCircle } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';

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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Welcome back, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500">
          {user?.user_role === 'client' 
            ? 'View your business performance and insights'
            : 'Here\'s what\'s happening across your managed businesses'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-8 -mt-8`}></div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                    <CardTitle className="text-4xl font-bold text-slate-900">
                      {stat.value}
                    </CardTitle>
                    {stat.note && (
                      <p className="text-xs text-slate-400 mt-2">{stat.note}</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Recent Businesses */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">
              {user?.user_role === 'client' ? 'Your Business' : 'Recent Businesses'}
            </CardTitle>
            {businesses.length > 0 && user?.user_role !== 'client' && (
              <Link 
                to={createPageUrl('Businesses')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
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
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-indigo-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        {business.logo_url ? (
                          <img 
                            src={business.logo_url} 
                            alt={business.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-indigo-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{business.name}</h3>
                          <p className="text-sm text-slate-500 capitalize">{business.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className={`px-2 py-1 rounded-full ${
                          business.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {business.status}
                        </span>
                        {business.city && <span>• {business.city}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}