import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { business_id, report_month } = await req.json();

    if (!business_id || !report_month) {
      return Response.json({ error: 'business_id and report_month required' }, { status: 400 });
    }

    // Fetch business and all relevant data for the month
    const [business, reviews, tasks, contentItems, kpis, insights] = await Promise.all([
      base44.entities.Business.filter({ id: business_id }),
      base44.entities.Review.filter({ business_id }),
      base44.entities.Task.filter({ business_id }),
      base44.entities.ContentItem.filter({ business_id }),
      base44.entities.ManualKPI.filter({ business_id, period: report_month }),
      base44.entities.AIInsight.filter({ business_id })
    ]);

    if (!business || business.length === 0) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    const bizData = business[0];

    // Filter data for the report month
    const monthStart = new Date(report_month + '-01');
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

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

    // Build context for AI
    const reviewSummary = {
      total: monthReviews.length,
      positive: monthReviews.filter(r => r.rating >= 4).length,
      negative: monthReviews.filter(r => r.rating <= 3).length,
      themes: {
        positive: monthReviews.filter(r => r.rating >= 4).map(r => r.ai_topics || r.text?.substring(0, 100)).filter(Boolean),
        negative: monthReviews.filter(r => r.rating <= 3).map(r => r.ai_topics || r.text?.substring(0, 100)).filter(Boolean)
      }
    };

    const taskSummary = {
      completed: monthTasks.length,
      byType: monthTasks.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {})
    };

    const contentSummary = {
      total: monthContent.length,
      byStatus: monthContent.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {}),
      byPlatform: monthContent.reduce((acc, c) => {
        acc[c.platform] = (acc[c.platform] || 0) + 1;
        return acc;
      }, {})
    };

    const kpiSummary = kpis.map(k => ({
      metric: k.metric_name,
      value: k.value,
      notes: k.notes
    }));

    const latestInsights = insights.slice(0, 3).map(i => ({
      type: i.insight_type,
      summary: i.root_causes,
      confidence: i.confidence_level
    }));

    // Generate Executive Summary
    const summaryPrompt = `You are writing an executive summary for a monthly client report for ${bizData.name}.

REPORT MONTH: ${report_month}

DATA AVAILABLE:
Reviews: ${reviewSummary.total} total (${reviewSummary.positive} positive, ${reviewSummary.negative} negative)
Positive themes: ${reviewSummary.themes.positive.slice(0, 5).join(', ') || 'None'}
Negative themes: ${reviewSummary.themes.negative.slice(0, 5).join(', ') || 'None'}

Tasks completed: ${taskSummary.completed}
Task breakdown: ${JSON.stringify(taskSummary.byType)}

Content produced: ${contentSummary.total} items
Content status: ${JSON.stringify(contentSummary.byStatus)}
Platforms: ${JSON.stringify(contentSummary.byPlatform)}

Manual KPIs: ${kpiSummary.length > 0 ? JSON.stringify(kpiSummary) : 'None provided'}

Recent AI Insights: ${latestInsights.length > 0 ? JSON.stringify(latestInsights) : 'None available'}

INSTRUCTIONS:
Write a 2-3 paragraph executive summary for the client covering:
1. Overall health this month
2. What improved
3. What needs attention
4. High-level next steps

RULES:
- Professional, client-facing tone
- No fabricated metrics
- If data is missing, explicitly state "No data available for [metric]"
- Only reference actual numbers provided above
- Be specific and actionable

Return plain text (not JSON).`;

    const executiveSummary = await base44.integrations.Core.InvokeLLM({
      prompt: summaryPrompt
    });

    // Generate Recommendations
    const recommendationsPrompt = `Generate 3-6 prioritized recommendations for next month for ${bizData.name}.

BASE YOUR RECOMMENDATIONS ON:
Review sentiment: ${JSON.stringify(reviewSummary)}
AI Insights: ${JSON.stringify(latestInsights)}
Content performance: ${JSON.stringify(contentSummary)}
Task completion: ${JSON.stringify(taskSummary)}

Each recommendation must include:
- The recommendation
- Reason (linked to actual data)
- Expected impact (low/medium/high)
- Focus area (operational / content / marketing)

Return JSON array:
[
  {
    "recommendation": "Clear, actionable recommendation",
    "reason": "Why this matters based on actual data",
    "impact": "low|medium|high",
    "focus_area": "operational|content|marketing"
  }
]`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt: recommendationsPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                recommendation: { type: "string" },
                reason: { type: "string" },
                impact: { type: "string" },
                focus_area: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Create or update report
    const existingReports = await base44.entities.Report.filter({
      business_id,
      report_month
    });

    let report;
    if (existingReports.length > 0 && existingReports[0].status === 'draft') {
      // Update existing draft
      report = await base44.asServiceRole.entities.Report.update(existingReports[0].id, {
        executive_summary: executiveSummary,
        recommendations: JSON.stringify(recommendations.recommendations || [])
      });
    } else {
      // Create new report
      report = await base44.asServiceRole.entities.Report.create({
        agency_id: bizData.agency_id,
        business_id,
        report_month,
        status: 'draft',
        executive_summary: executiveSummary,
        recommendations: JSON.stringify(recommendations.recommendations || []),
        generated_by_user_id: user.id
      });
    }

    return Response.json({
      success: true,
      report,
      data: {
        reviews: reviewSummary,
        tasks: taskSummary,
        content: contentSummary,
        kpis: kpiSummary
      }
    });

  } catch (error) {
    console.error('Failed to generate report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});