import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function IntegrationCard({ 
  platform, 
  status, 
  accountName, 
  lastSync, 
  onConnect,
  isConnecting 
}) {
  const platformConfig = {
    tiktok: { name: 'TikTok', color: 'from-[#a8b88c] to-[#8a9a6e]' },
    instagram: { name: 'Instagram', color: 'from-[#8a9a6e] to-[#7a8a5e]' },
    google_reviews: { name: 'Google Reviews', color: 'from-[#7a8a5e] to-[#a8b88c]' },
  };

  const config = platformConfig[platform];
  const isConnected = status === 'connected';
  const isPending = status === 'pending';
  const hasError = status === 'error';

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-[2rem_2rem_2rem_0.5rem] p-6 hover:shadow-xl transition-all duration-300 border border-[#e8e6de]/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-[1rem_1rem_1rem_0.3rem] bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
            {config.name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-[#2d3319]">{config.name}</h3>
            {accountName && (
              <p className="text-sm text-[#6b7055]">{accountName}</p>
            )}
          </div>
        </div>
        {isConnected && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            Connected
          </span>
        )}
        {isPending && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            Pending
          </span>
        )}
        {hasError && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        )}
        {!isConnected && !isPending && !hasError && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#e8e6de] text-[#6b7055]">
            <XCircle className="w-3 h-3" />
            Not Connected
          </span>
        )}
      </div>

      {isConnected && lastSync && (
        <p className="text-xs text-[#9ca38a] mb-4">
          Last synced: {new Date(lastSync).toLocaleString()}
        </p>
      )}

      {isPending && (
        <div className="bg-amber-50 rounded-[1rem_1rem_1rem_0.3rem] p-4 mb-4 border border-amber-100">
          <p className="text-sm text-amber-800">
            Account linked. Analytics will appear once API connection is complete.
          </p>
        </div>
      )}

      {!isConnected && !isPending && (
        <div className="bg-[#f5f3ed] rounded-[1rem_1rem_1rem_0.3rem] p-4 mb-4">
          <p className="text-sm text-[#6b7055]">
            {platform === 'tiktok' 
              ? 'Link your TikTok account. Full API analytics coming soon.'
              : `Connect ${config.name} to pull real metrics and insights.`}
          </p>
        </div>
      )}

      <Button 
        onClick={onConnect}
        disabled={isConnecting || isPending}
        variant={isConnected || isPending ? "outline" : "default"}
        className={(!isConnected && !isPending) 
          ? "w-full bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] hover:from-[#8a9a6e] hover:to-[#7a8a5e] text-white shadow-md" 
          : "w-full border-[#e8e6de] text-[#6b7055] hover:bg-[#f5f3ed]"}
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Connecting...
          </>
        ) : isPending ? (
          'Update Details'
        ) : isConnected ? (
          'Manage Connection'
        ) : (
          platform === 'tiktok' ? 'Link TikTok' : `Connect ${config.name}`
        )}
      </Button>
    </div>
  );
}