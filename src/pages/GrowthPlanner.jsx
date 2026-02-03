import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Loader2, CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';

export default function GrowthPlanner() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [planHistory, setPlanHistory] = useState([]);
  const [converting, setConverting] = useState({ tasks: false, content: false });
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const businessId = urlParams.get('id');

        if (!businessId) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        const [businessData, plans] = await Promise.all([
          base44.entities.Business.filter({ id: businessId }),
          base44.entities.GrowthPlan.filter({ business_id: businessId }, '-created_date')
        ]);

        if (!businessData || businessData.length === 0) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        setBusiness(businessData[0]);
        setPlanHistory(plans);

        // Load most recent active plan
        const activePlan = plans.find(p => p.status === 'active') || plans[0];
        if (activePlan) {
          await loadPlan(activePlan, businessData[0].id);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadPlan = async (plan, businessId) => {
    setCurrentPlan(plan);
    setPlanData({
      operational_fixes: JSON.parse(plan.operational_fixes || '[]'),
      content_plan: JSON.parse(plan.content_plan || '[]'),
      reputation_plan: JSON.parse(plan.reputation_plan || '[]'),
      strategic_focus: JSON.parse(plan.strategic_focus || '[]')
    });

    // Calculate progress
    const [tasks, contentItems] = await Promise.all([
      base44.entities.Task.filter({ business_id: businessId }),
      base44.entities.ContentItem.filter({ business_id: businessId })
    ]);

    const planCreatedDate = new Date(plan.created_date);
    const completedTasks = tasks.filter(t => 
      t.status === 'done' && 
      new Date(t.updated_date) >= planCreatedDate
    ).length;

    const producedContent = contentItems.filter(c => 
      (c.status === 'posted' || c.status === 'approved') &&
      new Date(c.updated_date) >= planCreatedDate
    ).length;

    const operationalFixesCount = JSON.parse(plan.operational_fixes || '[]').length;
    const contentPlanCount = JSON.parse(plan.content_plan || '[]').length;

    setProgress({
      tasks: { completed: completedTasks, planned: operationalFixesCount },
      content: { completed: producedContent, planned: contentPlanCount }
    });
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateGrowthPlan', {
        business_id: business.id
      });

      if (response.data.success) {
        await loadPlan(response.data.plan, business.id);

        const plans = await base44.entities.GrowthPlan.filter({ 
          business_id: business.id 
        }, '-created_date');
        setPlanHistory(plans);
      }
    } catch (error) {
      console.error('Failed to generate plan:', error);
      alert('Failed to generate growth plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleConvertToTasks = async () => {
    if (!currentPlan || !planData) return;

    setConverting({ ...converting, tasks: true });
    try {
      const user = await base44.auth.me();
      const fixes = planData.operational_fixes;

      for (const fix of fixes) {
        await base44.entities.Task.create({
          agency_id: business.agency_id,
          business_id: business.id,
          title: fix.title,
          type: 'other',
          status: 'todo',
          priority: fix.priority,
          created_by_user_id: user.id
        });
      }

      alert(`Created ${fixes.length} tasks from operational fixes!`);
      
      // Recalculate progress
      await loadPlan(currentPlan, business.id);
    } catch (error) {
      console.error('Failed to convert to tasks:', error);
      alert('Failed to create tasks.');
    } finally {
      setConverting({ ...converting, tasks: false });
    }
  };

  const handleConvertToContent = async () => {
    if (!currentPlan || !planData) return;

    setConverting({ ...converting, content: true });
    try {
      const user = await base44.auth.me();
      const contentPlans = planData.content_plan;

      for (const content of contentPlans) {
        await base44.entities.ContentItem.create({
          agency_id: business.agency_id,
          business_id: business.id,
          platform: content.platform,
          type: content.platform === 'tiktok' ? 'video' : 'reel',
          status: 'idea',
          caption: `${content.theme} - ${content.angle}`,
          created_by_user_id: user.id
        });
      }

      alert(`Created ${contentPlans.length} content items from plan!`);
      
      // Recalculate progress
      await loadPlan(currentPlan, business.id);
    } catch (error) {
      console.error('Failed to convert to content:', error);
      alert('Failed to create content items.');
    } finally {
      setConverting({ ...converting, content: false });
    }
  };

  const handleMarkComplete = async () => {
    if (!currentPlan) return;

    try {
      await base44.entities.GrowthPlan.update(currentPlan.id, {
        status: 'completed'
      });

      setCurrentPlan({ ...currentPlan, status: 'completed' });

      const plans = await base44.entities.GrowthPlan.filter({ 
        business_id: business.id 
      }, '-created_date');
      setPlanHistory(plans);

      alert('Plan marked as completed!');
    } catch (error) {
      console.error('Failed to mark complete:', error);
      alert('Failed to mark plan as complete.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Link 
        to={createPageUrl('BusinessDetail') + `?id=${business.id}`}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Business
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">30-Day Growth Planner</h1>
        <p className="text-slate-500">Actionable growth plans for {business.name}</p>
      </div>

      {/* Planner Setup */}
      <Card className="shadow-lg mb-8">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Generate New Plan</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 mb-1">
                <strong>Plan Period:</strong> Next 30 days
              </p>
              {currentPlan && (
                <p className="text-sm text-slate-500">
                  Last generated: {new Date(currentPlan.created_date).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Generate 30-Day Plan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentPlan && planData && (
        <>
          {/* Plan Summary */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Plan Summary</CardTitle>
                <Badge className={currentPlan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                  {currentPlan.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-700 leading-relaxed mb-6">{currentPlan.plan_summary}</p>
              
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">Strategic Focus</h3>
                <ul className="space-y-2">
                  {planData.strategic_focus.map((focus, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <h4 className="font-semibold text-indigo-900 mb-2">Success Definition</h4>
                <p className="text-indigo-800">{currentPlan.success_definition}</p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracking */}
          {progress && currentPlan.status === 'active' && (
            <Card className="shadow-lg mb-8">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-2xl">Plan Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Tasks Completed</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-indigo-600">{progress.tasks.completed}</span>
                      <span className="text-slate-500">/ {progress.tasks.planned} planned</span>
                    </div>
                    <div className="mt-3 bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (progress.tasks.completed / progress.tasks.planned) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Content Produced</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-600">{progress.content.completed}</span>
                      <span className="text-slate-500">/ {progress.content.planned} planned</span>
                    </div>
                    <div className="mt-3 bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (progress.content.completed / progress.content.planned) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operational Fixes */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">A) Operational Fixes (Internal)</CardTitle>
                  <p className="text-slate-500 text-sm mt-1">Internal improvements to address root causes</p>
                </div>
                <Button
                  onClick={handleConvertToTasks}
                  disabled={converting.tasks}
                  variant="outline"
                  size="sm"
                >
                  {converting.tasks ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Convert to Tasks'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {planData.operational_fixes.map((fix, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-slate-900">{fix.title}</h4>
                      <div className="flex gap-2">
                        <Badge className={priorityColors[fix.priority]}>
                          {fix.priority}
                        </Badge>
                        <Badge variant="outline">{fix.owner_type}</Badge>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">{fix.description}</p>
                    <div className="bg-slate-50 rounded p-3">
                      <p className="text-xs text-slate-600">
                        <strong>Root Cause:</strong> {fix.linked_root_cause}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Plan */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">B) Content & Marketing Plan</CardTitle>
                  <p className="text-slate-500 text-sm mt-1">Content strategy for next 30 days</p>
                </div>
                <Button
                  onClick={handleConvertToContent}
                  disabled={converting.content}
                  variant="outline"
                  size="sm"
                >
                  {converting.content ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Convert to Content Items'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planData.content_plan.map((content, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{content.platform}</Badge>
                      <Badge className="bg-purple-100 text-purple-700">{content.frequency}</Badge>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">{content.theme}</h4>
                    <p className="text-sm text-slate-600 mb-3">{content.angle}</p>
                    <div className="bg-slate-50 rounded p-3">
                      <p className="text-xs text-slate-600">
                        <strong>Goal:</strong> {content.goal}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reputation Plan */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-2xl">C) Review & Reputation Plan</CardTitle>
              <p className="text-slate-500 text-sm mt-1">Response strategies and prevention actions</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {planData.reputation_plan.map((rep, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-5">
                    <h4 className="font-semibold text-slate-900 mb-3">{rep.strategy}</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded p-3 border border-blue-100">
                        <p className="text-sm text-blue-900">
                          <strong>Actions:</strong> {rep.actions}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded p-3 border border-green-100">
                        <p className="text-sm text-green-900">
                          <strong>Prevents:</strong> {rep.prevents}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Plan Actions */}
          {currentPlan.status === 'active' && (
            <Card className="shadow-lg mb-8">
              <CardContent className="p-6">
                <Button
                  onClick={handleMarkComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Plan as Completed
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Plan History */}
      {planHistory.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-2xl">Plan History</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {planHistory.map((plan) => (
                <div 
                  key={plan.id}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    currentPlan?.id === plan.id 
                      ? 'border-indigo-300 bg-indigo-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => loadPlan(plan, business.id)}
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      30-Day Plan - {new Date(plan.created_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {plan.plan_summary?.substring(0, 100)}...
                    </p>
                  </div>
                  <Badge className={plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                    {plan.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}