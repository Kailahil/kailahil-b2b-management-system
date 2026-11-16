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
      return Response.json({ error: 'business_id is required' }, { status: 400 });
    }

    // Get all reviews for this business
    const reviews = await base44.entities.Review.filter({
      business_id: business_id,
      platform: 'google'
    });

    if (reviews.length === 0) {
      return Response.json({ 
        error: 'No reviews found. Please sync Google reviews first.' 
      }, { status: 400 });
    }

    // Separate reviews by sentiment
    const negativeReviews = reviews.filter(r => r.rating <= 3);
    const positiveReviews = reviews.filter(r => r.rating >= 4);

    // Build context for AI
    const negativeContext = negativeReviews.map(r => 
      `Rating: ${r.rating}/5 - "${r.text}"`
    ).join('\n\n');

    const positiveContext = positiveReviews.map(r => 
      `Rating: ${r.rating}/5 - "${r.text}"`
    ).join('\n\n');

    // Get business info for context
    const businesses = await base44.entities.Business.filter({ id: business_id });
    const business = businesses[0];

    // Generate AI insights
    const prompt = `You are analyzing Google reviews for a business called "${business.name}" in the ${business.industry} industry.

NEGATIVE REVIEWS (${negativeReviews.length} reviews):
${negativeContext || 'No negative reviews'}

POSITIVE REVIEWS (${positiveReviews.length} reviews):
${positiveContext || 'No positive reviews'}

Please analyze these reviews and provide:
1. Key problems mentioned in negative reviews (bullet points)
2. Key strengths mentioned in positive reviews (bullet points)
3. Business solutions to address the negative feedback (specific, actionable)
4. Marketing tactics to highlight strengths and rebuild trust
5. Promotional ideas to win back dissatisfied customers and retain happy ones

Provide your response in valid JSON format with these exact keys:
{
  "problems": ["problem 1", "problem 2", ...],
  "strengths": ["strength 1", "strength 2", ...],
  "business_solutions": ["solution 1", "solution 2", ...],
  "marketing_tactics": ["tactic 1", "tactic 2", ...],
  "promotional_ideas": ["promo 1", "promo 2", ...]
}`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          problems: { type: "array", items: { type: "string" } },
          strengths: { type: "array", items: { type: "string" } },
          business_solutions: { type: "array", items: { type: "string" } },
          marketing_tactics: { type: "array", items: { type: "string" } },
          promotional_ideas: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({
      success: true,
      total_reviews: reviews.length,
      negative_count: negativeReviews.length,
      positive_count: positiveReviews.length,
      average_rating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
      analysis: aiResponse
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});