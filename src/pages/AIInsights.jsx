import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, TrendingUp, Lightbulb, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';

export default function AIInsights() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingAngles, setGeneratingAngles] = useState(false);
  const [insights, setInsights] = useState(null);
  const [contentIdeas, setContentIdeas] = useState([]);
  const [insightHistory, setInsightHistory] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const businessId = urlParams.get('id');

        if (!businessId) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        const [businessData, reviewData, insightsData, ideasData] = await Promise.all([
          base44.entities.Business.filter({ id: businessId }),
          base44.entities.Review.filter({ business_id: businessId }),
          base44.entities.AIInsight.filter({ business_id: businessId }, '-created_date'),
          base44.entities.AIContentIdea.filter({ business_id: businessId }, '-created_date')
        ]);

        if (!businessData || businessData.length === 0) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        setBusiness(businessData[0]);
        setReviews(reviewData);
        setInsightHistory(insightsData);
        setContentIdeas(ideasData);

        // Load latest insights if available
        if (insightsData.length > 0) {
          const latest = insightsData[0];
          try {
            setInsights({
              primary_issues: JSON.parse(latest.supporting_evidence || '[]').filter(i => i.issue),
              opportunities: JSON.parse(latest.supporting_evidence || '[]').filter(i => i.opportunity),
              root_causes: JSON.parse(latest.root_causes || '[]'),
              fix_first: JSON.parse(latest.action_items || '[]'),
              risks: []
            });
          } catch (e) {
            console.error('Failed to parse insights:', e);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleGenerateInsights = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateAIInsights', {
        business_id: business.id
      });

      if (response.data.success) {
        setInsights(response.data.insights);
        
        // Refresh history
        const insightsData = await base44.entities.AIInsight.filter({ 
          business_id: business.id 
        }, '-created_date');
        setInsightHistory(insightsData);
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
      alert('Failed to generate insights. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAngles = async () => {
    setGeneratingAngles(true);
    try {
      const response = await base44.functions.invoke('generateMarketingAngles', {
        business_id: business.id
      });

      if (response.data.success) {
        setContentIdeas(response.data.ideas);
      }
    } catch (error) {
      console.error('Failed to generate angles:', error);
      alert('Failed to generate marketing angles. Please try again.');
    } finally {
      setGeneratingAngles(false);
    }
  };

  const handleConvertToTasks = async (action) => {
    try {
      const user = await base44.auth.me();
      await base44.entities.Task.create({
        agency_id: business.agency_id,
        business_id: business.id,
        title: action.action,
        type: action.owner === 'ops' ? 'other' : 'post',
        status: 'todo',
        priority: action.impact === 'high' ? 'high' : action.impact === 'medium' ? 'medium' : 'low',
        created_by_user_id: user.id
      });
      alert('Task created successfully!');
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <Link 
          to={createPageUrl('BusinessDetail') + `?id=${business?.id || ''}`}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Business
        </Link>

        <Card className="shadow-lg">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Import Reviews to Unlock Insights</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              AI Insights analyzes your customer reviews to identify issues, opportunities, and actionable recommendations.
            </p>
            <Link to={createPageUrl('Reviews')}>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Go to Reviews
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const severityColors = {
    low: 'bg-blue-100 text-blue-700 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Link 
        to={createPageUrl('BusinessDetail') + `?id=${business?.id || ''}`}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Business
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Insights</h1>
        <p className="text-slate-500">
          Data-driven analysis from {reviews.length} customer review{reviews.length !== 1 ? 's' : ''}
        </p>
      </div>

      {!insights ? (
        <Card className="shadow-lg mb-8">
          <CardContent className="p-12 text-center">
            <Lightbulb className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Generate Your First Insights</h2>
            <p className="text-slate-500 mb-6 max-w-lg mx-auto">
              AI will analyze your reviews, tasks, and content pipeline to identify issues, opportunities, and actionable recommendations.
            </p>
            <Button 
              onClick={handleGenerateInsights}
              disabled={generating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                'Generate Insights'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Section 1: Overall Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-lg border-l-4 border-red-500">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <CardTitle>Primary Business Issues</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {insights.primary_issues?.length > 0 ? (
                  <div className="space-y-4">
                    {insights.primary_issues.slice(0, 3).map((issue, idx) => (
                      <div key={idx} className="pb-4 border-b last:border-0 border-slate-100">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-slate-900">{issue.issue}</p>
                          <span className={`text-xs px-2 py-1 rounded-full border ${severityColors[issue.severity]}`}>
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">Mentioned {issue.frequency} time{issue.frequency !== 1 ? 's' : ''}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No major issues detected</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-green-500">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <CardTitle>Biggest Opportunities</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {insights.opportunities?.length > 0 ? (
                  <div className="space-y-4">
                    {insights.opportunities.slice(0, 3).map((opp, idx) => (
                      <div key={idx} className="pb-4 border-b last:border-0 border-slate-100">
                        <p className="font-medium text-slate-900 mb-1">{opp.opportunity}</p>
                        <p className="text-xs text-slate-500">Source: {opp.source}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No opportunities identified yet</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-orange-500">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <CardTitle>Immediate Risk Flags</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {insights.risks?.length > 0 ? (
                  <div className="space-y-3">
                    {insights.risks.map((risk, idx) => (
                      <div key={idx} className="pb-3 border-b last:border-0 border-slate-100">
                        <p className="font-medium text-slate-900 text-sm mb-1">{risk.risk}</p>
                        <p className="text-xs text-slate-500">{risk.trigger}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-slate-600 font-medium">No major risks detected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Root Cause Analysis */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-2xl">Root Cause Analysis</CardTitle>
              <p className="text-slate-500 text-sm mt-1">AI-identified patterns from customer feedback</p>
            </CardHeader>
            <CardContent className="p-6">
              {insights.root_causes?.length > 0 ? (
                <div className="space-y-6">
                  {insights.root_causes.map((cause, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-slate-900 text-lg">{cause.cause}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full border ${severityColors[cause.confidence]}`}>
                          {cause.confidence} confidence
                        </span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs font-medium text-slate-700 mb-2">Supporting Evidence:</p>
                        <div className="space-y-2">
                          {cause.evidence.map((quote, qIdx) => (
                            <p key={qIdx} className="text-sm text-slate-600 italic border-l-2 border-slate-300 pl-3">
                              "{quote}"
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No root causes identified yet</p>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Fix First */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">What Should We Fix First?</CardTitle>
                  <p className="text-slate-500 text-sm mt-1">Prioritized actions by impact and effort</p>
                </div>
                <Button 
                  onClick={handleGenerateInsights}
                  variant="outline"
                  size="sm"
                  disabled={generating}
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {insights.fix_first?.length > 0 ? (
                <div className="space-y-4">
                  {insights.fix_first.map((action, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-slate-900">{action.action}</h3>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleConvertToTasks(action)}
                        >
                          Convert to Task
                        </Button>
                      </div>
                      <p className="text-slate-600 text-sm mb-4">{action.why}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${severityColors[action.impact]}`}>
                          {action.impact} impact
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${severityColors[action.effort]}`}>
                          {action.effort} effort
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full border border-slate-300 bg-slate-50">
                          Owner: {action.owner}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No priority actions identified yet</p>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Marketing Angles */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Marketing Angles & Content Ideas</CardTitle>
                  <p className="text-slate-500 text-sm mt-1">Grounded in actual customer sentiment</p>
                </div>
                <Button 
                  onClick={handleGenerateAngles}
                  disabled={generatingAngles}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {generatingAngles ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Ideas'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {contentIdeas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentIdeas.map((idea, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                          {idea.platform_suggestion}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-2">{idea.hook}</h4>
                      <p className="text-sm text-slate-600 mb-3">{idea.angle}</p>
                      <p className="text-xs text-slate-500">
                        Based on: {idea.source_theme}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">Click "Generate Ideas" to create content angles</p>
              )}
            </CardContent>
          </Card>

          {/* Section 6: Insight History */}
          {insightHistory.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-2xl">Insight History</CardTitle>
                <p className="text-slate-500 text-sm mt-1">Past AI analysis runs</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {insightHistory.slice(0, 5).map((history, idx) => (
                    <div key={history.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 capitalize">{history.insight_type} Analysis</p>
                        <p className="text-sm text-slate-500">
                          {new Date(history.created_date).toLocaleDateString()} at {new Date(history.created_date).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${severityColors[history.confidence_level]}`}>
                        {history.confidence_level}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}