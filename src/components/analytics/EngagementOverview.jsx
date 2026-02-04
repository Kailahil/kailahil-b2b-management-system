import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function EngagementOverview({ analytics }) {
  // Mock data for engagement trend - in production this would come from daily metrics
  const engagementData = [
    { week: 'Week 1', engagement: 2.5 },
    { week: 'Week 2', engagement: 3.1 },
    { week: 'Week 3', engagement: 2.8 },
    { week: 'Week 4', engagement: 3.9 },
  ];

  const contentMetrics = [
    { name: 'Avg Likes per Video', value: analytics?.likes_count && analytics?.video_count ? Math.round(analytics.likes_count / (analytics.video_count || 1)) : 0 },
    { name: 'Follower Growth Potential', value: 'High' },
    { name: 'Peak Activity', value: '7-9 PM' }
  ];

  return (
    <div className="space-y-6">
      {/* Engagement Trend */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#e8e6de]/30">
        <h3 className="text-lg font-bold text-[#2d3319] mb-4">Engagement Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e6de" />
            <XAxis dataKey="week" stroke="#9ca38a" />
            <YAxis stroke="#9ca38a" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e8e6de',
                borderRadius: '12px'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="engagement" 
              stroke="#a8b88c" 
              strokeWidth={3}
              dot={{ fill: '#a8b88c', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Content Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contentMetrics.map((metric, idx) => (
          <div key={idx} className="bg-gradient-to-br from-[#f9f8f4] to-[#f5f3ed] rounded-2xl p-5 border border-[#e8e6de]/50">
            <p className="text-xs text-[#6b7055] font-semibold uppercase tracking-wide mb-2">{metric.name}</p>
            <p className="text-2xl font-bold text-[#2d3319]">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}