import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';
import { Building2, CheckCircle2, Clock, AlertCircle, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [workLogs, setWorkLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackStates, setFeedbackStates] = useState({});
  const [loadingApprovalId, setLoadingApprovalId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is logged in via clientAuth
        const clientAuthStr = localStorage.getItem('clientAuth');
        if (!clientAuthStr) {
          window.location.href = createPageUrl('ClientLogin');
          return;
        }

        const clientAuth = JSON.parse(clientAuthStr);
        setUser(clientAuth);

        // Use the clientAuth ID directly since they're already validated
        const clientBusinessList = await base44.asServiceRole.entities.ClientBusiness.filter({ 
          user_id: clientAuth.id 
        });

        if (clientBusinessList.length > 0) {
          const businessList = await base44.asServiceRole.entities.Business.filter({ 
            id: clientBusinessList[0].business_id 
          });
          if (businessList.length > 0) {
            const selectedBusiness = businessList[0];
            setBusiness(selectedBusiness);

            // Load work logs
            const logs = await base44.asServiceRole.entities.WorkLog.filter({
              business_id: selectedBusiness.id,
              visibility: 'client'
            }, '-created_date', 50);
            setWorkLogs(logs);

            // Load client-visible tasks
            const tasksData = await base44.asServiceRole.entities.Task.filter({
              business_id: selectedBusiness.id,
              client_visible: true
            }, '-updated_date', 50);
            setTasks(tasksData);

            // Load client-visible content
            const contentData = await base44.asServiceRole.entities.ContentItem.filter({
              business_id: selectedBusiness.id,
              client_visible: true
            }, '-created_date', 50);
            setContentItems(contentData);
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApproveContent = async (contentItem) => {
    try {
      setLoadingApprovalId(contentItem.id);
      await base44.asServiceRole.entities.ContentItem.update(contentItem.id, {
        approved_by_client: true,
        approved_at: new Date().toISOString()
      });
      setContentItems(prev => prev.map(c => 
        c.id === contentItem.id ? { ...c, approved_by_client: true, approved_at: new Date().toISOString() } : c
      ));
    } catch (error) {
      console.error('Failed to approve content:', error);
    } finally {
      setLoadingApprovalId(null);
    }
  };

  const handleRequestChanges = async (contentItem) => {
    const feedback = feedbackStates[contentItem.id];
    if (!feedback) return;

    try {
      setLoadingApprovalId(contentItem.id);
      await base44.asServiceRole.entities.ContentItem.update(contentItem.id, {
        client_feedback: feedback
      });
      setFeedbackStates(prev => ({ ...prev, [contentItem.id]: '' }));
      setContentItems(prev => prev.map(c => 
        c.id === contentItem.id ? { ...c, client_feedback: feedback } : c
      ));
    } catch (error) {
      console.error('Failed to save feedback:', error);
    } finally {
      setLoadingApprovalId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  // Calculate metrics
  const postedThisMonth = contentItems.filter(c => 
    c.status === 'posted' && c.published_at && 
    new Date(c.published_at).getMonth() === new Date().getMonth()
  ).length;
  const inProgress = contentItems.filter(c => c.status === 'in_progress').length;
  const awaitingApproval = contentItems.filter(c => c.status === 'awaiting_approval').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  const feedItems = [
    ...workLogs.map(log => ({
      type: 'worklog',
      icon: Zap,
      data: log,
      timestamp: log.created_date
    })),
    ...tasks.filter(t => t.client_visible).map(task => ({
      type: 'task',
      icon: CheckCircle2,
      data: task,
      timestamp: task.updated_date
    })),
    ...contentItems.filter(c => c.client_visible).map(content => ({
      type: 'content',
      icon: TrendingUp,
      data: content,
      timestamp: content.created_date
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex justify-center mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698235382c78cdec3bacea2f/06a1de1f9_DesignTransparentbackground-02.png" 
            alt="Logo" 
            className="h-16 md:h-20 w-auto"
          />
        </div>

        <div className="mb-10">
          <div className="inline-block mb-3">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
              <span className="text-xs text-[#6b7055] font-medium uppercase tracking-wider">Client Dashboard</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2d3319] mb-3 leading-tight">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-[#6b7055] text-lg">
            Monitor your {business?.name} media specialist progress
          </p>
        </div>

        {!business ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-[3rem_3rem_3rem_1rem] p-12 text-center shadow-lg">
            <div className="w-28 h-28 rounded-[2.5rem_2.5rem_2.5rem_0.5rem] bg-gradient-to-br from-[#e8e6de] to-[#d4d2c8] flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-14 h-14 text-[#6b7055]" />
            </div>
            <h3 className="text-2xl font-bold text-[#2d3319] mb-3">Setting up your business</h3>
            <p className="text-[#6b7055] text-lg max-w-md mx-auto">
              Your agency is setting up your business profile. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Work Completed Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#e8e6de]/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#6b7055] font-medium">Content Posted</p>
                  <TrendingUp className="w-5 h-5 text-[#a8b88c]" />
                </div>
                <p className="text-3xl font-bold text-[#2d3319]">{postedThisMonth}</p>
                <p className="text-xs text-[#9ca38a] mt-1">This month</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#e8e6de]/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#6b7055] font-medium">In Progress</p>
                  <Clock className="w-5 h-5 text-[#7a8a5e]" />
                </div>
                <p className="text-3xl font-bold text-[#2d3319]">{inProgress}</p>
                <p className="text-xs text-[#9ca38a] mt-1">Being created</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#e8e6de]/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#6b7055] font-medium">Awaiting Approval</p>
                  <AlertCircle className="w-5 h-5 text-[#a8b88c]" />
                </div>
                <p className="text-3xl font-bold text-[#2d3319]">{awaitingApproval}</p>
                <p className="text-xs text-[#9ca38a] mt-1">Your review needed</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#e8e6de]/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#6b7055] font-medium">Tasks Completed</p>
                  <CheckCircle2 className="w-5 h-5 text-[#6d7d51]" />
                </div>
                <p className="text-3xl font-bold text-[#2d3319]">{completedTasks}</p>
                <p className="text-xs text-[#9ca38a] mt-1">This month</p>
              </div>
            </div>

            {/* Team Activity Feed */}
            {feedItems.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50">
                <h2 className="text-2xl font-bold text-[#2d3319] mb-6">Team Activity</h2>
                <div className="space-y-4">
                  {feedItems.map((item, idx) => {
                    const Icon = item.icon;
                    const d = item.data;
                    const date = new Date(item.timestamp);
                    const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return (
                      <div key={`${item.type}-${d.id}`} className="flex gap-4 pb-4 border-b border-[#e8e6de]/30 last:border-b-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#2d3319]">
                            {item.type === 'worklog' ? `Work: ${d.summary}` : 
                             item.type === 'task' ? `Task: ${d.client_summary || d.title}` :
                             `Content: ${d.client_title || d.caption?.substring(0, 50)}`}
                          </p>
                          <p className="text-xs text-[#6b7055] mt-1">{timeStr}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Client Approvals */}
            {awaitingApproval > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50">
                <h2 className="text-2xl font-bold text-[#2d3319] mb-6 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-[#a8b88c]" />
                  Needs Your Approval
                </h2>
                <div className="space-y-6">
                  {contentItems.filter(c => c.status === 'awaiting_approval').map(content => (
                    <div key={content.id} className="bg-[#f9f8f4] rounded-2xl p-6 border border-[#e8e6de]">
                      <div className="flex gap-4 mb-4">
                        {content.thumbnail_url && (
                          <img 
                            src={content.thumbnail_url} 
                            alt={content.client_title}
                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-[#2d3319] text-lg">{content.client_title || content.caption?.substring(0, 60)}</h3>
                          <p className="text-sm text-[#6b7055] mt-1">Platform: <span className="capitalize font-medium">{content.platform}</span></p>
                          <p className="text-sm text-[#6b7055]">Type: <span className="capitalize font-medium">{content.type}</span></p>
                        </div>
                      </div>
                      
                      {content.client_feedback && (
                        <div className="bg-[#fff9e6] border-l-4 border-[#a8b88c] p-4 rounded mb-4">
                          <p className="text-sm text-[#6b7055]"><strong>Your feedback:</strong> {content.client_feedback}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <Button
                          onClick={() => handleApproveContent(content)}
                          disabled={loadingApprovalId === content.id}
                          className="w-full bg-gradient-to-r from-[#7a8a5e] to-[#6d7d51] hover:from-[#6d7d51] hover:to-[#5f6f43] text-white"
                        >
                          {loadingApprovalId === content.id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Textarea
                          placeholder="Request changes or provide feedback..."
                          value={feedbackStates[content.id] || ''}
                          onChange={(e) => setFeedbackStates(prev => ({ ...prev, [content.id]: e.target.value }))}
                          className="min-h-20 text-sm rounded-lg border-[#e8e6de]"
                        />
                        <Button
                          onClick={() => handleRequestChanges(content)}
                          disabled={loadingApprovalId === content.id || !feedbackStates[content.id]}
                          variant="outline"
                          className="w-full border-[#e8e6de] hover:bg-[#f5f3ed]"
                        >
                          Send Feedback
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}