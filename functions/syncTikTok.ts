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

    // Get business to verify access
    const businesses = await base44.entities.Business.filter({ id: business_id });
    if (!businesses?.length || businesses[0].agency_id !== user.agency_id) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    const business = businesses[0];

    // Create sync run log
    const syncRun = await base44.asServiceRole.entities.SyncRun.create({
      agency_id: business.agency_id,
      business_id: business.id,
      integration: 'tiktok',
      status: 'running',
      started_at: new Date().toISOString(),
      records_written: 0
    });

    try {
      // Get TikTok OAuth access token
      let accessToken;
      try {
        accessToken = await base44.asServiceRole.connectors.getAccessToken('tiktok');
      } catch (error) {
        throw new Error('TikTok OAuth not authorized. Please complete the authorization flow in the Base44 dashboard first.');
      }

      if (!accessToken) {
        throw new Error('TikTok OAuth not authorized. Please complete the authorization flow in the Base44 dashboard first.');
      }

      // Fetch user info using the TikTok API with proper endpoint
      const userInfoResponse = await fetch('https://open.tiktokapis.com/v2/user/info/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        throw new Error(`TikTok API error: ${userInfoResponse.status} - ${errorText}`);
      }

      const userInfo = await userInfoResponse.json();
      const userData = userInfo?.data?.user;

      if (!userData) {
        throw new Error('No user data returned from TikTok API response');
      }

      // Update SocialAccount record
      const socialAccounts = await base44.asServiceRole.entities.SocialAccount.filter({
        business_id: business.id,
        platform: 'tiktok'
      });

      let socialAccount;
      if (socialAccounts.length > 0) {
        socialAccount = await base44.asServiceRole.entities.SocialAccount.update(socialAccounts[0].id, {
          connected_status: 'connected',
          handle: userData.display_name || null,
          external_account_id: userData.open_id || null,
          auth_ref: 'app_connector',
          last_sync_at: new Date().toISOString()
        });
      } else {
        socialAccount = await base44.asServiceRole.entities.SocialAccount.create({
          agency_id: business.agency_id,
          business_id: business.id,
          platform: 'tiktok',
          connected_status: 'connected',
          handle: userData.display_name || null,
          external_account_id: userData.open_id || null,
          auth_ref: 'app_connector',
          last_sync_at: new Date().toISOString()
        });
      }

      let recordsWritten = 0;

      // Write daily metrics snapshot
      const today = new Date().toISOString().split('T')[0];
      
      await base44.asServiceRole.entities.SocialDailyMetric.create({
        agency_id: business.agency_id,
        business_id: business.id,
        social_account_id: socialAccount.id,
        date: today,
        followers: userData.follower_count || 0,
        following: userData.following_count || 0,
        likes: userData.likes_count || 0,
        video_views: userData.video_count || 0,
        source: 'tiktok_connector'
      });
      recordsWritten++;

      // Fetch recent videos
      const videosResponse = await fetch('https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_count: 20
        })
      });

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        const videos = videosData.data?.videos || [];

        for (const video of videos) {
          // Create/update post
          const existingPosts = await base44.asServiceRole.entities.SocialPost.filter({
            business_id: business.id,
            platform_post_id: video.id
          });

          if (existingPosts.length === 0) {
            await base44.asServiceRole.entities.SocialPost.create({
              agency_id: business.agency_id,
              business_id: business.id,
              social_account_id: socialAccount.id,
              platform_post_id: video.id,
              posted_at: new Date(video.create_time * 1000).toISOString(),
              caption: video.video_description || video.title || '',
              media_url: video.cover_image_url || null,
              permalink: video.share_url || null
            });
            recordsWritten++;
          }

          // Create post metrics
          const videoDate = new Date(video.create_time * 1000).toISOString().split('T')[0];
          
          const existingMetrics = await base44.asServiceRole.entities.PostMetric.filter({
            business_id: business.id,
            platform_post_id: video.id,
            date: today
          });

          if (existingMetrics.length === 0) {
            await base44.asServiceRole.entities.PostMetric.create({
              agency_id: business.agency_id,
              business_id: business.id,
              social_account_id: socialAccount.id,
              platform_post_id: video.id,
              date: today,
              views: video.view_count || 0,
              likes: video.like_count || 0,
              comments: video.comment_count || 0,
              shares: video.share_count || 0,
              source: 'tiktok_connector'
            });
            recordsWritten++;
          }
        }
      }

      // Update sync run as success
      await base44.asServiceRole.entities.SyncRun.update(syncRun.id, {
        status: 'success',
        finished_at: new Date().toISOString(),
        records_written: recordsWritten
      });

      return Response.json({
        success: true,
        records_written: recordsWritten,
        account_name: userData.display_name
      });

    } catch (error) {
      // Update sync run as failed
      await base44.asServiceRole.entities.SyncRun.update(syncRun.id, {
        status: 'failed',
        finished_at: new Date().toISOString(),
        error_message: error.message
      });

      throw error;
    }

  } catch (error) {
    console.error('TikTok sync error:', error);
    return Response.json({ 
      error: error.message || 'Failed to sync TikTok data' 
    }, { status: 500 });
  }
});