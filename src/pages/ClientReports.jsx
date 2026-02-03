import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Loader2, CheckCircle2, Send, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';

export default function ClientReports() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentReport, setCurrentReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [pastReports, setPastReports] = useState([]);
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

        const [businessData, reports] = await Promise.all([
          base44.entities.Business.filter({ id: businessId }),
          base44.entities.Report.filter({ business_id: businessId }, '-created_date')
        ]);

        if (!businessData || businessData.length === 0) {
          window.location.href = createPageUrl('Businesses');
          return;
        }

        setBusiness(businessData[0]);
        setPastReports(reports);

        // Set default month to current month
        const now = new Date();
        const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(defaultMonth);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateClientReport', {
        business_id: business.id,
        report_month: selectedMonth
      });

      if (response.data.success) {
        setCurrentReport(response.data.report);
        setReportData(response.data.data);
        setInternalNotes(response.data.report.internal_notes || '');

        // Refresh past reports
        const reports = await base44.entities.Report.filter({ 
          business_id: business.id 
        }, '-created_date');
        setPastReports(reports);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleLoadReport = async (reportId) => {
    try {
      const reports = await base44.entities.Report.filter({ id: reportId });
      if (reports.length > 0) {
        const report = reports[0];
        setCurrentReport(report);
        setSelectedMonth(report.report_month);
        setInternalNotes(report.internal_notes || '');

        // Load associated data
        const [year, month] = report.report_month.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const [reviews, tasks, contentItems, kpis] = await Promise.all([
          base44.entities.Review.filter({ business_id: business.id }),
          base44.entities.Task.filter({ business_id: business.id }),
          base44.entities.ContentItem.filter({ business_id: business.id }),
          base44.entities.ManualKPI.filter({ business_id: business.id, period: report.report_month })
        ]);

        const monthReviews = reviews.filter(r => {
          const reviewDate = new Date(r.created_at_platform || r.created_date);
          return reviewDate >= startDate && reviewDate <= endDate;
        });

        const completedTasks = tasks.filter(t => {
          const taskDate = new Date(t.updated_date);
          return t.status === 'done' && taskDate >= startDate && taskDate <= endDate;
        });

        const producedContent = contentItems.filter(c => {
          const contentDate = new Date(c.created_date);
          return (c.status === 'posted' || c.status === 'approved') && contentDate >= startDate && contentDate <= endDate;
        });

        setReportData({
          total_reviews: monthReviews.length,
          positive_reviews: monthReviews.filter(r => r.rating >= 4).length,
          negative_reviews: monthReviews.filter(r => r.rating <= 2).length,
          completed_tasks: completedTasks.length,
          produced_content: producedContent.length,
          kpis: kpis
        });
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await base44.entities.Report.update(currentReport.id, { status: newStatus });
      setCurrentReport({ ...currentReport, status: newStatus });
      
      // Refresh past reports
      const reports = await base44.entities.Report.filter({ 
        business_id: business.id 
      }, '-created_date');
      setPastReports(reports);

      alert(`Report ${newStatus === 'finalized' ? 'finalized' : 'marked as sent'}!`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update report status.');
    }
  };

  const handleSaveNotes = async () => {
    try {
      await base44.entities.Report.update(currentReport.id, { 
        internal_notes: internalNotes 
      });
      alert('Internal notes saved!');
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes.');
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

  const impactColors = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
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
        <p className="text-slate-500">Generate professional monthly reports for {business.name}</p>
      </div>

      {/* Report Setup */}
      <Card className="shadow-lg mb-8">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-2xl">Generate New Report</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Report Month</label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={currentReport?.status === 'finalized' || currentReport?.status === 'sent'}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                disabled={generating || !selectedMonth || (currentReport?.status !== 'draft' && pastReports.some(r => r.report_month === selectedMonth && r.status !== 'draft'))}
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
                    {currentReport?.report_month === selectedMonth && currentReport.status === 'draft' 
                      ? 'Regenerate Report' 
                      : 'Generate Report'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Report */}
      {currentReport && (
        <>
          {/* Report Header */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {new Date(currentReport.report_month + '-01').toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })} Report
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Generated {new Date(currentReport.created_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={`border ${statusColors[currentReport.status]}`}>
                  {currentReport.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-2xl">Executive Summary</CardTitle>
              <p className="text-slate-500 text-sm mt-1">AI-generated monthly overview</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {currentReport.executive_summary}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Review & Reputation Summary */}
          {reportData && (
            <Card className="shadow-lg mb-8">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-2xl">Review & Reputation Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-3xl font-bold text-slate-900">{reportData.total_reviews}</p>
                    <p className="text-sm text-slate-500 mt-1">Total Reviews Analyzed</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{reportData.positive_reviews}</p>
                    <p className="text-sm text-slate-500 mt-1">Positive (4-5 ⭐)</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-3xl font-bold text-red-600">{reportData.negative_reviews}</p>
                    <p className="text-sm text-slate-500 mt-1">Negative (1-2 ⭐)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Completed */}
          {reportData && (
            <Card className="shadow-lg mb-8">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-2xl">Work Completed</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-slate-900">Tasks Completed</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{reportData.completed_tasks}</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-6 h-6 text-indigo-600" />
                      <h3 className="font-semibold text-slate-900">Content Produced</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{reportData.produced_content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual KPIs */}
          {reportData?.kpis?.length > 0 && (
            <Card className="shadow-lg mb-8">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-2xl">Manual / Client-Provided Metrics</CardTitle>
                <p className="text-slate-500 text-sm mt-1">KPIs entered by the agency</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {reportData.kpis.map((kpi, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{kpi.metric_name}</p>
                        {kpi.notes && (
                          <p className="text-sm text-slate-500 mt-1">{kpi.notes}</p>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          {currentReport.recommendations && (
            <Card className="shadow-lg mb-8">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-2xl">AI Recommendations (Next Month Plan)</CardTitle>
                <p className="text-slate-500 text-sm mt-1">Prioritized actions for next month</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {JSON.parse(currentReport.recommendations).map((rec, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-slate-900 text-lg">{rec.title}</h3>
                        <div className="flex gap-2">
                          <Badge className={impactColors[rec.impact]}>
                            {rec.impact} impact
                          </Badge>
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                      </div>
                      <p className="text-slate-600">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Internal Notes */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-slate-500" />
                <div>
                  <CardTitle className="text-2xl">Internal Notes (Not Client-Facing)</CardTitle>
                  <p className="text-slate-500 text-sm mt-1">Private notes for agency use only</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                placeholder="Add internal notes about this report, client context, or follow-up items..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
                className="mb-4"
                disabled={currentReport.status !== 'draft'}
              />
              {currentReport.status === 'draft' && (
                <Button onClick={handleSaveNotes} variant="outline">
                  Save Notes
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Report Actions */}
          <Card className="shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {currentReport.status === 'draft' && (
                  <Button
                    onClick={() => handleUpdateStatus('finalized')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Finalize Report
                  </Button>
                )}
                {currentReport.status === 'finalized' && (
                  <Button
                    onClick={() => handleUpdateStatus('sent')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Mark as Sent
                  </Button>
                )}
                <Button variant="outline" onClick={() => window.print()}>
                  Export / Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Past Reports */}
      {pastReports.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-2xl">Past Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {pastReports.map((report) => (
                <div 
                  key={report.id} 
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleLoadReport(report.id)}
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
                  <Badge className={`border ${statusColors[report.status]}`}>
                    {report.status}
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