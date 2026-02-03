import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  const [isImporting, setIsImporting] = useState(false);
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
        rating: 5,
        text: importText,
        reviewer_name: 'Manual Import',
        created_at_platform: new Date().toISOString()
      });

      setReviews([newReview, ...reviews]);
      setImportText('');
      setShowImport(false);
      alert('Review imported successfully!');
    } catch (error) {
      console.error('Failed to import review:', error);
      alert('Failed to import review');
    } finally {
      setIsImporting(false);
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredReviews = selectedBusiness === 'all' 
    ? reviews 
    : reviews.filter(r => r.business_id === selectedBusiness);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reviews</h1>
          <p className="text-slate-600">Manage and respond to customer reviews</p>
        </div>
        <Button 
          onClick={() => setShowImport(!showImport)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import Review
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Filter by business:</span>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="all">All Businesses</option>
              {businesses.map(biz => (
                <option key={biz.id} value={biz.id}>{biz.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {showImport && (
        <Card className="mb-6 border-indigo-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg">Import Review</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Select Business
                </label>
                <select
                  value={selectedBusiness === 'all' ? '' : selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                >
                  <option value="">Choose a business...</option>
                  {businesses.map(biz => (
                    <option key={biz.id} value={biz.id}>{biz.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Review Text
                </label>
                <Textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste review text here..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleImport}
                  disabled={isImporting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isImporting ? 'Importing...' : 'Import Review'}
                </Button>
                <Button 
                  onClick={() => setShowImport(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={MessageSquare}
              title="No reviews yet"
              description="Import reviews manually or connect Google Reviews to automatically sync customer feedback."
              actionLabel="Import First Review"
              onAction={() => setShowImport(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => {
            const business = businesses.find(b => b.id === review.business_id);
            return (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600">{review.reviewer_name}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{business?.name}</p>
                      <p className="text-slate-900">{review.text}</p>
                    </div>
                  </div>

                  {review.ai_response_draft && (
                    <div className="mt-4 space-y-3">
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <label className="text-sm font-medium text-indigo-900 mb-2 block flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          AI Response Draft
                        </label>
                        <p className="text-sm text-slate-700">{review.ai_response_draft}</p>
                      </div>
                      {review.ai_action_plan && (
                        <div className="bg-slate-50 rounded-lg p-4">
                          <label className="text-sm font-medium text-slate-900 mb-2 block">
                            Action Plan
                          </label>
                          <p className="text-sm text-slate-700">{review.ai_action_plan}</p>
                        </div>
                      )}
                      {review.ai_promo_idea && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <label className="text-sm font-medium text-green-900 mb-2 block">
                            Promo Idea
                          </label>
                          <p className="text-sm text-slate-700">{review.ai_promo_idea}</p>
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
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {generatingFor === review.id ? 'Generating...' : 'Generate AI Response'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}