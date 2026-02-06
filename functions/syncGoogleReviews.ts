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

    // Get business to verify access
    const businesses = await base44.entities.Business.filter({ id: business_id });
    const business = businesses[0];

    if (!business || business.agency_id !== user.agency_id) {
      return Response.json({ error: 'Business not found or access denied' }, { status: 404 });
    }

    // Get ReviewSource for this business
    const reviewSources = await base44.entities.ReviewSource.filter({
      business_id: business_id,
      platform: 'google'
    });

    const reviewSource = reviewSources[0];

    if (!reviewSource || !reviewSource.place_id) {
      return Response.json({ 
        error: 'Google Place ID not configured. Please set it up in business settings.' 
      }, { status: 400 });
    }

    // Fetch reviews from Google Places API
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${reviewSource.place_id}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;

    const response = await fetch(placeDetailsUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return Response.json({ 
        error: `Google API error: ${data.status}`,
        details: data.error_message 
      }, { status: 500 });
    }

    const reviews = data.result?.reviews || [];
    let newReviews = 0;
    let updatedReviews = 0;

    // Store/update reviews in database
    for (const review of reviews) {
      const existingReviews = await base44.entities.Review.filter({
        business_id: business_id,
        platform: 'google',
        review_id: review.author_name + '_' + review.time
      });

      const reviewData = {
        agency_id: user.agency_id,
        business_id: business_id,
        platform: 'google',
        review_id: review.author_name + '_' + review.time,
        rating: review.rating,
        text: review.text || '',
        reviewer_name: review.author_name,
        created_at_platform: new Date(review.time * 1000).toISOString(),
        last_synced_at: new Date().toISOString()
      };

      if (existingReviews.length === 0) {
        await base44.entities.Review.create(reviewData);
        newReviews++;
      } else {
        await base44.entities.Review.update(existingReviews[0].id, reviewData);
        updatedReviews++;
      }
    }

    // Update ReviewSource sync timestamp
    await base44.entities.ReviewSource.update(reviewSource.id, {
      last_sync_at: new Date().toISOString(),
      connected_status: 'connected'
    });

    return Response.json({
      success: true,
      new_reviews: newReviews,
      updated_reviews: updatedReviews,
      total_reviews: reviews.length,
      business_rating: data.rating,
      total_ratings: data.userRatingCount
    });

  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});