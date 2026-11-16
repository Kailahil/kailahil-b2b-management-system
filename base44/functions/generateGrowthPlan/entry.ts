import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { business_id } = await req.json();

    if (!business_id) {
      return Response.json({ error: 'business_id required' }, { status: 400 });
    }

    // Fetch all relevant data
    const [business, reviews, tasks, contentItems, kpis, insights, reports] = await Promise.all([
      base44.entities.Business.filter({ id: business_id }),
      base44.entities.Review.filter({ business_id }),
      base44.entities.Task.filter({ business_id }),
      base44.entities.ContentItem.filter({ business_id }),
      base44.entities.ManualKPI.filter({ business_id }),
      base44.entities.AIInsight.filter({ business_id }, '-created_date', 3),
      base44.entities.Report.filter({ business_id }, '-created_date', 1)
    ]);

    if (!business || business.length === 0) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    const bizData = business[0];

    // Analyze current state
    const reviewSentiment = {
      total: reviews.length,
      positive: reviews.filter(r => r.rating >= 4).length,
      negative: reviews.filter(r => r.rating <= 3).length,
      themes: {
        complaints: reviews.filter(r => r.rating <= 3).map(r => r.ai_topics || r.text?.substring(0, 100)),
        praise: reviews.filter(r => r.rating >= 4).map(r => r.ai_topics || r.text?.substring(0, 100))
      }
    };

    const taskBacklog = tasks.filter(t => t.status !== 'done').map(t => ({
      title: t.title,
      priority: t.priority,
      type: t.type,
      overdue: t.due_date && new Date(t.due_date) < new Date()
    }));

    const contentGaps = {
      total: contentItems.length,
      byStatus: contentItems.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {}),
      lastMonth: contentItems.filter(c => {
        const date = new Date(c.created_date);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
      }).length
    };

    const latestReport = reports.length > 0 ? {
      month: reports[0].report_month,
      summary: reports[0].executive_summary?.substring(0, 300)
    } : null;

    // Generate comprehensive growth plan
    const planPrompt = `Generate a realistic, actionable 30-day growth plan for ${bizData.name} (${bizData.industry || 'business'}).

BUSINESS CONTEXT:
Location: ${bizData.city || 'Not specified'}, ${bizData.state || ''}
Category: ${bizData.industry || 'General'}

CURRENT STATE:
Reviews: ${reviewSentiment.total} total (${reviewSentiment.positive} positive, ${reviewSentiment.negative} negative)
Top complaints: ${reviewSentiment.themes.complaints.slice(0, 5).join('; ') || 'None'}
Top praise: ${reviewSentiment.themes.praise.slice(0, 5).join('; ') || 'None'}

Task backlog: ${taskBacklog.length} open (${taskBacklog.filter(t => t.overdue).length} overdue)
Content last month: ${contentGaps.lastMonth} items

AI Insights: ${insights.length > 0 ? 'Available' : 'Not generated yet'}
Latest report: ${latestReport ? latestReport.summary : 'No reports generated'}

Manual KPIs: ${kpis.length > 0 ? kpis.map(k => `${k.metric_name}: ${k.value}`).join(', ') : 'None provided'}

INSTRUCTIONS:
Create a realistic, ops-aware 30-day growth plan covering:

1. PLAN SUMMARY: One paragraph overview of focus areas and expected improvements
2. STRATEGIC FOCUS: 3-5 bullet priorities for next 30 days
3. SUCCESS DEFINITION: What "better" looks like (qualitative, no fabricated numbers)
4. OPERATIONAL FIXES: 3-5 internal improvements (linked to complaints/root causes)
5. CONTENT PLAN: 4-6 content ideas with platform and frequency suggestions
6. REPUTATION PLAN: 2-3 review response or prevention strategies

RULES:
- Be realistic, not hypey
- If data is missing, note assumptions (e.g., "Based on limited review data...")
- Link recommendations to actual feedback or insights
- Focus on actionable items, not vague goals

Return JSON with this exact structure:
{
  "plan_summary": "One paragraph",
  "strategic_focus": ["Priority 1", "Priority 2", "Priority 3"],
  "success_definition": "What better looks like",
  "operational_fixes": [
    {
      "title": "Fix title",
      "description": "What and why",
      "linked_root_cause": "From review feedback...",
      "priority": "high|medium|low",
      "owner_type": "operations|management"
    }
  ],
  "content_plan": [
    {
      "theme": "Content theme",
      "angle": "Messaging approach",
      "platform": "tiktok|instagram|short",
      "frequency": "2-3x per week",
      "goal": "Target sentiment/perception"
    }
  ],
  "reputation_plan": [
    {
      "strategy": "Response or prevention strategy",
      "actions": "Specific actions to take",
      "prevents": "What this addresses"
    }
  ]
}`;

    const planResult = await base44.integrations.Core.InvokeLLM({
      prompt: planPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          plan_summary: { type: "string" },
          strategic_focus: {
            type: "array",
            items: { type: "string" }
          },
          success_definition: { type: "string" },
          operational_fixes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                linked_root_cause: { type: "string" },
                priority: { type: "string" },
                owner_type: { type: "string" }
              }
            }
          },
          content_plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                theme: { type: "string" },
                angle: { type: "string" },
                platform: { type: "string" },
                frequency: { type: "string" },
                goal: { type: "string" }
              }
            }
          },
          reputation_plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategy: { type: "string" },
                actions: { type: "string" },
                prevents: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Create growth plan
    const plan = await base44.asServiceRole.entities.GrowthPlan.create({
      agency_id: bizData.agency_id,
      business_id: business_id,
      plan_summary: planResult.plan_summary,
      strategic_focus: JSON.stringify(planResult.strategic_focus),
      success_definition: planResult.success_definition,
      operational_fixes: JSON.stringify(planResult.operational_fixes),
      content_plan: JSON.stringify(planResult.content_plan),
      reputation_plan: JSON.stringify(planResult.reputation_plan),
      status: 'active',
      generated_by_user_id: user.id
    });

    return Response.json({
      success: true,
      plan: plan,
      data: planResult
    });

  } catch (error) {
    console.error('Failed to generate growth plan:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});