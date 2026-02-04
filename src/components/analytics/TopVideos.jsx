import React from 'react';
import { Play, Heart, MessageCircle, Share2 } from 'lucide-react';

export default function TopVideos({ videos }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-[#e8e6de]/30 text-center">
        <Play className="w-12 h-12 text-[#a8b88c] opacity-30 mx-auto mb-3" />
        <p className="text-[#6b7055]">No videos found yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#e8e6de]/30">
      <h3 className="text-lg font-bold text-[#2d3319] mb-4">Recent Videos</h3>
      <div className="space-y-3">
        {videos.slice(0, 5).map((video, idx) => (
          <div key={idx} className="flex items-start gap-4 p-4 bg-[#f9f8f4] rounded-xl hover:bg-[#f5f3ed] transition-colors">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#a8b88c] to-[#8a9a6e] rounded-lg flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#2d3319] line-clamp-2 mb-2">
                {video.video_description || `Video #${idx + 1}`}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-[#6b7055]">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {video.engagement_metrics?.likes || '—'}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {video.engagement_metrics?.comments || '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-3 h-3" />
                  {video.engagement_metrics?.shares || '—'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}