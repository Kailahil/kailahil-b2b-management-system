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

        {/* Fluid Organic Stats - Bento Style */}
        <div className="relative mb-10">
          {/* Floating decorative elements */}
          <div className="absolute -top-8 right-10 w-32 h-32 bg-[#a8b88c] rounded-full opacity-10 blur-2xl animate-pulse" />
          <div className="absolute top-20 left-5 w-24 h-24 bg-[#7a8a5e] rounded-full opacity-10 blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              
              // Unique blob shapes for each card
              const blobShapes = [
                { 
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                  gridClass: 'md:col-span-2',
                  gradient: 'from-white via-[#f9f8f4] to-white',
                  iconBg: 'from-[#a8b88c] via-[#9aab7d] to-[#7a8a5e]'
                },
                { 
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
                  gridClass: 'md:col-span-2',
                  gradient: 'from-[#f9f8f4] via-white to-[#f3f1e8]',
                  iconBg: 'from-[#7a8a5e] via-[#8a9a6e] to-[#a8b88c]'
                },
                { 
                  clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                  gridClass: 'md:col-span-2',
                  gradient: 'from-white via-[#f3f1e8] to-[#f9f8f4]',
                  iconBg: 'from-[#8a9a6e] via-[#a8b88c] to-[#7a8a5e]'
                }
              ];
              
              const design = blobShapes[idx];
              
              return (
                <div key={stat.title} className={`${design.gridClass} relative group`}>
                  {/* Card with organic shape */}
                  <div className="relative h-full">
                    {/* Background with clip-path */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-br ${design.gradient} shadow-lg group-hover:shadow-2xl transition-all duration-500`}
                      style={{ 
                        clipPath: design.clipPath,
                        transform: 'scale(1)',
                        transition: 'all 0.5s ease'
                      }}
                    />
                    
                    {/* Content */}
                    <div className="relative p-8 h-full flex flex-col justify-between">
                      {/* Floating icon */}
                      <div className="relative inline-block mb-4">
                        <div className={`w-20 h-20 bg-gradient-to-br ${design.iconBg} flex items-center justify-center shadow-xl relative overflow-hidden group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}
                          style={{ 
                            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                          }}>
                          <Icon className="w-9 h-9 text-white" />
                        </div>
                        {/* Decorative dots */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#a8b88c] rounded-full opacity-60" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#7a8a5e] rounded-full opacity-60" />
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-[#6b7055] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#a8b88c] rounded-full" />
                          {stat.title}
                        </p>
                        <p className="text-6xl font-black text-[#2d3319] tracking-tighter leading-none">
                          {stat.value}
                        </p>
                        {stat.note && (
                          <div className="flex items-start gap-2 mt-3 pt-3 border-t border-[#e8e6de]">
                            <div className="w-1 h-1 bg-[#a8b88c] rounded-full mt-1.5" />
                            <p className="text-xs text-[#9ca38a] leading-relaxed">{stat.note}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Animated background elements */}
                    <div className="absolute top-2 right-2 w-16 h-16 bg-[#a8b88c] rounded-full opacity-5 group-hover:scale-150 group-hover:opacity-10 transition-all duration-700" />
                    <div className="absolute bottom-2 left-2 w-12 h-12 bg-[#7a8a5e] rounded-full opacity-5 group-hover:scale-150 group-hover:opacity-10 transition-all duration-700" style={{ transitionDelay: '0.1s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Organic Portfolio Section */}
        <div className="relative">
          {/* Morphing background blob */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#a8b88c] opacity-5 blur-3xl rounded-full" />
          
          <div className="relative bg-white/70 backdrop-blur-2xl overflow-hidden border border-white/60 shadow-2xl"
            style={{ 
              clipPath: 'polygon(0% 5%, 5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%)',
              borderRadius: '2.5rem'
            }}>
            
            {/* Header with wave effect */}
            <div className="relative px-8 py-7 bg-gradient-to-br from-white/80 to-[#f9f8f4]/50 border-b-2 border-[#e8e6de]/30 overflow-hidden">
              {/* Animated wave background */}
              <div className="absolute inset-0 opacity-30">
                <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path d="M0,0 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,120 L0,120 Z" fill="#a8b88c" opacity="0.1"/>
                </svg>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-[#8a9a6e] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-[#7a8a5e] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <h2 className="text-2xl font-black text-[#2d3319]">
                      {user?.user_role === 'client' ? 'Your Business' : 'Portfolio'}
                    </h2>
                  </div>
                  <p className="text-sm text-[#6b7055] flex items-center gap-2">
                    <span className="font-bold text-[#2d3319]">{businesses.length}</span>
                    {businesses.length === 1 ? 'business' : 'businesses'}
                    <span className="text-[#a8b88c]">•</span>
                    <span>Growing 🌱</span>
                  </p>
                </div>
                {businesses.length > 0 && user?.user_role !== 'client' && (
                  <Link 
                    to={createPageUrl('Businesses')}
                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#a8b88c] via-[#9aab7d] to-[#8a9a6e] text-white font-bold text-sm relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                    style={{ clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)' }}
                  >
                    <span>View All</span>
                    <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="p-8">
              {businesses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-[#e8e6de] to-[#d4d2c8] flex items-center justify-center relative overflow-hidden"
                    style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}>
                    <Building2 className="w-14 h-14 text-[#6b7055]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2d3319] mb-3">No businesses yet</h3>
                  <p className="text-[#6b7055] max-w-md mx-auto text-lg">
                    {user?.user_role === 'client'
                      ? 'Your agency is setting up your business profile.'
                      : 'Start your journey by adding your first business.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.slice(0, 6).map((business, idx) => {
                    // Unique organic shapes for each card
                    const clipPaths = [
                      'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
                      'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                      'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)',
                      'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
                      'polygon(18% 0%, 82% 0%, 100% 18%, 100% 82%, 82% 100%, 18% 100%, 0% 82%, 0% 18%)',
                      'polygon(12% 0%, 88% 0%, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0% 88%, 0% 12%)'
                    ];
                    
                    return (
                      <Link
                        key={business.id}
                        to={createPageUrl(`BusinessDetail?id=${business.id}`)}
                        className="block group relative"
                      >
                        {/* Card with organic clip-path */}
                        <div 
                          className="relative bg-gradient-to-br from-white via-[#f9f8f4] to-white p-6 hover:shadow-2xl transition-all duration-500 border-2 border-[#e8e6de]/40 hover:border-[#a8b88c]/60 overflow-hidden"
                          style={{ clipPath: clipPaths[idx] }}
                        >
                          {/* Animated background orbs */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-[#a8b88c] rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-700 group-hover:scale-150" />
                          <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#7a8a5e] rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-700 group-hover:scale-150" style={{ transitionDelay: '0.1s' }} />
                          
                          <div className="relative z-10">
                            {/* Business Logo/Icon with unique shape */}
                            <div className="flex items-start gap-4 mb-6">
                              {business.logo_url ? (
                                <div 
                                  className="w-18 h-18 bg-[#2d3319] flex items-center justify-center overflow-hidden shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"
                                  style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
                                >
                                  <img 
                                    src={business.logo_url} 
                                    alt={business.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div 
                                  className="w-18 h-18 bg-gradient-to-br from-[#a8b88c] via-[#9aab7d] to-[#7a8a5e] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"
                                  style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
                                >
                                  <Building2 className="w-9 h-9 text-white" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0 pt-1">
                                <h3 className="font-black text-[#2d3319] text-lg mb-1 leading-tight">{business.name}</h3>
                                <p className="text-sm text-[#6b7055] capitalize font-medium">{business.industry}</p>
                              </div>
                            </div>

                            {/* Business Info with decorative elements */}
                            <div className="flex items-center gap-2.5 flex-wrap pt-4 border-t border-[#e8e6de]/50">
                              <span 
                                className={`px-4 py-2 font-bold text-xs shadow-md ${
                                  business.status === 'active' 
                                    ? 'bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white'
                                    : 'bg-[#e8e6de] text-[#6b7055]'
                                }`}
                                style={{ clipPath: 'polygon(8% 0%, 92% 0%, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0% 92%, 0% 8%)' }}
                              >
                                {business.status}
                              </span>
                              {business.city && (
                                <span className="text-xs text-[#9ca38a] flex items-center gap-1.5 font-medium">
                                  <span className="text-base">📍</span>
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
    </div>
  );
}