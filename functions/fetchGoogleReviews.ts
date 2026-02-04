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

    // Get business and review source
    const business = await base44.entities.Business.filter({ id: business_id });
    if (!business.length) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    const reviewSource = await base44.entities.ReviewSource.filter({
      business_id,
      platform: 'google'
    });

    if (!reviewSource.length || !reviewSource[0].place_id) {
      return Response.json({ error: 'Google Business not connected' }, { status: 404 });
    }

    const placeId = reviewSource[0].place_id;
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    // Fetch reviews from Google Places API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`
    );

    const data = await response.json();

    if (!data.result?.reviews) {
      return Response.json({ reviews: [], rating: data.result?.rating || 0, totalRatings: data.result?.user_ratings_total || 0 });
    }

    // Store reviews in database
    const reviews = data.result.reviews;
    for (const review of reviews) {
      const existing = await base44.entities.Review.filter({
        review_id: review.time,
        platform: 'google'
      });

      if (!existing.length) {
        await base44.entities.Review.create({
          agency_id: user.agency_id,
          business_id,
          platform: 'google',
          review_id: review.time.toString(),
          rating: review.rating,
          text: review.text,
          reviewer_name: review.author_name,
          created_at_platform: new Date(review.time * 1000).toISOString(),
          response_status: 'none'
        });
      }
    }

    // Update sync timestamp
    await base44.entities.ReviewSource.update(reviewSource[0].id, {
      last_sync_at: new Date().toISOString()
    });

    return Response.json({
      reviews,
      rating: data.result.rating,
      totalRatings: data.result.user_ratings_total
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});