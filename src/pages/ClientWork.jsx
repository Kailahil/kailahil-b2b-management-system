import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';

export default function ClientWork() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackStates, setFeedbackStates] = useState({});
  const [loadingApprovalId, setLoadingApprovalId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const clientBusinessList = await base44.entities.ClientBusiness.filter({ 
          user_id: currentUser.id 
        });

        if (clientBusinessList.length > 0) {
          const businessList = await base44.entities.Business.filter({ 
            id: clientBusinessList[0].business_id 
          });
          if (businessList.length > 0) {
            setBusiness(businessList[0]);

            const contentData = await base44.entities.ContentItem.filter({
              business_id: businessList[0].id,
              client_visible: true
            }, '-created_date', 100);
            setContentItems(contentData);

            const tasksData = await base44.entities.Task.filter({
              business_id: businessList[0].id,
              client_visible: true
            }, '-updated_date', 50);
            setTasks(tasksData);
          }
        }
      } catch (error) {
        console.error('Failed to load work data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApproveContent = async (contentItem) => {
    try {
      setLoadingApprovalId(contentItem.id);
      await base44.entities.ContentItem.update(contentItem.id, {
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
      await base44.entities.ContentItem.update(contentItem.id, {
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

  const postedContent = contentItems.filter(c => c.status === 'posted');
  const awaitingApproval = contentItems.filter(c => c.status === 'awaiting_approval');
  const inProgress = contentItems.filter(c => c.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-10">
          <div className="inline-block mb-3">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
              <span className="text-xs text-[#6b7055] font-medium uppercase tracking-wider">Work & Deliverables</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2d3319] mb-3 leading-tight">
            What Your Team Has Created
          </h1>
          <p className="text-[#6b7055] text-lg">
            Track progress, approve content, and provide feedback directly
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-[#e8e6de]/50">
            <p className="text-xs text-[#6b7055] font-medium mb-1">Posted</p>
            <p className="text-3xl font-bold text-[#2d3319]">{postedContent.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-[#e8e6de]/50">
            <p className="text-xs text-[#6b7055] font-medium mb-1">Awaiting Approval</p>
            <p className="text-3xl font-bold text-[#a8b88c]">{awaitingApproval.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-[#e8e6de]/50">
            <p className="text-xs text-[#6b7055] font-medium mb-1">In Progress</p>
            <p className="text-3xl font-bold text-[#7a8a5e]">{inProgress.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-[#e8e6de]/50">
            <p className="text-xs text-[#6b7055] font-medium mb-1">Tasks Done</p>
            <p className="text-3xl font-bold text-[#6d7d51]">{completedTasks.length}</p>
          </div>
        </div>

        {/* Awaiting Approval - First */}
        {awaitingApproval.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50 mb-8">
            <h2 className="text-2xl font-bold text-[#2d3319] mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-[#a8b88c]" />
              Needs Your Approval ({awaitingApproval.length})
            </h2>
            <div className="space-y-6">
              {awaitingApproval.map(content => (
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
                      <p className="text-sm text-[#6b7055] mt-2">
                        <span className="capitalize font-medium">{content.platform}</span> · <span className="capitalize">{content.type}</span>
                      </p>
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

        {/* Posted Content */}
        {postedContent.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50 mb-8">
            <h2 className="text-2xl font-bold text-[#2d3319] mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#6d7d51]" />
              Posted Content
            </h2>
            <div className="grid gap-4">
              {postedContent.slice(0, 10).map(content => (
                <div key={content.id} className="flex gap-4 p-4 bg-[#f9f8f4] rounded-xl border border-[#e8e6de]">
                  {content.thumbnail_url && (
                    <img 
                      src={content.thumbnail_url} 
                      alt={content.client_title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#2d3319] truncate">{content.client_title || content.caption?.substring(0, 50)}</p>
                    <p className="text-xs text-[#6b7055] mt-1">
                      {content.platform} · {content.type} · {new Date(content.published_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#7a8a5e] to-[#6d7d51] text-white text-xs font-semibold flex-shrink-0">
                    Posted
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress */}
        {inProgress.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50">
            <h2 className="text-2xl font-bold text-[#2d3319] mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#7a8a5e]" />
              In Progress
            </h2>
            <div className="grid gap-4">
              {inProgress.slice(0, 10).map(content => (
                <div key={content.id} className="flex gap-4 p-4 bg-[#f9f8f4] rounded-xl border border-[#e8e6de]">
                  {content.thumbnail_url && (
                    <img 
                      src={content.thumbnail_url} 
                      alt={content.client_title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#2d3319] truncate">{content.client_title || content.caption?.substring(0, 50)}</p>
                    <p className="text-xs text-[#6b7055] mt-1">
                      {content.platform} · {content.type}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#e8e6de] text-[#6b7055] text-xs font-semibold flex-shrink-0">
                    In Progress
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}