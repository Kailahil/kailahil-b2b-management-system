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

    // Get social account for this business
    const socialAccounts = await base44.asServiceRole.entities.SocialAccount.filter({
      business_id: business_id,
      platform: 'tiktok'
    });

    if (socialAccounts.length === 0) {
      return Response.json({
        error: 'No TikTok account connected for this business',
        data: null
      }, { status: 404 });
    }

    const account = socialAccounts[0];

    // Get TikTok API access token from app connector
    let accessToken;
    try {
      accessToken = await base44.asServiceRole.connectors.getAccessToken('tiktok');
    } catch (err) {
      return Response.json({
        error: 'TikTok not connected or authorization expired',
        data: null
      }, { status: 403 });
    }

    if (!accessToken) {
      return Response.json({
        error: 'Failed to retrieve TikTok access token',
        data: null
      }, { status: 500 });
    }

    // Fetch user info and stats from TikTok API
    const userInfoResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count,bio_description,is_verified', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userInfoResponse.ok) {
      console.error('TikTok API error:', userInfoResponse.status);
      // Return cached data from database if API fails
      const metrics = await base44.asServiceRole.entities.SocialDailyMetric.filter({
        social_account_id: account.id
      }, '-date', 1);
      
      if (metrics.length > 0) {
        return Response.json({
          success: true,
          data: {
            handle: account.handle,
            followers: metrics[0].followers || 0,
            following: metrics[0].following || 0,
            video_count: 0,
            likes_count: metrics[0].likes || 0,
            verified: false,
            profile_views: metrics[0].profile_views || 0,
            bio: '',
            avatar_url: '',
            top_posts: []
          }
        });
      }
      
      return Response.json({
        error: 'Failed to fetch TikTok analytics',
        data: {
          followers: 0,
          engagement_rate: 0,
          video_views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          profile_views: 0,
          verified: false
        }
      }, { status: 200 });
    }

    const userInfo = await userInfoResponse.json();

    // Fetch videos for engagement data
    const videosResponse = await fetch('https://open.tiktokapis.com/v2/video/list/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        max_count: 5
      })
    });

    let topPosts = [];
    if (videosResponse.ok) {
      const videosData = await videosResponse.json();
      topPosts = videosData.data?.videos?.slice(0, 5) || [];
    }

    return Response.json({
      success: true,
      data: {
        handle: userInfo.data?.user?.username || account.handle,
        followers: userInfo.data?.user?.follower_count || 0,
        following: userInfo.data?.user?.following_count || 0,
        video_count: userInfo.data?.user?.video_count || 0,
        likes_count: userInfo.data?.user?.likes_count || 0,
        verified: userInfo.data?.user?.is_verified || false,
        profile_views: userInfo.data?.user?.profile_view_count || 0,
        bio: userInfo.data?.user?.bio || '',
        avatar_url: userInfo.data?.user?.avatar_large_url || '',
        top_posts: topPosts
      }
    });
  } catch (error) {
    console.error('TikTok Analytics Error:', error.message);
    return Response.json({
      error: error.message,
      data: null
    }, { status: 500 });
  }
});