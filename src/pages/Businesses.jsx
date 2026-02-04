import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, Plus, Search, CheckCircle2 } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen bg-[#f5f3ed]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#2d3319] mb-2">Businesses</h1>
            <p className="text-[#6b7055] text-lg">
              {user?.user_role === 'client' 
                ? 'Your business information and performance'
                : 'Manage all businesses in your agency'}
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            disabled={!canAddBusiness}
            className="bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] hover:from-[#8a9a6e] hover:to-[#7a8a5e] text-white shadow-md gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Business</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>



        {/* Search */}
        {businesses.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9ca38a]" />
              <Input
                type="text"
                placeholder="Search businesses by name, city, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-base bg-white/80 backdrop-blur-sm border-[#e8e6de] rounded-[2rem_2rem_2rem_0.5rem] focus:border-[#a8b88c] text-[#2d3319] placeholder:text-[#9ca38a]"
              />
            </div>
          </div>
        )}

        {/* Businesses Grid */}
        {filteredBusinesses.length === 0 && searchQuery === '' ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-[3rem_3rem_3rem_1rem] p-12 shadow-xl border border-[#e8e6de]/30">
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
          <div className="bg-white/80 backdrop-blur-sm rounded-[3rem_3rem_3rem_1rem] p-12 shadow-xl border border-[#e8e6de]/30">
            <EmptyState
              icon={Search}
              title="No businesses found"
              description="Try adjusting your search query."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <Link
                key={business.id}
                to={createPageUrl(`BusinessDetail?id=${business.id}`)}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-[2rem_2rem_2rem_0.5rem] p-6 shadow-lg border border-[#e8e6de]/30 hover:shadow-xl hover:border-[#a8b88c]/50 transition-all duration-300 cursor-pointer h-full">
                  <div className="flex items-start gap-4 mb-4">
                    {business.logo_url ? (
                      <div className="w-16 h-16 rounded-[1.2rem_1.2rem_1.2rem_0.3rem] overflow-hidden shadow-md">
                        <img 
                          src={business.logo_url} 
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-[1.2rem_1.2rem_1.2rem_0.3rem] bg-gradient-to-br from-[#a8b88c] to-[#8a9a6e] flex items-center justify-center flex-shrink-0 shadow-md">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-[#2d3319] mb-1 truncate">{business.name}</h3>
                      <p className="text-sm text-[#6b7055] capitalize mb-2">{business.industry}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        business.status === 'active' 
                          ? 'bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white'
                          : 'bg-[#e8e6de] text-[#6b7055]'
                      }`}>
                        {business.status}
                      </span>
                    </div>
                  </div>
                  
                  {(business.city || business.phone) && (
                    <div className="pt-4 border-t border-[#e8e6de]/50 space-y-1">
                      {business.city && (
                        <p className="text-sm text-[#6b7055]">📍 {business.city}{business.state ? `, ${business.state}` : ''}</p>
                      )}
                      {business.phone && (
                        <p className="text-sm text-[#6b7055]">📞 {business.phone}</p>
                      )}
                    </div>
                  )}
                </div>
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
    </div>
  );
}