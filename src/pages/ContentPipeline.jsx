import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, ArrowRight } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';

export default function ContentPipeline() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const businessData = await base44.entities.Business.filter({ 
          agency_id: currentUser.agency_id 
        });
        setBusinesses(businessData);

        const contentData = await base44.entities.ContentItem.filter({ 
          agency_id: currentUser.agency_id 
        });
        setContentItems(contentData);
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f3ed]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  const filteredContent = selectedBusiness === 'all' 
    ? contentItems 
    : contentItems.filter(item => item.business_id === selectedBusiness);

  const statusConfig = {
    idea: { label: 'Idea', color: 'bg-slate-100 text-slate-700' },
    draft: { label: 'Draft', color: 'bg-blue-100 text-blue-700' },
    needs_approval: { label: 'Needs Approval', color: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
    scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-700' },
    posted: { label: 'Posted', color: 'bg-emerald-100 text-emerald-700' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#2d3319] mb-2">Content Pipeline</h1>
            <p className="text-[#6b7055] text-lg">Manage content from idea to publication</p>
          </div>
          <Button className="bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] hover:from-[#8a9a6e] hover:to-[#7a8a5e] text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            New Content
          </Button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem_2rem_2rem_0.5rem] p-4 mb-6 shadow-lg border border-[#e8e6de]/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6b7055] font-medium">Filter by business:</span>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="px-4 py-2 rounded-full border border-[#e8e6de] text-sm text-[#2d3319] bg-white focus:outline-none focus:border-[#a8b88c]"
            >
              <option value="all">All Businesses</option>
              {businesses.map(biz => (
                <option key={biz.id} value={biz.id}>{biz.name}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredContent.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-[3rem_3rem_3rem_1rem] p-12 shadow-xl border border-[#e8e6de]/30">
            <EmptyState
              icon={Calendar}
              title="No content items yet"
              description="Start creating content for your clients. Track each piece from ideation to publication."
              actionLabel="Create First Content"
              onAction={() => alert('Content creation form coming soon')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredContent.map(item => {
              const business = businesses.find(b => b.id === item.business_id);
              return (
                <div key={item.id} className="bg-white/90 backdrop-blur-sm rounded-[2rem_2rem_2rem_0.5rem] p-6 shadow-lg border border-[#e8e6de]/30 hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'idea' ? 'bg-[#e8e6de] text-[#6b7055]' :
                          item.status === 'draft' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'needs_approval' ? 'bg-amber-100 text-amber-700' :
                          item.status === 'approved' ? 'bg-[#d4e0b3]/30 text-[#7a8a5e] border border-[#d4e0b3]/50' :
                          item.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                          'bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white'
                        }`}>
                          {statusConfig[item.status]?.label}
                        </span>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-[#e8e6de] text-[#6b7055] capitalize">
                          {item.platform}
                        </span>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-[#e8e6de] text-[#6b7055] capitalize">
                          {item.type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#2d3319] mb-2">
                        {business?.name} - {item.platform} {item.type}
                      </h3>
                      {item.caption && (
                        <p className="text-sm text-[#6b7055] line-clamp-2 mb-3">{item.caption}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-[#9ca38a]">
                        {item.publish_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.publish_at).toLocaleDateString()}
                          </span>
                        )}
                        {item.assigned_to_user_id && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Assigned
                          </span>
                        )}
                      </div>
                    </div>
                    <Link 
                      to={createPageUrl('ContentItemDetail', `?id=${item.id}`)}
                      className="ml-4"
                    >
                      <Button variant="ghost" size="icon" className="hover:bg-[#f5f3ed]">
                        <ArrowRight className="w-4 h-4 text-[#6b7055]" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}