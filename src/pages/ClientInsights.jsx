import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ClientInsights() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const clientBusinessList = await base44.entities.ClientBusiness.filter({ 
          user_id: currentUser.id 
        });

        if (clientBusinessList.length > 0) {
          const businessList = await base44.entities.Business.filter({ 
            id: clientBusinessList[0].business_id 
          });
          if (businessList.length > 0) {
            setBusiness(businessList[0]);

            const aiInsights = await base44.entities.AIInsight.filter({
              business_id: businessList[0].id
            }, '-created_date', 10);
            if (aiInsights.length > 0) {
              setInsights(aiInsights[0]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] px-4 py-8 pb-32 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-10">
          <div className="inline-block mb-3">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
              <span className="text-xs text-[#6b7055] font-medium uppercase tracking-wider">Insights</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2d3319] mb-3 leading-tight">
            What's Working for Your Business
          </h1>
          <p className="text-[#6b7055] text-lg">
            AI-powered analysis of your content performance and team focus
          </p>
        </div>

        {insights ? (
          <div className="space-y-6">
            {/* What's Working */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50">
              <h2 className="text-2xl font-bold text-[#2d3319] mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#6d7d51]" />
                What's Working
              </h2>
              <div className="prose prose-sm prose-slate max-w-none">
                <p className="text-[#6b7055] leading-relaxed">{insights.root_causes || 'Analysis pending...'}</p>
              </div>
            </div>

            {/* What Needs Attention */}
            {insights.insight_type === 'risks' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50">
                <h2 className="text-2xl font-bold text-[#2d3319] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-[#a8b88c]" />
                  What Needs Attention
                </h2>
                <div className="prose prose-sm prose-slate max-w-none">
                  <p className="text-[#6b7055] leading-relaxed">{insights.root_causes || 'Analysis pending...'}</p>
                </div>
              </div>
            )}

            {/* Recommended Next Steps */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-[#e8e6de]/50">
              <h2 className="text-2xl font-bold text-[#2d3319] mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-[#7a8a5e]" />
                Recommended Next Steps
              </h2>
              {insights.action_items && (
                <div className="space-y-3">
                  {typeof insights.action_items === 'string' ? (
                    <p className="text-[#6b7055] leading-relaxed">{insights.action_items}</p>
                  ) : Array.isArray(insights.action_items) ? (
                    <ul className="space-y-2">
                      {insights.action_items.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-[#6b7055]">
                          <span className="text-[#a8b88c] font-bold">{idx + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[#6b7055]">Analysis pending...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg border border-[#e8e6de]/50">
            <Lightbulb className="w-16 h-16 mx-auto text-[#d4d2c8] mb-6" />
            <h3 className="text-2xl font-bold text-[#2d3319] mb-3">Insights Coming Soon</h3>
            <p className="text-[#6b7055] text-lg max-w-md mx-auto">
              Once your team has created content and we've gathered performance data, AI insights will appear here to guide your strategy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}