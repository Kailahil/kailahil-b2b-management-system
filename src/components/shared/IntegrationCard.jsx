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
  onConnect 
}) {
  const platformConfig = {
    tiktok: { name: 'TikTok', color: 'from-pink-500 to-purple-500' },
    instagram: { name: 'Instagram', color: 'from-purple-500 to-pink-500' },
    google_reviews: { name: 'Google Reviews', color: 'from-blue-500 to-indigo-500' },
  };

  const config = platformConfig[platform];
  const isConnected = status === 'connected';
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
        {hasError && (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )}
        {!isConnected && !hasError && (
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

      {!isConnected && (
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-600">
            Connect {config.name} to pull real metrics and insights.
          </p>
        </div>
      )}

      <Button 
        onClick={onConnect}
        variant={isConnected ? "outline" : "default"}
        className={!isConnected ? "w-full bg-indigo-600 hover:bg-indigo-700" : "w-full"}
      >
        {isConnected ? 'Manage Connection' : `Connect ${config.name}`}
      </Button>
    </Card>
  );
}