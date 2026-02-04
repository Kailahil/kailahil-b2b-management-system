import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, Upload, Sparkles, MessageSquare } from 'lucide-react';
import EmptyState from '../components/shared/EmptyState';

export default function Reviews() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importRating, setImportRating] = useState(5);
  const [importReviewerName, setImportReviewerName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [generatingFor, setGeneratingFor] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const businessData = await base44.entities.Business.filter({ 
          agency_id: currentUser.agency_id 
        });
        setBusinesses(businessData);

        const reviewData = await base44.entities.Review.filter({ 
          agency_id: currentUser.agency_id 
        });
        setReviews(reviewData);
      } catch (error) {
        console.error('Failed to load reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleImport = async () => {
    if (!importText.trim() || selectedBusiness === 'all') {
      alert('Please select a business and enter review text');
      return;
    }

    setIsImporting(true);
    try {
      const newReview = await base44.entities.Review.create({
        agency_id: user.agency_id,
        business_id: selectedBusiness,
        platform: 'google',
        review_id: `manual_${Date.now()}`,
        rating: importRating,
        text: importText,
        reviewer_name: importReviewerName || 'Manual Import',
        created_at_platform: new Date().toISOString()
      });

      setReviews([newReview, ...reviews]);
      setImportText('');
      setImportRating(5);
      setImportReviewerName('');
      setShowImport(false);
      alert('Review imported successfully!');
    } catch (error) {
      console.error('Failed to import review:', error);
      alert('Failed to import review');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSyncGoogleReviews = async () => {
    if (selectedBusiness === 'all') {
      alert('Please select a specific business to sync reviews');
      return;
    }

    setIsSyncing(true);
    try {
      // Check if business has a Google review source configured
      const reviewSources = await base44.entities.ReviewSource.filter({
        business_id: selectedBusiness,
        platform: 'google'
      });

      if (reviewSources.length === 0) {
        alert('Please connect Google Reviews for this business first in Business Settings');
        return;
      }

      // Future: Call sync function when ready
      alert('Google Reviews sync coming soon! Connect your Google Business Profile in Business Settings.');
    } catch (error) {
      console.error('Failed to sync reviews:', error);
      alert('Failed to sync reviews');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateResponse = async (review) => {
    setGeneratingFor(review.id);
    try {
      const response = await base44.functions.invoke('generateReviewResponse', {
        review_id: review.id
      });

      if (response.data.success) {
        const updatedReviews = await base44.entities.Review.filter({ 
          agency_id: user.agency_id 
        });
        setReviews(updatedReviews);
        alert('AI response generated successfully!');
      }
    } catch (error) {
      console.error('Failed to generate response:', error);
      alert('Failed to generate response');
    } finally {
      setGeneratingFor(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f3ed]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  const filteredReviews = selectedBusiness === 'all' 
    ? reviews 
    : reviews.filter(r => r.business_id === selectedBusiness);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#2d3319] mb-2">Reviews</h1>
            <p className="text-[#6b7055] text-lg">Manage and respond to customer reviews</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncGoogleReviews}
              disabled={isSyncing || selectedBusiness === 'all'}
              variant="outline"
              className="border-[#e8e6de] text-[#6b7055] hover:bg-[#f5f3ed]"
            >
              {isSyncing ? 'Syncing...' : 'Sync Google Reviews'}
            </Button>
            <Button 
              onClick={() => setShowImport(!showImport)}
              className="bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] hover:from-[#8a9a6e] hover:to-[#7a8a5e] text-white shadow-md"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Review
            </Button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem_2rem_2rem_0.5rem] p-4 mb-6 shadow-lg border border-[#e8e6de]/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6b7055] font-medium">Filter by business:</span>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="px-4 py-2 rounded-full border border-[#e8e6de] text-sm text-[#2d3319] bg-white focus:outline-none focus:border-[#a8b88c]"
            >
              <option value="all">All Businesses</option>
              {businesses.map(biz => (
                <option key={biz.id} value={biz.id}>{biz.name}</option>
              ))}
            </select>
          </div>
        </div>

        {showImport && (
          <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem_2.5rem_2.5rem_1rem] shadow-xl border-2 border-[#a8b88c]/30 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#a8b88c]/5 rounded-full -mr-32 -mt-32" />
            
            <div className="relative z-10 p-8">
              <h2 className="text-2xl font-bold text-[#2d3319] mb-6">Import Review</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-[#2d3319] mb-2 block">
                    Select Business
                  </label>
                  <select
                    value={selectedBusiness === 'all' ? '' : selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                    className="w-full px-4 py-3 rounded-[1rem_1rem_1rem_0.3rem] border border-[#e8e6de] text-[#2d3319] bg-white focus:outline-none focus:border-[#a8b88c]"
                  >
                    <option value="">Choose a business...</option>
                    {businesses.map(biz => (
                      <option key={biz.id} value={biz.id}>{biz.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-[#2d3319] mb-2 block">
                    Reviewer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={importReviewerName}
                    onChange={(e) => setImportReviewerName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-[1rem_1rem_1rem_0.3rem] border border-[#e8e6de] text-[#2d3319] bg-white focus:outline-none focus:border-[#a8b88c]"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[#2d3319] mb-2 block">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setImportRating(rating)}
                        className="p-2 hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={`w-8 h-8 ${rating <= importRating ? 'fill-amber-400 text-amber-400' : 'text-[#e8e6de]'}`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-[#6b7055] font-medium">{importRating} star{importRating !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-[#2d3319] mb-2 block">
                    Review Text
                  </label>
                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste review text here..."
                    rows={4}
                    className="rounded-[1rem_1rem_1rem_0.3rem] border-[#e8e6de] focus:border-[#a8b88c]"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleImport}
                    disabled={isImporting}
                    className="bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] hover:from-[#8a9a6e] hover:to-[#7a8a5e] text-white shadow-md"
                  >
                    {isImporting ? 'Importing...' : 'Import Review'}
                  </Button>
                  <Button 
                    onClick={() => setShowImport(false)}
                    variant="outline"
                    className="border-[#e8e6de] text-[#6b7055] hover:bg-[#f5f3ed]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredReviews.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-[3rem_3rem_3rem_1rem] p-12 shadow-xl border border-[#e8e6de]/30">
            <EmptyState
              icon={MessageSquare}
              title="No reviews yet"
              description="Import reviews manually or connect Google Reviews to automatically sync customer feedback."
              actionLabel="Import First Review"
              onAction={() => setShowImport(true)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map(review => {
              const business = businesses.find(b => b.id === review.business_id);
              return (
                <div key={review.id} className="bg-white/90 backdrop-blur-sm rounded-[2rem_2rem_2rem_0.5rem] p-6 shadow-lg border border-[#e8e6de]/30 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-[#e8e6de]'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-[#6b7055] font-medium">{review.reviewer_name}</span>
                      </div>
                      <p className="text-sm text-[#9ca38a] mb-2">{business?.name}</p>
                      <p className="text-[#2d3319]">{review.text}</p>
                    </div>
                  </div>

                  {review.ai_response_draft && (
                    <div className="mt-4 space-y-3">
                      <div className="bg-[#a8b88c]/10 rounded-[1.5rem_1.5rem_1.5rem_0.5rem] p-4 border border-[#a8b88c]/20">
                        <label className="text-sm font-bold text-[#2d3319] mb-2 block flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#a8b88c]" />
                          AI Response Draft
                        </label>
                        <p className="text-sm text-[#6b7055]">{review.ai_response_draft}</p>
                      </div>
                      {review.ai_action_plan && (
                        <div className="bg-[#e8e6de]/50 rounded-[1.5rem_1.5rem_1.5rem_0.5rem] p-4">
                          <label className="text-sm font-bold text-[#2d3319] mb-2 block">
                            Action Plan
                          </label>
                          <p className="text-sm text-[#6b7055]">{review.ai_action_plan}</p>
                        </div>
                      )}
                      {review.ai_promo_idea && (
                        <div className="bg-[#d4e0b3]/20 rounded-[1.5rem_1.5rem_1.5rem_0.5rem] p-4 border border-[#d4e0b3]/30">
                          <label className="text-sm font-bold text-[#2d3319] mb-2 block">
                            Promo Idea
                          </label>
                          <p className="text-sm text-[#6b7055]">{review.ai_promo_idea}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    {!review.ai_response_draft && (
                      <Button 
                        onClick={() => handleGenerateResponse(review)}
                        disabled={generatingFor === review.id}
                        size="sm"
                        className="bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] hover:from-[#8a9a6e] hover:to-[#7a8a5e] text-white shadow-md"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {generatingFor === review.id ? 'Generating...' : 'Generate AI Response'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}