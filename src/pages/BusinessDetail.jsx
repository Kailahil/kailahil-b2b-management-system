import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Link as LinkIcon, TrendingUp, Lightbulb, FileText, Target } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';
import IntegrationCard from '../components/shared/IntegrationCard';
import LinkTikTokDialog from '../components/businesses/LinkTikTokDialog';
import OnboardingChecklist from '../components/businesses/OnboardingChecklist';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';

export default function BusinessDetail() {
  const [business, setBusiness] = useState(null);
  const [user, setUser] = useState(null);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [reviewSources, setReviewSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [showTikTokDialog, setShowTikTokDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const businessId = urlParams.get('id');

        if (!businessId) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const businessData = await base44.entities.Business.filter({ id: businessId });
        
        if (!businessData || businessData.length === 0) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        const bizData = businessData[0];

        // Security check: verify user has access to this business
        if (currentUser.user_role === 'client' && bizData.client_user_id !== currentUser.id) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        if (currentUser.user_role !== 'client' && bizData.agency_id !== currentUser.agency_id) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        setBusiness(bizData);

        // Load social accounts
        const socialAccountData = await base44.entities.SocialAccount.filter({ 
          business_id: businessId 
        });
        setSocialAccounts(socialAccountData);

        // Load review sources
        const reviewSourceData = await base44.entities.ReviewSource.filter({ 
          business_id: businessId 
        });
        setReviewSources(reviewSourceData);
      } catch (error) {
        console.error('Failed to load business:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleConnectIntegration = async (platform) => {
    if (platform === 'tiktok') {
      const tiktokAccount = socialAccounts.find(acc => acc.platform === 'tiktok');
      
      // If already pending, just open dialog to update
      if (tiktokAccount?.connected_status === 'pending') {
        setShowTikTokDialog(true);
        return;
      }

      // Try OAuth sync first
      setConnecting('tiktok');
      try {
        const response = await base44.functions.invoke('syncTikTok', {
          business_id: business.id
        });

        if (response.data.success) {
          const updatedAccounts = await base44.entities.SocialAccount.filter({ 
            business_id: business.id 
          });
          setSocialAccounts(updatedAccounts);
          alert(`TikTok connected successfully! Synced ${response.data.records_written} records.`);
        }
      } catch (error) {
        console.error('TikTok OAuth not available:', error);
        // OAuth not set up, fall back to manual entry
        setConnecting(null);
        setShowTikTokDialog(true);
      } finally {
        setConnecting(null);
      }
    } else {
      alert(`Connect ${platform} - Integration flow coming soon`);
    }
  };

  const handleLinkTikTok = async (formData) => {
    setIsSubmitting(true);
    try {
      // Find or update the TikTok social account
      const socialAccountData = await base44.entities.SocialAccount.filter({ 
        business_id: business.id,
        platform: 'tiktok'
      });

      if (socialAccountData.length > 0) {
        await base44.entities.SocialAccount.update(socialAccountData[0].id, {
          connected_status: 'pending',
          handle: formData.handle,
          external_account_id: formData.profile_url
        });
      } else {
        await base44.entities.SocialAccount.create({
          agency_id: business.agency_id,
          business_id: business.id,
          platform: 'tiktok',
          connected_status: 'pending',
          handle: formData.handle,
          external_account_id: formData.profile_url
        });
      }

      // Refresh social accounts
      const updatedAccounts = await base44.entities.SocialAccount.filter({ 
        business_id: business.id 
      });
      setSocialAccounts(updatedAccounts);
      
      setShowTikTokDialog(false);
      alert('TikTok account linked! Analytics will appear once API connection is complete.');
    } catch (error) {
      console.error('Failed to link TikTok:', error);
      alert('Failed to link TikTok account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f3ed]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  if (!business) {
    return null;
  }

  // Map integrations from actual data
  const integrationMap = {};
  
  socialAccounts.forEach(acc => {
    integrationMap[acc.platform] = {
      status: acc.connected_status,
      accountName: acc.handle,
      lastSync: acc.last_sync_at
    };
  });

  reviewSources.forEach(src => {
    integrationMap['google_reviews'] = {
      status: src.connected_status,
      accountName: src.place_id ? 'Google Business' : null,
      lastSync: src.last_sync_at
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back Button */}
        <Link 
          to={createPageUrl('Businesses')}
          className="inline-flex items-center gap-2 text-[#6b7055] hover:text-[#2d3319] mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Businesses
        </Link>

        {/* Business Header */}
        <div className="bg-gradient-to-br from-white via-[#f9f8f4] to-white rounded-[3rem_3rem_3rem_1rem] p-8 mb-6 shadow-xl border border-[#e8e6de]/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#a8b88c]/5 rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 flex items-start gap-6">
            {business.logo_url ? (
              <div className="w-24 h-24 rounded-[1.8rem_1.8rem_1.8rem_0.4rem] overflow-hidden shadow-xl">
                <img 
                  src={business.logo_url} 
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-[1.8rem_1.8rem_1.8rem_0.4rem] bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center flex-shrink-0 shadow-xl">
                <Building2 className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[#2d3319] mb-2">{business.name}</h1>
              <p className="text-[#6b7055] text-lg capitalize mb-4">{business.industry}</p>
              <div className="flex flex-wrap gap-4 text-sm text-[#9ca38a]">
                {business.city && (
                  <span className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
                    <span>📍</span>
                    <span className="font-medium">{business.city}{business.state ? `, ${business.state}` : ''}</span>
                  </span>
                )}
                {business.phone && (
                  <span className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
                    <span>📞</span>
                    <span className="font-medium">{business.phone}</span>
                  </span>
                )}
                {business.website && (
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#a8b88c]/10 hover:bg-[#a8b88c]/20 px-4 py-2 rounded-full transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span className="font-medium">Website</span>
                  </a>
                )}
              </div>
            </div>
            <span className={`px-5 py-2 rounded-full font-bold text-sm shadow-md ${
              business.status === 'active' 
                ? 'bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white'
                : 'bg-[#e8e6de] text-[#6b7055]'
            }`}>
              {business.status}
            </span>
          </div>
        </div>

      {/* Onboarding Checklist */}
      <div className="mb-6">
        <OnboardingChecklist 
          business={business}
          socialAccounts={socialAccounts}
          reviewSources={reviewSources}
        />
      </div>

      {/* Integrations Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem_2.5rem_2.5rem_1rem] shadow-xl border border-[#e8e6de]/30 mb-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a8b88c]/5 rounded-full -ml-32 -mb-32" />
        
        <div className="relative z-10 p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-[#2d3319] mb-2">Integrations</h2>
            <p className="text-[#6b7055]">Connect platforms to pull real data and metrics</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <IntegrationCard
              platform="tiktok"
              status={integrationMap['tiktok']?.status || 'disconnected'}
              accountName={integrationMap['tiktok']?.accountName}
              lastSync={integrationMap['tiktok']?.lastSync}
              onConnect={() => handleConnectIntegration('tiktok')}
              isConnecting={connecting === 'tiktok'}
            />
            <IntegrationCard
              platform="instagram"
              status={integrationMap['instagram']?.status || 'disconnected'}
              accountName={integrationMap['instagram']?.accountName}
              lastSync={integrationMap['instagram']?.lastSync}
              onConnect={() => handleConnectIntegration('instagram')}
              isConnecting={connecting === 'instagram'}
            />
            <IntegrationCard
              platform="google_reviews"
              status={integrationMap['google_reviews']?.status || 'disconnected'}
              accountName={integrationMap['google_reviews']?.accountName}
              lastSync={integrationMap['google_reviews']?.lastSync}
              onConnect={() => handleConnectIntegration('google_reviews')}
              isConnecting={connecting === 'google_reviews'}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white via-[#f9f8f4] to-white rounded-[2rem_2rem_2rem_1rem] shadow-xl border border-[#e8e6de]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a8b88c]/5 rounded-full -mr-48 -mt-48" />
        
        <div className="relative z-10 p-8">
          <h2 className="text-3xl font-bold text-[#2d3319] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to={createPageUrl('ExecutiveDashboard') + `?id=${business.id}`}
                className="p-6 rounded-[1.5rem_1.5rem_1.5rem_0.5rem] bg-white border border-[#e8e6de]/30 hover:border-[#a8b88c]/50 hover:shadow-lg transition-all duration-500 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[1rem_1rem_1rem_0.3rem] bg-gradient-to-br from-[#a8b88c] to-[#8a9a6e] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2d3319] mb-1">Executive Dashboard</h3>
                    <p className="text-sm text-[#6b7055]">AI-powered business insights</p>
                  </div>
                </div>
              </Link>
              <Link 
                to={createPageUrl('AIInsights') + `?id=${business.id}`}
                className="p-6 rounded-[1.5rem_0.5rem_1.5rem_1.5rem] bg-white border border-[#e8e6de]/30 hover:border-[#a8b88c]/50 hover:shadow-lg transition-all duration-500 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[1rem_0.3rem_1rem_1rem] bg-gradient-to-br from-[#8a9a6e] to-[#7a8a5e] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500">
                    <Lightbulb className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2d3319] mb-1">AI Insights</h3>
                    <p className="text-sm text-[#6b7055]">Issues, opportunities & action plans</p>
                  </div>
                </div>
              </Link>
              <Link 
                to={createPageUrl('BusinessAnalytics') + `?id=${business.id}`}
                className="p-6 rounded-[0.5rem_1.5rem_1.5rem_1.5rem] bg-white border border-[#e8e6de]/30 hover:border-[#a8b88c]/50 hover:shadow-lg transition-all duration-500 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[0.3rem_1rem_1rem_1rem] bg-gradient-to-br from-[#7a8a5e] to-[#a8b88c] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2d3319] mb-1">View Analytics</h3>
                    <p className="text-sm text-[#6b7055]">Performance metrics & insights</p>
                  </div>
                </div>
              </Link>
              <Link 
                to={createPageUrl('ClientReports') + `?id=${business.id}`}
                className="p-6 rounded-[1.5rem_1.5rem_0.5rem_1.5rem] bg-white border border-[#e8e6de]/30 hover:border-[#a8b88c]/50 hover:shadow-lg transition-all duration-500 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[1rem_1rem_0.3rem_1rem] bg-gradient-to-br from-[#a8b88c] to-[#d4e0b3] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2d3319] mb-1">Client Reports</h3>
                    <p className="text-sm text-[#6b7055]">Monthly performance reports</p>
                  </div>
                </div>
              </Link>
              <Link 
                to={createPageUrl('GrowthPlanner') + `?id=${business.id}`}
                className="p-6 rounded-[1.5rem_1.5rem_1.5rem_0.5rem] bg-white border border-[#e8e6de]/30 hover:border-[#a8b88c]/50 hover:shadow-lg transition-all duration-500 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[1rem_1rem_1rem_0.3rem] bg-gradient-to-br from-[#d4e0b3] to-[#a8b88c] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2d3319] mb-1">Growth Planner</h3>
                    <p className="text-sm text-[#6b7055]">30-day actionable plans</p>
                  </div>
                </div>
              </Link>
            </div>
        </div>
      </div>

        {/* Link TikTok Dialog */}
        <LinkTikTokDialog
          open={showTikTokDialog}
          onClose={() => setShowTikTokDialog(false)}
          onSubmit={handleLinkTikTok}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}