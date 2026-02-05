import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ThumbsUp, ThumbsDown, RefreshCw, Lightbulb, TrendingUp, Gift, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';

export default function GoogleReviews() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const businessList = await base44.entities.Business.filter({ 
          agency_id: currentUser.agency_id 
        });
        setBusinesses(businessList);

        if (businessList.length > 0) {
          setSelectedBusinessId(businessList[0].id);
          await loadReviews(businessList[0].id);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadReviews = async (businessId) => {
    try {
      const reviewList = await base44.entities.Review.filter({
        business_id: businessId,
        platform: 'google'
      });
      setReviews(reviewList.sort((a, b) => 
        new Date(b.created_at_platform) - new Date(a.created_at_platform)
      ));
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke('syncGoogleReviews', {
        business_id: selectedBusinessId
      });
      
      if (response.data.success) {
        await loadReviews(selectedBusinessId);
        alert(`✅ Synced ${response.data.total_reviews} reviews (${response.data.new_reviews} new)`);
      }
    } catch (error) {
      alert('❌ ' + (error.response?.data?.error || error.message));
    } finally {
      setSyncing(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await base44.functions.invoke('analyzeReviews', {
        business_id: selectedBusinessId
      });
      
      if (response.data.success) {
        setAnalysis(response.data);
      }
    } catch (error) {
      alert('❌ ' + (error.response?.data?.error || error.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const negativeReviews = reviews.filter(r => r.rating <= 3);
  const positiveReviews = reviews.filter(r => r.rating >= 4);
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f3ed]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#2d3319] mb-2">Google Reviews</h1>
            <p className="text-[#6b7055] text-lg">AI-powered sentiment analysis and business insights</p>
          </div>
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="outline" className="border-[#a8b88c] text-[#7a8a5e]">
              ← Back
            </Button>
          </Link>
        </div>

        {/* Business Selector */}
        {businesses.length > 1 && (
          <div className="mb-6">
            <select
              value={selectedBusinessId}
              onChange={(e) => {
                setSelectedBusinessId(e.target.value);
                loadReviews(e.target.value);
                setAnalysis(null);
              }}
              className="px-4 py-3 rounded-full border-2 border-[#a8b88c] bg-white text-[#2d3319] font-semibold"
            >
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 border-[#e8e6de]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-[#2d3319]">{avgRating}</p>
                  <p className="text-sm text-[#6b7055]">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-[#e8e6de]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-[#a8b88c]" />
                <div>
                  <p className="text-2xl font-bold text-[#2d3319]">{reviews.length}</p>
                  <p className="text-sm text-[#6b7055]">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-[#e8e6de]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ThumbsUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-[#2d3319]">{positiveReviews.length}</p>
                  <p className="text-sm text-[#6b7055]">Positive</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-[#e8e6de]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ThumbsDown className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-[#2d3319]">{negativeReviews.length}</p>
                  <p className="text-sm text-[#6b7055]">Negative</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Reviews'}
          </Button>

          {reviews.length > 0 && (
            <Button 
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white"
            >
              <Lightbulb className={`w-4 h-4 mr-2 ${analyzing ? 'animate-pulse' : ''}`} />
              {analyzing ? 'Analyzing...' : 'AI Analysis'}
            </Button>
          )}
        </div>

        {/* AI Analysis */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <ThumbsDown className="w-5 h-5" />
                  Problems to Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.problems.map((problem, i) => (
                    <li key={i} className="flex gap-2 text-sm text-red-900">
                      <span>•</span>
                      <span>{problem}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <ThumbsUp className="w-5 h-5" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.strengths.map((strength, i) => (
                    <li key={i} className="flex gap-2 text-sm text-green-900">
                      <span>•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <TrendingUp className="w-5 h-5" />
                  Business Solutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.business_solutions.map((solution, i) => (
                    <li key={i} className="flex gap-2 text-sm text-blue-900">
                      <span>{i + 1}.</span>
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Lightbulb className="w-5 h-5" />
                  Marketing Tactics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.marketing_tactics.map((tactic, i) => (
                    <li key={i} className="flex gap-2 text-sm text-purple-900">
                      <span>{i + 1}.</span>
                      <span>{tactic}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Gift className="w-5 h-5" />
                  Promotional Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.promotional_ideas.map((promo, i) => (
                    <li key={i} className="flex gap-2 text-sm text-orange-900">
                      <span>{i + 1}.</span>
                      <span>{promo}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-white/90 border border-[#e8e6de]">
            <TabsTrigger value="all">All ({reviews.length})</TabsTrigger>
            <TabsTrigger value="positive">Positive ({positiveReviews.length})</TabsTrigger>
            <TabsTrigger value="negative">Negative ({negativeReviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </TabsContent>

          <TabsContent value="positive" className="space-y-4 mt-4">
            {positiveReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </TabsContent>

          <TabsContent value="negative" className="space-y-4 mt-4">
            {negativeReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  const stars = Array(5).fill(0).map((_, i) => (
    <Star 
      key={i} 
      className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
    />
  ));

  return (
    <Card className="bg-white/90 border-[#e8e6de]">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-[#2d3319]">{review.reviewer_name}</p>
            <p className="text-sm text-[#6b7055]">
              {new Date(review.created_at_platform).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-1">{stars}</div>
        </div>
        <p className="text-[#2d3319]">{review.text}</p>
      </CardContent>
    </Card>
  );
}