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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Content Pipeline</h1>
          <p className="text-slate-600">Manage content from idea to publication</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          New Content
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Filter by business:</span>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="all">All Businesses</option>
              {businesses.map(biz => (
                <option key={biz.id} value={biz.id}>{biz.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredContent.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={Calendar}
              title="No content items yet"
              description="Start creating content for your clients. Track each piece from ideation to publication."
              actionLabel="Create First Content"
              onAction={() => alert('Content creation form coming soon')}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContent.map(item => {
            const business = businesses.find(b => b.id === item.business_id);
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={statusConfig[item.status]?.color}>
                          {statusConfig[item.status]?.label}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {item.platform}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">
                        {business?.name} - {item.platform} {item.type}
                      </h3>
                      {item.caption && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{item.caption}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
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
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}