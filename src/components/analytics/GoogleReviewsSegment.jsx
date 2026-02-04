import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function GoogleReviewsSegment({ businessId, onAnalyzeClick }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [businessId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const allReviews = await base44.entities.Review.filter({
        business_id: businessId,
        platform: 'google'
      });
      setReviews(allReviews || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncReviews = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke('fetchGoogleReviews', {
        business_id: businessId
      });
      await loadReviews();
    } catch (error) {
      console.error('Failed to sync reviews:', error);
    } finally {
      setSyncing(false);
    }
  };

  const positiveReviews = reviews.filter(r => r.rating >= 4);
  const negativeReviews = reviews.filter(r => r.rating < 4);
  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#a8b88c]" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center">
        <p className="text-[#6b7055] mb-4">No Google reviews found</p>
        <Button onClick={syncReviews} disabled={syncing} className="bg-[#a8b88c] hover:bg-[#8a9a6e]">
          {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Sync Reviews
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-[#e8e6de]/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#2d3319]">{avgRating}</div>
              <p className="text-sm text-[#6b7055]">Average Rating</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-[#e8e6de]/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{positiveReviews.length}</div>
              <p className="text-sm text-[#6b7055]">Positive (4-5⭐)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-[#e8e6de]/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{negativeReviews.length}</div>
              <p className="text-sm text-[#6b7055]">Negative (<4⭐)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positive Reviews */}
      {positiveReviews.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-[#e8e6de]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <ThumbsUp className="w-5 h-5" />
              Positive Reviews ({positiveReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {positiveReviews.map((review) => (
              <div key={review.id} className="pb-4 border-b border-[#e8e6de]/30 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#2d3319]">{review.reviewer_name}</p>
                    <p className="text-sm text-[#6b7055]">{'⭐'.repeat(review.rating)}</p>
                  </div>
                  <span className="text-xs text-[#9ca38a]">
                    {format(new Date(review.created_at_platform), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-[#2d3319] text-sm">{review.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Negative Reviews */}
      {negativeReviews.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-[#e8e6de]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <ThumbsDown className="w-5 h-5" />
              Negative Reviews ({negativeReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {negativeReviews.map((review) => (
              <div key={review.id} className="pb-4 border-b border-[#e8e6de]/30 last:border-0 bg-red-50/30 p-3 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#2d3319]">{review.reviewer_name}</p>
                    <p className="text-sm text-[#6b7055]">{'⭐'.repeat(review.rating)} ({review.rating}/5)</p>
                  </div>
                  <span className="text-xs text-[#9ca38a]">
                    {format(new Date(review.created_at_platform), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-[#2d3319] text-sm mb-3">{review.text}</p>
                <Button 
                  size="sm"
                  variant="outline"
                  className="text-xs border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => onAnalyzeClick?.(review)}
                >
                  Generate AI Response
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button 
        onClick={syncReviews} 
        disabled={syncing}
        variant="outline"
        className="w-full border-[#a8b88c] text-[#7a8a5e] hover:bg-[#f9f8f4]"
      >
        {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
        Sync Latest Reviews
      </Button>
    </div>
  );
}