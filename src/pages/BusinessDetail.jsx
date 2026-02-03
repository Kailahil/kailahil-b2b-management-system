import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Link as LinkIcon } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';
import IntegrationCard from '../components/shared/IntegrationCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';

export default function BusinessDetail() {
  const [business, setBusiness] = useState(null);
  const [user, setUser] = useState(null);
  const [integrations, setIntegrations] = useState([]);
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

        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const businessData = await base44.entities.Business.filter({ id: businessId });
        
        if (!businessData || businessData.length === 0) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        const bizData = businessData[0];

        // Security check: verify user has access to this business
        if (currentUser.user_role === 'client' && bizData.client_user_id !== currentUser.id) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        if (currentUser.user_role !== 'client' && bizData.agency_id !== currentUser.agency_id) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        setBusiness(bizData);

        // Load integrations
        const integrationData = await base44.entities.IntegrationConnection.filter({ 
          business_id: businessId 
        });
        setIntegrations(integrationData);
      } catch (error) {
        console.error('Failed to load business:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleConnectIntegration = (platform) => {
    alert(`Connect ${platform} - Integration flow coming soon`);
  };

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

  const platforms = ['tiktok', 'instagram', 'google_reviews'];
  const integrationMap = integrations.reduce((acc, int) => {
    acc[int.platform] = int;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <Link 
        to={createPageUrl('Businesses')}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Businesses
      </Link>

      {/* Business Header */}
      <Card className="mb-8 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            {business.logo_url ? (
              <img 
                src={business.logo_url} 
                alt={business.name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-12 h-12 text-indigo-600" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{business.name}</h1>
              <p className="text-slate-500 capitalize mb-4">{business.industry}</p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                {business.city && (
                  <span>📍 {business.city}{business.state ? `, ${business.state}` : ''}</span>
                )}
                {business.phone && (
                  <span>📞 {business.phone}</span>
                )}
                {business.website && (
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              business.status === 'active' 
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {business.status}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Section */}
      <Card className="mb-8 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-2xl font-bold text-slate-900">Integrations</CardTitle>
          <p className="text-slate-500 text-sm mt-1">Connect platforms to pull real data and metrics</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platforms.map((platform) => {
              const integration = integrationMap[platform];
              return (
                <IntegrationCard
                  key={platform}
                  platform={platform}
                  status={integration?.status || 'disconnected'}
                  accountName={integration?.account_name}
                  lastSync={integration?.last_sync}
                  onConnect={() => handleConnectIntegration(platform)}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Section - Empty State */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-2xl font-bold text-slate-900">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <EmptyState
            icon={Building2}
            title="No data available"
            description="Connect your integrations above to start seeing real metrics and insights. We never display estimated or placeholder data."
          />
        </CardContent>
      </Card>
    </div>
  );
}