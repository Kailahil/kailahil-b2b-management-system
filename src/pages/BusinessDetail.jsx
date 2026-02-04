import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import GlassCard from '../components/glass/GlassCard';
import GlassBadge from '../components/glass/GlassBadge';
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
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
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <Link 
        to={createPageUrl('Businesses')}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Businesses
      </Link>

      {/* Business Header */}
      <GlassCard className="mb-8">
        <div className="p-8">
          <div className="flex items-start gap-6">
            {business.logo_url ? (
              <img 
                src={business.logo_url} 
                alt={business.name}
                className="w-24 h-24 rounded-[20px] object-cover shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-[20px] bg-gradient-to-br from-primary-green/20 to-primary-green/40 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Building2 className="w-12 h-12 text-primary-green-dark" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-semibold text-text-primary mb-2">{business.name}</h1>
              <p className="text-text-secondary capitalize mb-4 text-lg">{business.industry}</p>
              <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                {business.city && (
                  <span>📍 {business.city}{business.state ? `, ${business.state}` : ''}</span>
                )}
                {business.phone && (
                  <span>📞 {business.phone}</span>
                )}
                {business.website && (
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-green-dark hover:text-primary-green transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
            <GlassBadge variant={business.status === 'active' ? 'success' : 'default'}>
              {business.status}
            </GlassBadge>
          </div>
        </div>
      </GlassCard>

      {/* Onboarding Checklist */}
      <div className="mb-8">
        <OnboardingChecklist 
          business={business}
          socialAccounts={socialAccounts}
          reviewSources={reviewSources}
        />
      </div>

      {/* Integrations Section */}
      <GlassCard className="mb-8">
        <div className="p-8 border-b border-white/10">
          <h2 className="text-2xl font-semibold text-text-primary">Integrations</h2>
          <p className="text-text-secondary text-sm mt-2">Connect platforms to pull real data and metrics</p>
        </div>
        <div className="p-8">
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
      </GlassCard>

      {/* Quick Actions */}
      <GlassCard>
        <div className="p-8 border-b border-white/10">
          <h2 className="text-2xl font-semibold text-text-primary">Quick Actions</h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Link 
                to={createPageUrl('ExecutiveDashboard') + `?id=${business.id}`}
                className="p-5 rounded-[20px] border border-white/15 bg-cream-surface/30 hover:bg-cream-surface/50 hover:border-white/25 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[16px] bg-purple-100/60 group-hover:bg-purple-100/80 flex items-center justify-center shadow-sm transition-all">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary text-base">Executive Dashboard</h3>
                    <p className="text-sm text-text-secondary mt-0.5">AI-powered business insights</p>
                  </div>
                </div>
              </Link>
              <Link 
                to={createPageUrl('AIInsights') + `?id=${business.id}`}
                className="p-5 rounded-[20px] border border-white/15 bg-cream-surface/30 hover:bg-cream-surface/50 hover:border-white/25 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[16px] bg-primary-green/20 group-hover:bg-primary-green/30 flex items-center justify-center shadow-sm transition-all">
                    <Lightbulb className="w-6 h-6 text-primary-green-dark" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary text-base">AI Insights</h3>
                    <p className="text-sm text-text-secondary mt-0.5">Issues, opportunities & action plans</p>
                  </div>
                </div>
              </Link>
              <Link 
                to={createPageUrl('BusinessAnalytics') + `?id=${business.id}`}
                className="p-5 rounded-[20px] border border-white/15 bg-cream-surface/30 hover:bg-cream-surface/50 hover:border-white/25 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[16px] bg-blue-100/60 group-hover:bg-blue-100/80 flex items-center justify-center shadow-sm transition-all">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary text-base">View Analytics</h3>
                    <p className="text-sm text-text-secondary mt-0.5">Performance metrics & insights</p>
                  </div>
                </div>
              </Link>
              <Link 
                to={createPageUrl('ClientReports') + `?id=${business.id}`}
                className="p-5 rounded-[20px] border border-white/15 bg-cream-surface/30 hover:bg-cream-surface/50 hover:border-white/25 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[16px] bg-emerald-100/60 group-hover:bg-emerald-100/80 flex items-center justify-center shadow-sm transition-all">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary text-base">Client Reports</h3>
                    <p className="text-sm text-text-secondary mt-0.5">Monthly performance reports</p>
                  </div>
                </div>
              </Link>
              <Link 
                to={createPageUrl('GrowthPlanner') + `?id=${business.id}`}
                className="p-5 rounded-[20px] border border-white/15 bg-cream-surface/30 hover:bg-cream-surface/50 hover:border-white/25 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[16px] bg-amber-100/60 group-hover:bg-amber-100/80 flex items-center justify-center shadow-sm transition-all">
                    <Target className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary text-base">Growth Planner</h3>
                    <p className="text-sm text-text-secondary mt-0.5">30-day actionable plans</p>
                  </div>
                </div>
              </Link>
            </div>
        </div>
      </GlassCard>

      {/* Link TikTok Dialog */}
      <LinkTikTokDialog
        open={showTikTokDialog}
        onClose={() => setShowTikTokDialog(false)}
        onSubmit={handleLinkTikTok}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}