import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, CheckCircle2, Circle, AlertTriangle, Sparkles, TrendingUp, MessageSquare, Video, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';

export default function ExecutiveDashboard() {
  const [business, setBusiness] = useState(null);
  const [user, setUser] = useState(null);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [reviewSources, setReviewSources] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [manualKPIs, setManualKPIs] = useState([]);
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

        setBusiness(businessData[0]);

        const [
          socialAccountData,
          reviewSourceData,
          reviewData,
          contentData,
          taskData,
          kpiData,
          summaryData
        ] = await Promise.all([
          base44.entities.SocialAccount.filter({ business_id: businessId }),
          base44.entities.ReviewSource.filter({ business_id: businessId }),
          base44.entities.Review.filter({ business_id: businessId }),
          base44.entities.ContentItem.filter({ business_id: businessId }),
          base44.entities.Task.filter({ business_id: businessId }),
          base44.entities.ManualKPI.filter({ business_id: businessId }),
          base44.entities.ExecutiveSummary.filter({ business_id: businessId })
        ]);

        setSocialAccounts(socialAccountData);
        setReviewSources(reviewSourceData);
        setReviews(reviewData);
        setContentItems(contentData);
        setTasks(taskData);
        setManualKPIs(kpiData);
        setExecutiveSummary(summaryData.length > 0 ? summaryData[0] : null);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateExecutiveSummary', {
        business_id: business.id
      });

      if (response.data.success) {
        const updatedSummary = await base44.entities.ExecutiveSummary.filter({ 
          business_id: business.id 
        });
        setExecutiveSummary(updatedSummary.length > 0 ? updatedSummary[0] : null);
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('Failed to generate executive summary');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f3ed]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  if (!business) {
    return null;
  }

  // Calculate onboarding checklist
  const checklist = [
    { label: 'TikTok Linked', completed: socialAccounts.some(acc => acc.platform === 'tiktok') },
    { label: 'Instagram Linked', completed: socialAccounts.some(acc => acc.platform === 'instagram') },
    { label: 'Google Place ID', completed: reviewSources.some(src => src.place_id) },
    { label: 'Brand Kit', completed: !!(business.logo_url || business.primary_color) },
    { label: 'Content Created', completed: contentItems.length > 0 },
    { label: 'Reviews Imported', completed: reviews.length > 0 }
  ];
  const completionPercent = Math.round((checklist.filter(c => c.completed).length / checklist.length) * 100);

  // Review analysis
  const positiveReviews = reviews.filter(r => r.rating >= 4);
  const negativeReviews = reviews.filter(r => r.rating <= 2);

  // Content by status
  const contentByStatus = {
    idea: contentItems.filter(c => c.status === 'idea').length,
    draft: contentItems.filter(c => c.status === 'draft').length,
    needs_approval: contentItems.filter(c => c.status === 'needs_approval').length,
    approved: contentItems.filter(c => c.status === 'approved').length,
    scheduled: contentItems.filter(c => c.status === 'scheduled').length,
    posted: contentItems.filter(c => c.status === 'posted').length
  };

  // Task analysis
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done');
  const dueThisWeek = tasks.filter(t => t.due_date && new Date(t.due_date) <= oneWeekFromNow && new Date(t.due_date) >= now && t.status !== 'done');
  const completedThisWeek = tasks.filter(t => t.status === 'done' && t.updated_date && new Date(t.updated_date) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <Link 
          to={createPageUrl('BusinessDetail', `?id=${business.id}`)}
          className="inline-flex items-center gap-2 text-[#6b7055] hover:text-[#2d3319] mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {business.name}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2d3319] mb-2">Executive Dashboard</h1>
          <p className="text-[#6b7055] text-lg">{business.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SECTION 1 - Business Status */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-[2.5rem_2.5rem_2.5rem_1rem] shadow-xl border border-[#e8e6de]/30">
            <div className="p-6 border-b border-[#e8e6de]">
              <h2 className="text-2xl font-bold text-[#2d3319] flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Status
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm text-[#6b7055] mb-1 block">Status</label>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                    business.status === 'active' ? 'bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white' :
                    business.status === 'onboarding' ? 'bg-amber-100 text-amber-700' :
                    'bg-[#e8e6de] text-[#6b7055]'
                  }`}>
                    {business.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-[#6b7055] mb-1 block">Primary Media Specialist</label>
                  <p className="text-[#2d3319] font-medium">
                    {business.primary_media_user_id ? 'Assigned' : 'Not Set'}
                  </p>
                </div>
              </div>

              <div className="bg-[#f5f3ed] rounded-[1.5rem_1.5rem_1.5rem_0.5rem] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#2d3319]">Onboarding Progress</span>
                  <span className="text-sm font-bold text-[#2d3319]">{completionPercent}%</span>
                </div>
                <div className="h-2 bg-[#e8e6de] rounded-full mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] rounded-full transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#a8b88c]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#e8e6de]" />
                      )}
                      <span className={item.completed ? 'text-[#2d3319] font-medium' : 'text-[#9ca38a]'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 - Review Health */}
          <div className="bg-white/90 backdrop-blur-sm rounded-[2rem_2rem_2rem_0.5rem] shadow-xl border border-[#e8e6de]/30">
            <div className="p-6 border-b border-[#e8e6de]">
              <h2 className="text-xl font-bold text-[#2d3319] flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Review Health
              </h2>
            </div>
            <div className="p-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-[#e8e6de] mx-auto mb-3" />
                  <p className="text-sm text-[#6b7055]">Import reviews to unlock insights</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#f5f3ed] rounded-[1rem_1rem_1rem_0.3rem] p-3">
                      <div className="text-2xl font-bold text-[#2d3319]">{reviews.length}</div>
                      <div className="text-xs text-[#6b7055]">Total</div>
                    </div>
                    <div className="bg-[#d4e0b3]/20 rounded-[1rem_1rem_1rem_0.3rem] p-3 border border-[#d4e0b3]/30">
                      <div className="text-2xl font-bold text-[#7a8a5e]">{positiveReviews.length}</div>
                      <div className="text-xs text-[#7a8a5e]">Positive</div>
                    </div>
                    <div className="bg-red-50 rounded-[1rem_1rem_1rem_0.3rem] p-3 border border-red-100">
                      <div className="text-2xl font-bold text-red-700">{negativeReviews.length}</div>
                      <div className="text-xs text-red-600">Negative</div>
                    </div>
                  </div>
                  <div className="text-xs text-[#9ca38a] text-center">
                    Based on {reviews.length} imported review{reviews.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* SECTION 3 - Content & Ops */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Content & Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Content Pipeline</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Ideas</span>
                    <span className="font-medium text-slate-900">{contentByStatus.idea}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">In Progress</span>
                    <span className="font-medium text-slate-900">{contentByStatus.draft}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Awaiting Approval</span>
                    <span className="font-medium text-slate-900">{contentByStatus.needs_approval}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Ready</span>
                    <span className="font-medium text-slate-900">{contentByStatus.approved + contentByStatus.scheduled}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Posted</span>
                    <span className="font-medium text-emerald-600">{contentByStatus.posted}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Tasks</h4>
                <div className="space-y-3">
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-700">{overdueTasks.length}</div>
                    <div className="text-xs text-red-600">Overdue</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-amber-700">{dueThisWeek.length}</div>
                    <div className="text-xs text-amber-600">Due This Week</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-emerald-700">{completedThisWeek.length}</div>
                    <div className="text-xs text-emerald-600">Done This Week</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4 - Manual KPIs */}
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Manual KPIs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {manualKPIs.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600">No manual metrics added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 mb-3">Client-Provided Metrics</div>
                {manualKPIs.slice(0, 5).map(kpi => (
                  <div key={kpi.id} className="bg-slate-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-slate-900">{kpi.value}</div>
                    <div className="text-sm text-slate-700">{kpi.metric_name}</div>
                    <div className="text-xs text-slate-500">{kpi.period}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECTION 5 - AI Executive Summary */}
        <Card className="lg:col-span-3">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Executive Summary
              </CardTitle>
              <Button 
              onClick={handleGenerateSummary}
              disabled={generating}
              size="sm"
              className="bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] hover:from-[#8a9a6e] hover:to-[#7a8a5e] text-white shadow-md"
              >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Summary
                </>
              )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {!executiveSummary ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-4">
                  Generate an AI-powered executive summary based on current data
                </p>
                <p className="text-xs text-slate-500">
                  The AI will analyze reviews, content pipeline, tasks, and KPIs to provide insights
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed">{executiveSummary.summary_text}</p>
                </div>
                {executiveSummary.current_health && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Current Health</h4>
                      <p className="text-sm text-blue-700">{executiveSummary.current_health}</p>
                    </div>
                    {executiveSummary.biggest_risk && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-900 mb-2">Biggest Risk</h4>
                        <p className="text-sm text-red-700">{executiveSummary.biggest_risk}</p>
                      </div>
                    )}
                    {executiveSummary.biggest_opportunity && (
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-emerald-900 mb-2">Biggest Opportunity</h4>
                        <p className="text-sm text-emerald-700">{executiveSummary.biggest_opportunity}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="text-xs text-slate-500 text-center pt-4 border-t border-slate-200">
                  Generated {new Date(executiveSummary.created_date).toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}