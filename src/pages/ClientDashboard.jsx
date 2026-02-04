import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';
import { Building2, TrendingUp, Users, Calendar, Star, BarChart3 } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        if (!currentUser.agency_id) {
          window.location.href = createPageUrl('Setup');
          return;
        }

        // Redirect non-clients to the agency dashboard
        if (currentUser.user_role !== 'client') {
          window.location.href = createPageUrl('Dashboard');
          return;
        }
        
        setUser(currentUser);

        // Load client's business
        const businessList = await base44.entities.Business.filter({ 
          client_user_id: currentUser.id 
        });

        if (businessList.length > 0) {
          setBusiness(businessList[0]);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  const quickLinks = [
    { label: 'Analytics', page: 'BusinessAnalytics', icon: BarChart3, color: 'from-[#a8b88c] to-[#8a9a6e]' },
    { label: 'Reviews', page: 'Reviews', icon: Star, color: 'from-[#8a9a6e] to-[#7a8a5e]' },
    { label: 'Content', page: 'ContentPipeline', icon: Calendar, color: 'from-[#7a8a5e] to-[#a8b88c]' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698235382c78cdec3bacea2f/06a1de1f9_DesignTransparentbackground-02.png" 
            alt="Logo" 
            className="h-16 md:h-20 w-auto"
          />
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-block mb-3">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
              <span className="text-xs text-[#6b7055] font-medium uppercase tracking-wider">Client Dashboard</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2d3319] mb-3 leading-tight">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-[#6b7055] text-lg">
            Your business performance and insights
          </p>
        </div>

        {!business ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-[3rem_3rem_3rem_1rem] p-12 text-center shadow-lg">
            <div className="w-28 h-28 rounded-[2.5rem_2.5rem_2.5rem_0.5rem] bg-gradient-to-br from-[#e8e6de] to-[#d4d2c8] flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-14 h-14 text-[#6b7055]" />
            </div>
            <h3 className="text-2xl font-bold text-[#2d3319] mb-3">Setting up your business</h3>
            <p className="text-[#6b7055] text-lg max-w-md mx-auto">
              Your agency is currently setting up your business profile. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Business Card */}
            <div className="bg-gradient-to-br from-white via-[#f9f8f4] to-white rounded-[3rem_3rem_3rem_1rem] p-8 shadow-xl border border-[#e8e6de]/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#a8b88c]/5 rounded-full -mr-32 -mt-32" />
              
              <div className="relative z-10 flex items-start gap-6">
                {business.logo_url ? (
                  <div className="w-24 h-24 rounded-[1.8rem_1.8rem_1.8rem_0.4rem] bg-[#2d3319] flex items-center justify-center overflow-hidden shadow-xl">
                    <img 
                      src={business.logo_url} 
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-[1.8rem_1.8rem_1.8rem_0.4rem] bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center shadow-xl">
                    <Building2 className="w-12 h-12 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-[#2d3319] mb-2">{business.name}</h3>
                  <p className="text-lg text-[#6b7055] capitalize mb-4">{business.industry}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-5 py-2 rounded-full font-bold text-sm shadow-md ${
                      business.status === 'active' 
                        ? 'bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white'
                        : 'bg-[#e8e6de] text-[#6b7055]'
                    }`}>
                      {business.status}
                    </span>
                    {business.city && (
                      <span className="text-sm text-[#9ca38a] flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
                        <span>📍</span>
                        <span className="font-medium">{business.city}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="text-2xl font-bold text-[#2d3319] mb-4">Quick Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickLinks.map((link, idx) => {
                  const Icon = link.icon;
                  const shapes = [
                    'rounded-[2rem_2rem_2rem_0.5rem]',
                    'rounded-[2rem_0.5rem_2rem_2rem]',
                    'rounded-[0.5rem_2rem_2rem_2rem]'
                  ];
                  
                  return (
                    <Link
                      key={link.page}
                      to={createPageUrl(`${link.page}?id=${business.id}`)}
                      className="block group"
                    >
                      <div className={`bg-white ${shapes[idx]} p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-[#e8e6de]/30 hover:border-[#a8b88c]/50 relative overflow-hidden`}>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#a8b88c]/5 rounded-full -mr-12 -mb-12 group-hover:scale-150 transition-transform duration-700" />
                        
                        <div className="relative z-10">
                          <div className={`w-14 h-14 rounded-[1rem_1rem_1rem_0.3rem] bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-500`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-[#2d3319]">{link.label}</h3>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}