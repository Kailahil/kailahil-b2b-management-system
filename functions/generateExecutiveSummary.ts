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
    const [business, reviews, contentItems, tasks, manualKPIs] = await Promise.all([
      base44.entities.Business.filter({ id: business_id }).then(r => r[0]),
      base44.entities.Review.filter({ business_id }),
      base44.entities.ContentItem.filter({ business_id }),
      base44.entities.Task.filter({ business_id }),
      base44.entities.ManualKPI.filter({ business_id })
    ]);

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    // Prepare context for AI
    const context = {
      business_name: business.name,
      business_status: business.status,
      review_count: reviews.length,
      positive_reviews: reviews.filter(r => r.rating >= 4).length,
      negative_reviews: reviews.filter(r => r.rating <= 2).length,
      content_items_total: contentItems.length,
      content_by_status: {
        idea: contentItems.filter(c => c.status === 'idea').length,
        draft: contentItems.filter(c => c.status === 'draft').length,
        needs_approval: contentItems.filter(c => c.status === 'needs_approval').length,
        posted: contentItems.filter(c => c.status === 'posted').length
      },
      tasks_total: tasks.length,
      tasks_overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length,
      tasks_completed: tasks.filter(t => t.status === 'done').length,
      manual_kpis: manualKPIs.map(k => ({ name: k.metric_name, value: k.value, period: k.period }))
    };

    // Review insights from AI fields
    const reviewInsights = reviews.filter(r => r.ai_action_plan || r.ai_response_draft).slice(0, 5);

    const prompt = `You are an executive assistant analyzing a marketing agency's client account. Generate a concise executive summary based ONLY on the data provided. DO NOT invent or estimate any numbers.

Business: ${context.business_name}
Status: ${context.business_status}

Reviews: ${context.review_count === 0 ? 'No reviews imported yet' : `${context.review_count} total (${context.positive_reviews} positive, ${context.negative_reviews} negative)`}

Content Pipeline: ${context.content_items_total === 0 ? 'No content items created yet' : `${context.content_items_total} items - ${context.content_by_status.idea} ideas, ${context.content_by_status.draft} in progress, ${context.content_by_status.needs_approval} awaiting approval, ${context.content_by_status.posted} posted`}

Tasks: ${context.tasks_total === 0 ? 'No tasks created yet' : `${context.tasks_total} total, ${context.tasks_overdue} overdue, ${context.tasks_completed} completed`}

Manual KPIs: ${context.manual_kpis.length === 0 ? 'None provided' : context.manual_kpis.map(k => `${k.name}: ${k.value} (${k.period})`).join(', ')}

Generate:
1. A 1-2 paragraph summary in plain English
2. Current health assessment (one sentence)
3. Biggest risk (one sentence, or "No data to assess risk" if data is missing)
4. Biggest opportunity (one sentence)
5. What the team is doing now (one sentence)

CRITICAL: If any data is missing or insufficient, explicitly state "No data available" or "Insufficient data" rather than making assumptions.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary_text: { type: "string" },
          current_health: { type: "string" },
          biggest_risk: { type: "string" },
          biggest_opportunity: { type: "string" },
          team_actions: { type: "string" }
        }
      }
    });

    // Check if summary already exists
    const existingSummaries = await base44.asServiceRole.entities.ExecutiveSummary.filter({ business_id });
    
    if (existingSummaries.length > 0) {
      // Update existing
      await base44.asServiceRole.entities.ExecutiveSummary.update(existingSummaries[0].id, {
        summary_text: result.summary_text,
        current_health: result.current_health,
        biggest_risk: result.biggest_risk,
        biggest_opportunity: result.biggest_opportunity,
        team_actions: result.team_actions,
        generated_by_user_id: user.id
      });
    } else {
      // Create new
      await base44.asServiceRole.entities.ExecutiveSummary.create({
        agency_id: business.agency_id,
        business_id: business.id,
        summary_text: result.summary_text,
        current_health: result.current_health,
        biggest_risk: result.biggest_risk,
        biggest_opportunity: result.biggest_opportunity,
        team_actions: result.team_actions,
        generated_by_user_id: user.id
      });
    }

    return Response.json({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error generating executive summary:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});