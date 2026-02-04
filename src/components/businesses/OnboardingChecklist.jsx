import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export default function OnboardingChecklist({ business, socialAccounts, reviewSources }) {
  const steps = [
    {
      id: 'tiktok',
      label: 'TikTok Linked',
      completed: socialAccounts.some(acc => acc.platform === 'tiktok' && (acc.connected_status === 'connected' || acc.connected_status === 'pending')),
      pending: socialAccounts.some(acc => acc.platform === 'tiktok' && acc.connected_status === 'pending')
    },
    {
      id: 'instagram',
      label: 'Instagram Linked',
      completed: socialAccounts.some(acc => acc.platform === 'instagram' && acc.connected_status === 'connected')
    },
    {
      id: 'google',
      label: 'Google Place ID Set',
      completed: reviewSources.some(src => src.platform === 'google' && src.place_id)
    },
    {
      id: 'primary_contact',
      label: 'Primary Media Contact Set',
      completed: !!business.primary_media_user_id
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem_2.5rem_2.5rem_1rem] shadow-lg border border-[#e8e6de]/30">
      <div className="p-6 border-b border-[#e8e6de]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-[#2d3319]">Onboarding Checklist</h3>
          <span className="text-sm font-bold text-[#6b7055]">{completedCount}/{steps.length}</span>
        </div>
        <div className="h-2 bg-[#e8e6de] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {steps.map(step => (
            <div key={step.id} className="flex items-center gap-3">
              {step.pending ? (
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              ) : step.completed ? (
                <CheckCircle2 className="w-5 h-5 text-[#a8b88c] flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-[#e8e6de] flex-shrink-0" />
              )}
              <span className={step.completed ? 'text-[#2d3319] font-medium' : 'text-[#9ca38a]'}>
                {step.label}
                {step.pending && <span className="text-amber-600 text-xs ml-2">(Pending)</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}