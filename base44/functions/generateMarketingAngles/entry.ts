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

    // Fetch reviews and content pipeline
    const [business, reviews, contentItems] = await Promise.all([
      base44.entities.Business.filter({ id: business_id }),
      base44.entities.Review.filter({ business_id }),
      base44.entities.ContentItem.filter({ business_id })
    ]);

    if (!business || business.length === 0) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    const bizData = business[0];

    // Extract positive themes
    const positiveReviews = reviews.filter(r => r.rating >= 4);
    const negativeThemes = reviews.filter(r => r.rating <= 3).map(r => r.ai_topics || r.text);

    const prompt = `Generate 5-10 marketing content ideas for ${bizData.name}.

POSITIVE THEMES FROM REVIEWS:
${positiveReviews.map(r => `- "${r.text}" (${r.reviewer_name}, ${r.rating}⭐)`).join('\n')}

NEGATIVE THEMES TO COUNTER:
${negativeThemes.slice(0, 5).join('\n')}

EXISTING CONTENT:
${contentItems.map(c => `- ${c.type} on ${c.platform}: ${c.caption?.substring(0, 50)}...`).join('\n')}

INSTRUCTIONS:
- Create content ideas grounded in actual review sentiment
- Suggest hook, platform (TikTok/Instagram/Short), and messaging angle
- Each idea should leverage positive feedback or counter negative perceptions
- Reference the specific review theme it's based on

Return JSON array:
[
  {
    "hook": "Opening hook text",
    "angle": "Messaging strategy",
    "platform_suggestion": "tiktok|instagram|short",
    "source_theme": "Which review theme this addresses"
  }
]`;

    const ideas = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          ideas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                hook: { type: "string" },
                angle: { type: "string" },
                platform_suggestion: { type: "string" },
                source_theme: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Store content ideas
    const createdIdeas = [];
    for (const idea of ideas.ideas || []) {
      const created = await base44.asServiceRole.entities.AIContentIdea.create({
        agency_id: bizData.agency_id,
        business_id: business_id,
        hook: idea.hook,
        angle: idea.angle,
        platform_suggestion: idea.platform_suggestion,
        source_theme: idea.source_theme,
        generated_by_user_id: user.id
      });
      createdIdeas.push(created);
    }

    return Response.json({ 
      success: true,
      ideas: createdIdeas
    });

  } catch (error) {
    console.error('Failed to generate marketing angles:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});