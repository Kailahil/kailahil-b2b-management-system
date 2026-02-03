import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import GlassCard from '../components/glass/GlassCard';
import GlassButton from '../components/glass/GlassButton';
import GlassInput from '../components/glass/GlassInput';
import { Building2, Plus, Search } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';
import CreateBusinessDialog from '../components/businesses/CreateBusinessDialog';

export default function Businesses() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        if (!currentUser.agency_id) {
          window.location.href = createPageUrl('Setup');
          return;
        }
        
        setUser(currentUser);

        let businessList = [];
        
        if (currentUser.user_role === 'client') {
          businessList = await base44.entities.Business.filter({ 
            client_user_id: currentUser.id 
          });
        } else {
          businessList = await base44.entities.Business.filter({ 
            agency_id: currentUser.agency_id 
          });
        }

        setBusinesses(businessList);
        setFilteredBusinesses(businessList);
      } catch (error) {
        console.error('Failed to load businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const filtered = businesses.filter(business => 
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.industry?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBusinesses(filtered);
  }, [searchQuery, businesses]);

  const canAddBusiness = 
    user?.role?.toLowerCase() === 'admin' || 
    user?.user_role?.toLowerCase() === 'admin' ||
    user?.user_role?.toLowerCase() === 'account_manager';

  const handleCreateBusiness = async (formData) => {
    setIsSubmitting(true);
    try {
      const newBusiness = await base44.entities.Business.create({
        ...formData,
        agency_id: user.agency_id,
        status: 'onboarding',
        primary_media_user_id: user.id
      });

      // Auto-provision default integration records
      await Promise.all([
        base44.entities.SocialAccount.create({
          agency_id: user.agency_id,
          business_id: newBusiness.id,
          platform: 'tiktok',
          connected_status: 'disconnected',
          handle: null,
          external_account_id: null,
          auth_ref: null,
          last_sync_at: null
        }),
        base44.entities.SocialAccount.create({
          agency_id: user.agency_id,
          business_id: newBusiness.id,
          platform: 'instagram',
          connected_status: 'disconnected',
          handle: null,
          external_account_id: null,
          auth_ref: null,
          last_sync_at: null
        }),
        base44.entities.ReviewSource.create({
          agency_id: user.agency_id,
          business_id: newBusiness.id,
          platform: 'google',
          connected_status: 'disconnected',
          place_id: null,
          auth_ref: null,
          last_sync_at: null
        })
      ]);

      setBusinesses([newBusiness, ...businesses]);
      setShowCreateDialog(false);
      window.location.href = createPageUrl(`BusinessDetail?id=${newBusiness.id}`);
    } catch (error) {
      console.error('Failed to create business:', error);
      alert('Failed to create business. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold text-text-primary mb-3">Businesses</h1>
          <p className="text-text-secondary text-lg">
            {user?.user_role === 'client' 
              ? 'Your business information and performance'
              : 'Manage all businesses in your agency'}
          </p>
        </div>
        <GlassButton 
          onClick={() => setShowCreateDialog(true)}
          disabled={!canAddBusiness}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Business</span>
          <span className="sm:hidden">Add</span>
        </GlassButton>
      </div>



      {/* Search */}
      {businesses.length > 0 && (
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <GlassInput
              type="text"
              placeholder="Search businesses by name, city, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-4 text-base"
            />
          </div>
        </div>
      )}

      {/* Businesses Grid */}
      {filteredBusinesses.length === 0 && searchQuery === '' ? (
        <div>
          {!canAddBusiness ? (
            <EmptyState
              icon={Building2}
              title="No businesses yet"
              description="Your agency is setting up your business profile. Only admins and account managers can add businesses."
            />
          ) : (
            <EmptyState
              icon={Building2}
              title="No businesses yet"
              description="Start by adding your first business to track and manage."
              actionLabel="Add your first business"
              onAction={() => setShowCreateDialog(true)}
            />
          )}
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <GlassCard className="p-12">
          <EmptyState
            icon={Search}
            title="No businesses found"
            description="Try adjusting your search query."
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <Link
              key={business.id}
              to={createPageUrl(`BusinessDetail?id=${business.id}`)}
            >
              <GlassCard hover className="h-full">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {business.logo_url ? (
                      <img 
                        src={business.logo_url} 
                        alt={business.name}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-green/20 to-primary-green/40 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-8 h-8 text-primary-green-dark" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-text-primary mb-1 truncate">{business.name}</h3>
                      <p className="text-sm text-text-secondary capitalize mb-2">{business.industry}</p>
                      <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md ${
                        business.status === 'active' 
                          ? 'bg-emerald-100/60 text-emerald-700'
                          : 'bg-cream-surface/80 text-text-secondary'
                      }`}>
                        {business.status}
                      </span>
                    </div>
                  </div>

                  {(business.city || business.phone) && (
                    <div className="pt-4 border-t border-white/20 space-y-1">
                      {business.city && (
                        <p className="text-sm text-text-secondary">📍 {business.city}{business.state ? `, ${business.state}` : ''}</p>
                      )}
                      {business.phone && (
                        <p className="text-sm text-text-secondary">📞 {business.phone}</p>
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}

      {/* Create Business Dialog */}
      <CreateBusinessDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateBusiness}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}