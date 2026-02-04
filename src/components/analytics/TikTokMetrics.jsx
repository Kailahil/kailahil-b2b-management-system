import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Heart, Eye, MessageCircle, Share2, TrendingUp, RefreshCw } from 'lucide-react';
import SocialMetricsGrid from './SocialMetricsGrid';
import EngagementOverview from './EngagementOverview';
import TopVideos from './TopVideos';

export default function TikTokMetrics({ businessId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await base44.functions.invoke('getTikTokAnalytics', {
        business_id: businessId
      });

      if (response.data?.success) {
        setAnalytics(response.data.data);
      } else if (response.data?.data) {
        // Handle case where data is returned even with error flag
        setAnalytics(response.data.data);
      } else if (response.status === 404) {
        // No TikTok account connected - this is expected
        setAnalytics(null);
      } else {
        setError(response.data?.error || 'Failed to load analytics');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke('syncTikTok', {
        business_id: businessId
      });
      // Refresh analytics after sync
      await fetchAnalytics();
    } catch (err) {
      setError('Failed to sync TikTok data');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchAnalytics();
    }
  }, [businessId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-[#e8e6de] rounded-lg w-32" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[#e8e6de] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
        <div>
          <p className="text-red-700 text-sm mb-2">Unable to load TikTok analytics</p>
          <p className="text-red-600 text-xs">{error}</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm px-4 py-2 rounded-lg"
        >
          {syncing ? 'Syncing...' : 'Sync TikTok Data'}
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-[#f9f8f4] rounded-2xl p-6 text-center">
        <p className="text-[#6b7055]">No TikTok account connected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Header with Sync */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#e8e6de]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {analytics.avatar_url && (
              <img
                src={analytics.avatar_url}
                alt={analytics.handle}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-[#2d3319]">@{analytics.handle}</h3>
              {analytics.bio && <p className="text-sm text-[#6b7055] mt-1">{analytics.bio}</p>}
              {analytics.verified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mt-2 inline-block">✓ Verified</span>}
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white rounded-full hover:shadow-lg disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <SocialMetricsGrid analytics={analytics} />

      {/* Engagement Overview */}
      <EngagementOverview analytics={analytics} />

      {/* Recent Videos */}
      <TopVideos videos={analytics.top_posts} />
    </div>
  );
}