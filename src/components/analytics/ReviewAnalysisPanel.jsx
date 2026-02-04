import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb, Target, TrendingUp, Zap } from 'lucide-react';

export default function ReviewAnalysisPanel({ businessId }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateReviewAnalysis', {
        business_id: businessId
      });
      setAnalysis(response.data);
    } catch (error) {
      console.error('Failed to generate analysis:', error);
      alert('Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            AI Review Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#6b7055] mb-4">
            Let AI analyze your reviews to identify issues and generate solutions.
          </p>
          <Button
            onClick={generateAnalysis}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
            Generate AI Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Root Causes */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Target className="w-5 h-5" />
            Root Causes Identified
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.rootCauses?.map((cause, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span className="text-[#2d3319]">{cause}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Business Solutions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Zap className="w-5 h-5" />
            Business Solutions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.businessSolutions?.map((solution, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-[#2d3319]">{solution}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Marketing Tactics */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <TrendingUp className="w-5 h-5" />
            Marketing Tactics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.marketingTactics?.map((tactic, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-green-600 font-bold">→</span>
                <span className="text-[#2d3319]">{tactic}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Promotions */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Zap className="w-5 h-5" />
            Recommended Promotions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.promotions?.map((promo, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-purple-600 font-bold">🎯</span>
                <span className="text-[#2d3319]">{promo}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Button
        onClick={() => setAnalysis(null)}
        variant="outline"
        className="w-full border-[#a8b88c] text-[#7a8a5e]"
      >
        Generate New Analysis
      </Button>
    </div>
  );
}