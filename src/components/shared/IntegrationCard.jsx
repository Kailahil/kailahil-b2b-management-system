import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function IntegrationCard({ 
  platform, 
  status, 
  accountName, 
  profileUrl,
  lastSync, 
  onConnect,
  isConnecting 
}) {
  const platformConfig = {
    tiktok: { name: 'TikTok', color: 'from-pink-500 to-purple-500' },
    instagram: { name: 'Instagram', color: 'from-purple-500 to-pink-500' },
    google_reviews: { name: 'Google Reviews', color: 'from-blue-500 to-indigo-500' },
  };

  const config = platformConfig[platform];
  const isConnected = status === 'connected';
  const isPending = status === 'pending';
  const hasError = status === 'error';

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-bold text-lg`}>
            {config.name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{config.name}</h3>
            {accountName && (
              <p className="text-sm text-slate-500">{accountName}</p>
            )}
          </div>
        </div>
        {isConnected && (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )}
        {isPending && (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )}
        {hasError && (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )}
        {!isConnected && !isPending && !hasError && (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
            <XCircle className="w-3 h-3 mr-1" />
            Not Connected
          </Badge>
        )}
      </div>

      {isConnected && lastSync && (
        <p className="text-xs text-slate-500 mb-4">
          Last synced: {new Date(lastSync).toLocaleString()}
        </p>
      )}

      {isPending && (
        <div className="space-y-3 mb-4">
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              Account linked. Analytics will appear once API connection is complete.
            </p>
          </div>
          {accountName && (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-slate-500">Handle:</span>
                <span className="ml-2 font-medium text-slate-900">{accountName}</span>
              </div>
              {profileUrl && (
                <>
                  <div className="text-sm">
                    <span className="text-slate-500">Profile:</span>
                    <a 
                      href={profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-indigo-600 hover:text-indigo-700 underline break-all"
                    >
                      {profileUrl}
                    </a>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(profileUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open TikTok Profile
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!isConnected && !isPending && (
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-600">
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
        className={(!isConnected && !isPending) ? "w-full bg-indigo-600 hover:bg-indigo-700" : "w-full"}
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
          platform === 'tiktok' ? 'Link TikTok (API coming soon)' : `Connect ${config.name}`
        )}
      </Button>
    </Card>
  );
}