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
    <Card>
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Onboarding Checklist</CardTitle>
          <span className="text-sm font-medium text-slate-600">{completedCount}/{steps.length}</span>
        </div>
        <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {steps.map(step => (
            <div key={step.id} className="flex items-center gap-3">
              {step.pending ? (
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              ) : step.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
              )}
              <span className={step.completed ? 'text-slate-900' : 'text-slate-500'}>
                {step.label}
                {step.pending && <span className="text-amber-600 text-xs ml-2">(Pending)</span>}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}