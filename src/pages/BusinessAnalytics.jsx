import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';
import TikTokMetrics from '../components/analytics/TikTokMetrics';
import EmptyState from '../components/shared/EmptyState';

export default function BusinessAnalytics() {
  const [business, setBusiness] = useState(null);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const businessId = urlParams.get('id');

        if (!businessId) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        const businessData = await base44.entities.Business.filter({ id: businessId });
        if (!businessData || businessData.length === 0) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        setBusiness(businessData[0]);

        const socialAccountData = await base44.entities.SocialAccount.filter({ 
          business_id: businessId 
        });
        setSocialAccounts(socialAccountData);

        const metricsData = await base44.entities.SocialDailyMetric.filter({ 
          business_id: businessId 
        });
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
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

  if (!business) {
    return null;
  }

  const tiktokAccount = socialAccounts.find(acc => acc.platform === 'tiktok');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <Link 
          to={createPageUrl('BusinessDetail') + `?id=${business.id}`}
          className="inline-flex items-center gap-2 text-[#6b7055] hover:text-[#2d3319] mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {business.name}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2d3319] mb-2">Analytics</h1>
          <p className="text-[#6b7055] text-lg">Social media performance and customer insights</p>
        </div>

        {!tiktokAccount || tiktokAccount.connected_status !== 'connected' ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-[#e8e6de]/30 text-center space-y-4">
            <TrendingUp className="w-16 h-16 text-[#a8b88c] opacity-30 mx-auto" />
            <h2 className="text-2xl font-bold text-[#2d3319]">No TikTok account connected</h2>
            <p className="text-[#6b7055] max-w-md mx-auto">
              Connect your TikTok account in Business Settings to view analytics and insights.
            </p>
            <Link 
              to={createPageUrl('BusinessDetail') + `?id=${business.id}`}
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white rounded-full hover:shadow-lg transition-all duration-300 font-medium"
            >
              Go to Integrations
            </Link>
          </div>
        ) : (
          <TikTokMetrics businessId={business.id} />
        )}
      </div>
    </div>
  );
}