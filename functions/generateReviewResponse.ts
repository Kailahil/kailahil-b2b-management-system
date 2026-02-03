import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { review_id } = await req.json();

    if (!review_id) {
      return Response.json({ error: 'review_id required' }, { status: 400 });
    }

    const reviews = await base44.entities.Review.filter({ id: review_id });
    if (reviews.length === 0) {
      return Response.json({ error: 'Review not found' }, { status: 404 });
    }

    const review = reviews[0];

    // Generate AI response, action plan, and promo idea
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a customer service expert. A customer left this ${review.rating}-star review: "${review.text}"

Generate 3 things:
1. A professional, empathetic response to post publicly
2. An internal action plan for the business to address any issues
3. A creative promotional idea based on positive aspects of the review

Keep each section concise and actionable.`,
      response_json_schema: {
        type: "object",
        properties: {
          response_draft: { type: "string" },
          action_plan: { type: "string" },
          promo_idea: { type: "string" }
        }
      }
    });

    // Update the review with AI outputs
    await base44.asServiceRole.entities.Review.update(review_id, {
      ai_response_draft: result.response_draft,
      ai_action_plan: result.action_plan,
      ai_promo_idea: result.promo_idea,
      response_status: 'drafted'
    });

    return Response.json({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error generating review response:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});