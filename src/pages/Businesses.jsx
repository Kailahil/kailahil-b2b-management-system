import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, Plus, Search } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';

export default function Businesses() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
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

  const canAddBusiness = user?.user_role === 'agency_admin' || user?.user_role === 'account_manager';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Businesses</h1>
          <p className="text-slate-500">
            {user?.user_role === 'client' 
              ? 'Your business information and performance'
              : 'Manage all businesses in your agency'}
          </p>
        </div>
        {canAddBusiness && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" />
            Add Business
          </Button>
        )}
      </div>

      {/* Search */}
      {businesses.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search businesses by name, city, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
        </div>
      )}

      {/* Businesses Grid */}
      {filteredBusinesses.length === 0 && searchQuery === '' ? (
        <EmptyState
          icon={Building2}
          title="No businesses yet"
          description={
            user?.user_role === 'client'
              ? 'Your agency is setting up your business profile.'
              : 'Start by adding your first business to track and manage.'
          }
          actionLabel={canAddBusiness ? 'Add Business' : null}
          onAction={() => {}}
        />
      ) : filteredBusinesses.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={Search}
            title="No businesses found"
            description="Try adjusting your search query."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <Link
              key={business.id}
              to={createPageUrl(`BusinessDetail?id=${business.id}`)}
            >
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-indigo-200 h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {business.logo_url ? (
                      <img 
                        src={business.logo_url} 
                        alt={business.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-8 h-8 text-indigo-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 mb-1 truncate">{business.name}</h3>
                      <p className="text-sm text-slate-500 capitalize mb-2">{business.industry}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        business.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {business.status}
                      </span>
                    </div>
                  </div>
                  
                  {(business.city || business.phone) && (
                    <div className="pt-4 border-t border-slate-100 space-y-1">
                      {business.city && (
                        <p className="text-sm text-slate-600">📍 {business.city}{business.state ? `, ${business.state}` : ''}</p>
                      )}
                      {business.phone && (
                        <p className="text-sm text-slate-600">📞 {business.phone}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}