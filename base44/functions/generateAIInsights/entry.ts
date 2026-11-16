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
    const [business, reviews, tasks, contentItems, kpis] = await Promise.all([
      base44.entities.Business.filter({ id: business_id }),
      base44.entities.Review.filter({ business_id }),
      base44.entities.Task.filter({ business_id }),
      base44.entities.ContentItem.filter({ business_id }),
      base44.entities.ManualKPI.filter({ business_id })
    ]);

    if (!business || business.length === 0) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    const bizData = business[0];

    // Build context for AI
    const reviewContext = reviews.map(r => ({
      rating: r.rating,
      text: r.text,
      reviewer: r.reviewer_name,
      date: r.created_at_platform,
      topics: r.ai_topics,
      root_cause: r.ai_root_cause
    }));

    const taskContext = tasks.map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_date: t.due_date,
      type: t.type
    }));

    const contentContext = contentItems.map(c => ({
      type: c.type,
      platform: c.platform,
      status: c.status,
      caption: c.caption
    }));

    const kpiContext = kpis.map(k => ({
      metric: k.metric_name,
      value: k.value,
      period: k.period,
      notes: k.notes
    }));

    // Generate comprehensive insights
    const prompt = `You are analyzing a business (${bizData.name}) to provide actionable insights.

DATA PROVIDED:
Reviews: ${JSON.stringify(reviewContext, null, 2)}
Tasks: ${JSON.stringify(taskContext, null, 2)}
Content Pipeline: ${JSON.stringify(contentContext, null, 2)}
Manual KPIs: ${JSON.stringify(kpiContext, null, 2)}

INSTRUCTIONS:
1. Identify top 3 business issues from negative reviews (rating <= 3)
2. Find biggest opportunities from positive reviews (rating >= 4)
3. Identify immediate risk flags (repeated issues, overdue tasks, content gaps)
4. Perform root cause analysis with supporting evidence (quoted text)
5. Prioritize 3-5 actions to fix first (with impact & effort estimates)

RULES:
- Only use data provided above
- Quote actual review text as evidence
- No assumptions beyond provided data
- If no data exists for a category, explicitly state "No data available"

Return JSON with this structure:
{
  "primary_issues": [{"issue": "", "frequency": 0, "severity": "low|medium|high", "evidence": []}],
  "opportunities": [{"opportunity": "", "source": "", "evidence": []}],
  "risks": [{"risk": "", "trigger": "", "severity": "low|medium|high"}],
  "root_causes": [{"cause": "", "evidence": [], "confidence": "low|medium|high"}],
  "fix_first": [{"action": "", "why": "", "impact": "low|medium|high", "effort": "low|medium|high", "owner": "ops|marketing"}]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          primary_issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: { type: "string" },
                frequency: { type: "number" },
                severity: { type: "string" },
                evidence: { type: "array", items: { type: "string" } }
              }
            }
          },
          opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                opportunity: { type: "string" },
                source: { type: "string" },
                evidence: { type: "array", items: { type: "string" } }
              }
            }
          },
          risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk: { type: "string" },
                trigger: { type: "string" },
                severity: { type: "string" }
              }
            }
          },
          root_causes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                cause: { type: "string" },
                evidence: { type: "array", items: { type: "string" } },
                confidence: { type: "string" }
              }
            }
          },
          fix_first: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                why: { type: "string" },
                impact: { type: "string" },
                effort: { type: "string" },
                owner: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Store insights (append-only)
    await base44.asServiceRole.entities.AIInsight.create({
      agency_id: bizData.agency_id,
      business_id: business_id,
      insight_type: 'root_cause',
      root_causes: JSON.stringify(result.root_causes),
      supporting_evidence: JSON.stringify(result.primary_issues.concat(result.opportunities)),
      confidence_level: result.root_causes?.[0]?.confidence || 'medium',
      action_items: JSON.stringify(result.fix_first),
      generated_by_user_id: user.id
    });

    return Response.json({ 
      success: true,
      insights: result
    });

  } catch (error) {
    console.error('Failed to generate insights:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});