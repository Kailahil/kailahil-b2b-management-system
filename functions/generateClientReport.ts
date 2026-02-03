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

    // Parse report month
    const [year, month] = report_month.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Fetch business and all relevant data
    const [business, reviews, tasks, contentItems, kpis, insights] = await Promise.all([
      base44.entities.Business.filter({ id: business_id }),
      base44.entities.Review.filter({ business_id }),
      base44.entities.Task.filter({ business_id }),
      base44.entities.ContentItem.filter({ business_id }),
      base44.entities.ManualKPI.filter({ business_id, period: report_month }),
      base44.entities.AIInsight.filter({ business_id }, '-created_date', 5)
    ]);

    if (!business || business.length === 0) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    const bizData = business[0];

    // Filter data by report month
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

    // Sentiment analysis
    const positiveReviews = monthReviews.filter(r => r.rating >= 4);
    const negativeReviews = monthReviews.filter(r => r.rating <= 2);

    // Generate Executive Summary
    const summaryPrompt = `Generate a professional, client-facing executive summary for ${bizData.name}'s monthly report (${report_month}).

DATA AVAILABLE:
- Total reviews this month: ${monthReviews.length}
- Positive reviews (4-5 stars): ${positiveReviews.length}
- Negative reviews (1-2 stars): ${negativeReviews.length}
- Tasks completed: ${completedTasks.length}
- Content produced: ${producedContent.length}
- Manual KPIs: ${kpis.length > 0 ? kpis.map(k => `${k.metric_name}: ${k.value}`).join(', ') : 'None provided'}
- Recent AI Insights: ${insights.length > 0 ? 'Available' : 'Not yet generated'}

REVIEWS SAMPLE:
${monthReviews.slice(0, 10).map(r => `- ${r.rating}⭐: "${r.text}"`).join('\n')}

INSTRUCTIONS:
Write a 2-3 paragraph plain-English summary covering:
1. Overall health this month (based on reviews and metrics)
2. What improved or went well
3. What needs attention or concern areas
4. High-level next steps

RULES:
- Use only the data provided above
- If data is missing, explicitly state "No data available for [metric]"
- Professional tone, suitable for client presentation
- No fabricated metrics or assumptions
- Be honest about areas needing improvement

Return JSON with:
{
  "executive_summary": "The full summary text here..."
}`;

    const summaryResult = await base44.integrations.Core.InvokeLLM({
      prompt: summaryPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" }
        }
      }
    });

    // Generate Recommendations
    const recommendationsPrompt = `Generate 3-6 prioritized recommendations for ${bizData.name}'s next month.

CONTEXT:
- Recent issues: ${negativeReviews.slice(0, 5).map(r => r.text).join('; ')}
- Recent praise: ${positiveReviews.slice(0, 5).map(r => r.text).join('; ')}
- AI Insights available: ${insights.length > 0}
- Content gaps: ${producedContent.length < 4 ? 'Low content output' : 'Adequate output'}

INSTRUCTIONS:
Create recommendations covering:
- Operational fixes (based on negative feedback)
- Content focus areas (based on positive themes)
- Marketing angles to emphasize

Each recommendation must include:
- Title (action to take)
- Reason (linked to reviews or data)
- Expected impact (low/medium/high - qualitative)
- Category (operational/content/marketing)

Return JSON array:
[
  {
    "title": "Action title",
    "reason": "Why this matters, referencing reviews or data",
    "impact": "low|medium|high",
    "category": "operational|content|marketing"
  }
]`;

    const recommendationsResult = await base44.integrations.Core.InvokeLLM({
      prompt: recommendationsPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                reason: { type: "string" },
                impact: { type: "string" },
                category: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Check if report already exists
    const existingReports = await base44.entities.Report.filter({
      business_id,
      report_month
    });

    let report;
    if (existingReports.length > 0 && existingReports[0].status === 'draft') {
      // Update existing draft
      report = await base44.entities.Report.update(existingReports[0].id, {
        executive_summary: summaryResult.executive_summary,
        recommendations: JSON.stringify(recommendationsResult.recommendations)
      });
    } else {
      // Create new report
      report = await base44.entities.Report.create({
        agency_id: bizData.agency_id,
        business_id: business_id,
        report_month: report_month,
        generated_by_user_id: user.id,
        status: 'draft',
        executive_summary: summaryResult.executive_summary,
        recommendations: JSON.stringify(recommendationsResult.recommendations)
      });
    }

    return Response.json({ 
      success: true,
      report: report,
      data: {
        total_reviews: monthReviews.length,
        positive_reviews: positiveReviews.length,
        negative_reviews: negativeReviews.length,
        completed_tasks: completedTasks.length,
        produced_content: producedContent.length
      }
    });

  } catch (error) {
    console.error('Failed to generate client report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});