import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Building2, Users, TrendingUp } from 'lucide-react';
import GreenSection from '../components/glass/GreenSection';
import FloatingCard from '../components/glass/FloatingCard';
import PillButton from '../components/glass/PillButton';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <GreenSection>
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">
            Welcome back, {user?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-cream-surface/80 text-lg">
            {user?.user_role === 'client' 
              ? 'View your business performance and insights'
              : 'Here\'s what\'s happening across your managed businesses'}
          </p>
        </div>
        
        {/* Stats embedded in green section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <FloatingCard key={stat.title} className="bg-cream-card/95">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary-green/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-green-dark" />
                  </div>
                </div>
                <p className="text-sm font-medium text-text-secondary mb-1">{stat.title}</p>
                <p className="text-4xl font-semibold text-text-primary mb-1">
                  {stat.value}
                </p>
                {stat.note && (
                  <p className="text-xs text-text-secondary">{stat.note}</p>
                )}
              </FloatingCard>
            );
          })}
        </div>
      </GreenSection>

      {/* Recent Businesses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-text-primary">
            {user?.user_role === 'client' ? 'Your Business' : 'Recent Businesses'}
          </h2>
          {businesses.length > 0 && user?.user_role !== 'client' && (
            <Link to={createPageUrl('Businesses')}>
              <PillButton variant="green">
                View all
              </PillButton>
            </Link>
          )}
        </div>

        {businesses.length === 0 ? (
          <FloatingCard>
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
          </FloatingCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {businesses.slice(0, 6).map((business) => (
              <Link
                key={business.id}
                to={createPageUrl(`BusinessDetail?id=${business.id}`)}
                className="block"
              >
                <FloatingCard hover>
                  <div className="flex items-center gap-4 mb-4">
                    {business.logo_url ? (
                      <img 
                        src={business.logo_url} 
                        alt={business.name}
                        className="w-14 h-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-primary-green/20 flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-primary-green-dark" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary truncate text-lg">{business.name}</h3>
                      <p className="text-sm text-text-secondary capitalize">{business.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PillButton 
                      variant={business.status === 'active' ? 'green' : 'cream'}
                      className="text-xs"
                    >
                      {business.status}
                    </PillButton>
                    {business.city && (
                      <span className="text-xs text-text-secondary">📍 {business.city}</span>
                    )}
                  </div>
                </FloatingCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}