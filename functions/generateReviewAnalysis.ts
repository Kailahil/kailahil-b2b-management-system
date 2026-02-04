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

    // Fetch all reviews for the business
    const allReviews = await base44.asServiceRole.entities.Review.filter({
      business_id
    });

    const negativeReviews = allReviews.filter(r => r.rating < 4);
    const positiveReviews = allReviews.filter(r => r.rating >= 4);

    if (negativeReviews.length === 0) {
      return Response.json({
        analysis: 'All reviews are positive! Keep maintaining your excellent service.',
        solutions: [],
        marketingTactics: [],
        promotions: []
      });
    }

    // Prepare review data for AI analysis
    const reviewSummary = `
NEGATIVE REVIEWS (${negativeReviews.length}):
${negativeReviews.map(r => `- ${r.reviewer_name} (${r.rating}⭐): ${r.text}`).join('\n')}

POSITIVE REVIEWS (${positiveReviews.length}):
${positiveReviews.slice(0, 3).map(r => `- ${r.reviewer_name} (${r.rating}⭐): ${r.text}`).join('\n')}
`;

    // Use AI to generate insights
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a business consultant analyzing customer reviews. Based on the following review data, provide:

1. **Root Causes**: What are the main issues customers are complaining about?
2. **Business Solutions**: What operational or service changes should the business make?
3. **Marketing Tactics**: How can they market the positive aspects to combat negative perception?
4. **Promotional Ideas**: What promotions or incentives could improve customer satisfaction?

${reviewSummary}

Format your response as JSON with keys: rootCauses (array), businessSolutions (array), marketingTactics (array), promotions (array). Each should contain 3-5 actionable items.`,
      response_json_schema: {
        type: 'object',
        properties: {
          rootCauses: {
            type: 'array',
            items: { type: 'string' }
          },
          businessSolutions: {
            type: 'array',
            items: { type: 'string' }
          },
          marketingTactics: {
            type: 'array',
            items: { type: 'string' }
          },
          promotions: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});