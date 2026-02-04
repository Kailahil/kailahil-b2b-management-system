import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Heart, Eye, MessageCircle, Share2, TrendingUp } from 'lucide-react';

export default function TikTokMetrics({ businessId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await base44.functions.invoke('getTikTokAnalytics', {
          business_id: businessId
        });

        if (response.data.success) {
          setAnalytics(response.data.data);
        } else {
          setError(response.data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

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
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700 text-sm mb-2">Unable to load TikTok analytics</p>
        <p className="text-red-600 text-xs">{error}</p>
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

  const metrics = [
    { label: 'Followers', value: analytics.followers?.toLocaleString() || '—', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Likes', value: analytics.likes_count?.toLocaleString() || '—', icon: Heart, color: 'from-red-500 to-red-600' },
    { label: 'Profile Views', value: analytics.profile_views?.toLocaleString() || '—', icon: Eye, color: 'from-purple-500 to-purple-600' },
    { label: 'Video Count', value: analytics.video_count || '—', icon: TrendingUp, color: 'from-green-500 to-green-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Account Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-[2rem_2rem_2rem_0.5rem] p-6 shadow-lg border border-[#e8e6de]/30">
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-white/90 backdrop-blur-sm rounded-[2rem_2rem_2rem_0.5rem] p-6 shadow-lg border border-[#e8e6de]/30 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-[#6b7055] font-medium">{metric.label}</p>
                <div className={`bg-gradient-to-r ${metric.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#2d3319]">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Top Posts */}
      {analytics.top_posts && analytics.top_posts.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem_2rem_2rem_0.5rem] p-8 shadow-lg border border-[#e8e6de]/30">
          <h3 className="text-lg font-bold text-[#2d3319] mb-4">Top Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {analytics.top_posts.map((post, idx) => (
              <div key={idx} className="bg-[#f9f8f4] rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {post.video_description && (
                  <p className="p-3 text-xs text-[#6b7055] line-clamp-2">{post.video_description}</p>
                )}
                <p className="px-3 pb-3 text-xs text-[#9ca38a] font-medium">
                  📊 Post #{idx + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}