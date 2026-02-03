import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Loader2, CheckCircle2, Send, Lock, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';

export default function ClientReports() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportMonth, setReportMonth] = useState('');
  const [reportData, setReportData] = useState(null);
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const businessId = urlParams.get('id');

        if (!businessId) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        const [businessData, reportsData] = await Promise.all([
          base44.entities.Business.filter({ id: businessId }),
          base44.entities.Report.filter({ business_id: businessId }, '-created_date')
        ]);

        if (!businessData || businessData.length === 0) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        setBusiness(businessData[0]);
        setReports(reportsData);

        // Set default month to current month
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setReportMonth(currentMonth);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleGenerateReport = async () => {
    if (!reportMonth) {
      alert('Please select a report month');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateClientReport', {
        business_id: business.id,
        report_month: reportMonth
      });

      if (response.data.success) {
        setCurrentReport(response.data.report);
        setReportData(response.data.data);
        setInternalNotes(response.data.report.internal_notes || '');

        // Refresh reports list
        const reportsData = await base44.entities.Report.filter({ 
          business_id: business.id 
        }, '-created_date');
        setReports(reportsData);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleLoadReport = async (report) => {
    setCurrentReport(report);
    setReportMonth(report.report_month);
    setInternalNotes(report.internal_notes || '');

    // Load associated data
    const monthStart = new Date(report.report_month + '-01');
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const [reviews, tasks, contentItems, kpis] = await Promise.all([
      base44.entities.Review.filter({ business_id: business.id }),
      base44.entities.Task.filter({ business_id: business.id }),
      base44.entities.ContentItem.filter({ business_id: business.id }),
      base44.entities.ManualKPI.filter({ business_id: business.id, period: report.report_month })
    ]);

    // Filter by month
    const monthReviews = reviews.filter(r => {
      const reviewDate = new Date(r.created_at_platform || r.created_date);
      return reviewDate >= monthStart && reviewDate < monthEnd;
    });

    const monthTasks = tasks.filter(t => {
      if (!t.updated_date) return false;
      const taskDate = new Date(t.updated_date);
      return taskDate >= monthStart && taskDate < monthEnd && t.status === 'done';
    });

    const monthContent = contentItems.filter(c => {
      if (!c.updated_date) return false;
      const contentDate = new Date(c.updated_date);
      return contentDate >= monthStart && contentDate < monthEnd;
    });

    setReportData({
      reviews: {
        total: monthReviews.length,
        positive: monthReviews.filter(r => r.rating >= 4).length,
        negative: monthReviews.filter(r => r.rating <= 3).length,
        items: monthReviews
      },
      tasks: {
        completed: monthTasks.length,
        items: monthTasks
      },
      content: {
        total: monthContent.length,
        items: monthContent
      },
      kpis: kpis
    });
  };

  const handleSaveNotes = async () => {
    if (!currentReport) return;

    try {
      await base44.entities.Report.update(currentReport.id, {
        internal_notes: internalNotes
      });
      alert('Internal notes saved');
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes');
    }
  };

  const handleFinalizeReport = async () => {
    if (!currentReport) return;

    try {
      await base44.entities.Report.update(currentReport.id, {
        status: 'finalized'
      });
      
      const updatedReport = { ...currentReport, status: 'finalized' };
      setCurrentReport(updatedReport);
      
      const reportsData = await base44.entities.Report.filter({ 
        business_id: business.id 
      }, '-created_date');
      setReports(reportsData);
      
      alert('Report finalized and locked');
    } catch (error) {
      console.error('Failed to finalize report:', error);
      alert('Failed to finalize report');
    }
  };

  const handleMarkAsSent = async () => {
    if (!currentReport) return;

    try {
      await base44.entities.Report.update(currentReport.id, {
        status: 'sent'
      });
      
      const updatedReport = { ...currentReport, status: 'sent' };
      setCurrentReport(updatedReport);
      
      const reportsData = await base44.entities.Report.filter({ 
        business_id: business.id 
      }, '-created_date');
      setReports(reportsData);
      
      alert('Report marked as sent');
    } catch (error) {
      console.error('Failed to mark as sent:', error);
      alert('Failed to mark as sent');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    finalized: 'bg-blue-100 text-blue-700 border-blue-200',
    sent: 'bg-green-100 text-green-700 border-green-200'
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
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Client Reports</h1>
        <p className="text-slate-500">Monthly performance reports for {business.name}</p>
      </div>

      {/* Report Setup */}
      <Card className="shadow-lg mb-8">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Report Month
              </label>
              <Input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                disabled={currentReport?.status !== 'draft' && currentReport?.status}
              />
            </div>
            <Button 
              onClick={handleGenerateReport}
              disabled={generating || !reportMonth || (currentReport?.status !== 'draft' && currentReport?.status)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
          {currentReport?.status !== 'draft' && currentReport?.status && (
            <p className="text-sm text-slate-500 mt-3">
              This report is {currentReport.status}. Only draft reports can be regenerated.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Report History */}
      {reports.length > 0 && (
        <Card className="shadow-lg mb-8">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Report History</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {reports.map((report) => (
                <div 
                  key={report.id}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    currentReport?.id === report.id 
                      ? 'border-indigo-300 bg-indigo-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => handleLoadReport(report)}
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {new Date(report.report_month + '-01').toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-slate-500">
                      Generated {new Date(report.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={statusColors[report.status]}>
                    {report.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Report Display */}
      {currentReport && reportData && (
        <>
          {/* Executive Summary */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Executive Summary</CardTitle>
                <Badge className={statusColors[currentReport.status]}>
                  {currentReport.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-slate max-w-none">
                {currentReport.executive_summary ? (
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {currentReport.executive_summary}
                  </p>
                ) : (
                  <p className="text-slate-500 italic">No executive summary generated yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review & Reputation Summary */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-2xl">Review & Reputation Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {reportData.reviews.total > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-3xl font-bold text-slate-900">{reportData.reviews.total}</p>
                      <p className="text-sm text-slate-600">Total Reviews</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-700">{reportData.reviews.positive}</p>
                      <p className="text-sm text-slate-600">Positive (4-5★)</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-3xl font-bold text-red-700">{reportData.reviews.negative}</p>
                      <p className="text-sm text-slate-600">Negative (1-3★)</p>
                    </div>
                  </div>

                  {reportData.reviews.items.filter(r => r.ai_response_draft).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">AI Response Examples</h4>
                      <div className="space-y-3">
                        {reportData.reviews.items
                          .filter(r => r.ai_response_draft)
                          .slice(0, 2)
                          .map((review, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-lg p-4">
                              <p className="text-sm text-slate-600 mb-2">Response to {review.reviewer_name}:</p>
                              <p className="text-sm text-slate-700 italic">"{review.ai_response_draft}"</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No reviews for this month</p>
              )}
            </CardContent>
          </Card>

          {/* Work Completed */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-2xl">Work Completed</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Tasks Completed</h4>
                  {reportData.tasks.completed > 0 ? (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-indigo-600">{reportData.tasks.completed}</p>
                      <div className="space-y-1">
                        {reportData.tasks.items.slice(0, 5).map((task, idx) => (
                          <p key={idx} className="text-sm text-slate-600">• {task.title}</p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">No tasks completed this month</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Content Produced</h4>
                  {reportData.content.total > 0 ? (
                    <div className="space-y-3">
                      <p className="text-2xl font-bold text-indigo-600">{reportData.content.total}</p>
                      <div className="space-y-2">
                        {reportData.content.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">{item.type} - {item.platform}</span>
                            <Badge variant="outline" className="text-xs">{item.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">No content produced this month</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual KPIs */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-2xl">Manual / Client-Provided Metrics</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Metrics entered manually for this period</p>
            </CardHeader>
            <CardContent className="p-6">
              {reportData.kpis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportData.kpis.map((kpi, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <p className="text-sm text-slate-600 mb-1">{kpi.metric_name}</p>
                      <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                      {kpi.notes && (
                        <p className="text-xs text-slate-500 mt-2">{kpi.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No manual KPIs entered for this month</p>
              )}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-2xl">Recommendations for Next Month</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {currentReport.recommendations ? (
                <div className="space-y-4">
                  {JSON.parse(currentReport.recommendations).map((rec, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-slate-900">{rec.recommendation}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{rec.focus_area}</Badge>
                          <Badge className={
                            rec.impact === 'high' ? 'bg-green-100 text-green-700' :
                            rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }>
                            {rec.impact} impact
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No recommendations generated yet</p>
              )}
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-2xl">Internal Notes</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Agency-only notes (not included in client report)</p>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes, team reminders, or observations..."
                className="min-h-[120px] mb-3"
                disabled={currentReport.status !== 'draft'}
              />
              <Button 
                onClick={handleSaveNotes}
                variant="outline"
                size="sm"
                disabled={currentReport.status !== 'draft'}
              >
                Save Notes
              </Button>
            </CardContent>
          </Card>

          {/* Report Actions */}
          <Card className="shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-2xl">Report Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-3">
                {currentReport.status === 'draft' && (
                  <Button 
                    onClick={handleFinalizeReport}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Finalize Report
                  </Button>
                )}
                {currentReport.status === 'finalized' && (
                  <Button 
                    onClick={handleMarkAsSent}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Mark as Sent
                  </Button>
                )}
                {currentReport.status === 'sent' && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Report has been sent to client</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}