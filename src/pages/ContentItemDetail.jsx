import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, CheckSquare } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';

export default function ContentItemDetail() {
  const [contentItem, setContentItem] = useState(null);
  const [business, setBusiness] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('id');

        if (!itemId) {
          window.location.href = createPageUrl('ContentPipeline');
          return;
        }

        const itemData = await base44.entities.ContentItem.filter({ id: itemId });
        if (!itemData || itemData.length === 0) {
          window.location.href = createPageUrl('ContentPipeline');
          return;
        }

        const item = itemData[0];
        setContentItem(item);

        const businessData = await base44.entities.Business.filter({ id: item.business_id });
        if (businessData.length > 0) {
          setBusiness(businessData[0]);
        }

        const tasksData = await base44.entities.Task.filter({ 
          business_id: item.business_id
        });
        setTasks(tasksData);
      } catch (error) {
        console.error('Failed to load content item:', error);
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

  if (!contentItem) {
    return null;
  }

  const statusConfig = {
    idea: { label: 'Idea', color: 'bg-slate-100 text-slate-700' },
    draft: { label: 'Draft', color: 'bg-blue-100 text-blue-700' },
    needs_approval: { label: 'Needs Approval', color: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
    scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-700' },
    posted: { label: 'Posted', color: 'bg-emerald-100 text-emerald-700' }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Link 
        to={createPageUrl('ContentPipeline')}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Pipeline
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Badge className={statusConfig[contentItem.status]?.color}>
            {statusConfig[contentItem.status]?.label}
          </Badge>
          <Badge variant="outline" className="capitalize">{contentItem.platform}</Badge>
          <Badge variant="outline" className="capitalize">{contentItem.type}</Badge>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {business?.name} - {contentItem.platform} {contentItem.type}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Content Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {contentItem.caption && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Caption</label>
                  <p className="text-slate-900">{contentItem.caption}</p>
                </div>
              )}
              {contentItem.publish_at && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Scheduled For</label>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Calendar className="w-4 h-4" />
                    {new Date(contentItem.publish_at).toLocaleString()}
                  </div>
                </div>
              )}
              {contentItem.asset_links && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Assets</label>
                  <p className="text-sm text-slate-600">Asset links: {contentItem.asset_links}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Notes & Attachments</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <EmptyState
                icon={CheckSquare}
                title="No notes yet"
                description="Add notes, feedback, or attachments for this content item."
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Owner</label>
                  <p className="text-slate-900 mt-1">
                    {contentItem.assigned_to_user_id ? 'Assigned' : 'Unassigned'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Created By</label>
                  <p className="text-slate-900 mt-1">
                    {contentItem.created_by_user_id ? 'User ID: ' + contentItem.created_by_user_id.slice(0, 8) : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Related Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {tasks.length === 0 ? (
                <EmptyState
                  icon={CheckSquare}
                  title="No tasks"
                  description="Create tasks to track production steps."
                />
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      <CheckSquare className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900">{task.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}