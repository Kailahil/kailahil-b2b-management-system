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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
    <div className="max-w-7xl mx-auto">
      <Link 
        to={createPageUrl('BusinessDetail', `?id=${business.id}`)}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {business.name}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Executive Dashboard</h1>
        <p className="text-slate-600">{business.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1 - Business Status */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Status</label>
                <Badge className={
                  business.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  business.status === 'onboarding' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }>
                  {business.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Primary Media Specialist</label>
                <p className="text-slate-900">
                  {business.primary_media_user_id ? 'Assigned' : 'Not Set'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Onboarding Progress</span>
                <span className="text-sm font-bold text-slate-900">{completionPercent}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full mb-4">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                    <span className={item.completed ? 'text-slate-900' : 'text-slate-500'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2 - Review Health */}
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Review Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600">Import reviews to unlock insights</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-slate-900">{reviews.length}</div>
                    <div className="text-xs text-slate-600">Total</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-emerald-700">{positiveReviews.length}</div>
                    <div className="text-xs text-emerald-600">Positive</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-700">{negativeReviews.length}</div>
                    <div className="text-xs text-red-600">Negative</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-center">
                  Based on {reviews.length} imported review{reviews.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
                className="bg-indigo-600 hover:bg-indigo-700"
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
  );
}