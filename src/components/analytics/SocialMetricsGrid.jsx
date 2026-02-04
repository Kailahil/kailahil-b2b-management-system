import React from 'react';
import { TrendingUp, Users, Heart, MessageCircle, Share2, Eye } from 'lucide-react';

export default function SocialMetricsGrid({ analytics }) {
  const metrics = [
    { label: 'Followers', value: analytics?.followers || 0, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Likes', value: analytics?.likes_count || 0, icon: Heart, color: 'from-red-500 to-pink-500' },
    { label: 'Profile Views', value: analytics?.profile_views || 0, icon: Eye, color: 'from-purple-500 to-indigo-500' },
    { label: 'Video Count', value: analytics?.video_count || 0, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Following', value: analytics?.following || 0, icon: Users, color: 'from-amber-500 to-orange-500' }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div 
            key={idx} 
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-[#e8e6de]/30 hover:shadow-xl hover:border-[#a8b88c]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#6b7055] font-semibold uppercase tracking-wide">{metric.label}</p>
              <div className={`bg-gradient-to-r ${metric.color} p-2 rounded-lg shadow-md`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2d3319]">{formatNumber(metric.value)}</p>
            <p className="text-xs text-[#9ca38a] mt-1">Real-time data</p>
          </div>
        );
      })}
    </div>
  );
}