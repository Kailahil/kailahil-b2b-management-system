import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, Eye, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';

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

  const connectedAccounts = socialAccounts.filter(acc => acc.connected_status === 'connected');
  const hasData = metrics.length > 0;

  const kpiCards = [
    { icon: Users, label: 'Total Followers', value: null, color: 'text-blue-600' },
    { icon: Eye, label: 'Total Views', value: null, color: 'text-purple-600' },
    { icon: ThumbsUp, label: 'Total Likes', value: null, color: 'text-pink-600' },
    { icon: MessageCircle, label: 'Total Comments', value: null, color: 'text-green-600' },
    { icon: Share2, label: 'Total Shares', value: null, color: 'text-orange-600' },
    { icon: TrendingUp, label: 'Engagement Rate', value: null, color: 'text-indigo-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <Link 
        to={createPageUrl('BusinessDetail', `?id=${business.id}`)}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {business.name}
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics</h1>
        <p className="text-slate-600">{business.name}</p>
      </div>

      {connectedAccounts.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={TrendingUp}
              title="No integrations connected"
              description="Connect TikTok, Instagram, or Google Reviews to see real analytics and insights."
              actionLabel="Go to Integrations"
              onAction={() => window.location.href = createPageUrl('BusinessDetail', `?id=${business.id}`)}
            />
          </CardContent>
        </Card>
      ) : !hasData ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={TrendingUp}
              title="No data available yet"
              description="Analytics will appear once we sync data from your connected platforms. This happens automatically every 24 hours."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiCards.map((kpi, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {kpi.value || '—'}
                  </div>
                  <div className="text-sm text-slate-600">{kpi.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-center justify-center text-slate-500">
                Chart visualization coming soon
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}