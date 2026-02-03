import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Link as LinkIcon, TrendingUp, Lightbulb, FileText } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Businesses
      </Link>

      {/* Business Header */}
      <Card className="mb-8 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            {business.logo_url ? (
              <img 
                src={business.logo_url} 
                alt={business.name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-12 h-12 text-indigo-600" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{business.name}</h1>
              <p className="text-slate-500 capitalize mb-4">{business.industry}</p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
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
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              business.status === 'active' 
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {business.status}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Checklist */}
      <div className="mb-8">
        <OnboardingChecklist 
          business={business}
          socialAccounts={socialAccounts}
          reviewSources={reviewSources}
        />
      </div>

      {/* Integrations Section */}
      <Card className="mb-8 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-2xl font-bold text-slate-900">Integrations</CardTitle>
          <p className="text-slate-500 text-sm mt-1">Connect platforms to pull real data and metrics</p>
        </CardHeader>
        <CardContent className="p-6">
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
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-2xl font-bold text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to={createPageUrl('ExecutiveDashboard') + `?id=${business.id}`}
                className="p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Executive Dashboard</h3>
                    <p className="text-sm text-slate-500">AI-powered business insights</p>
                  </div>
                </div>
              </Link>
              <Link 
                to={createPageUrl('AIInsights') + `?id=${business.id}`}
                className="p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">AI Insights</h3>
                    <p className="text-sm text-slate-500">Issues, opportunities & action plans</p>
                  </div>
                </div>
              </Link>
              <Link 
                to={createPageUrl('BusinessAnalytics') + `?id=${business.id}`}
                className="p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">View Analytics</h3>
                    <p className="text-sm text-slate-500">Performance metrics & insights</p>
                  </div>
                </div>
              </Link>
              <Link 
                to={createPageUrl('ClientReports') + `?id=${business.id}`}
                className="p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Client Reports</h3>
                    <p className="text-sm text-slate-500">Monthly performance reports</p>
                  </div>
                </div>
              </Link>
              </div>
        </CardContent>
      </Card>

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