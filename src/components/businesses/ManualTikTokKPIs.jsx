import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ManualTikTokKPIs({ business }) {
  const [kpis, setKpis] = useState({
    followers: '',
    views_7d: '',
    likes_7d: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadKPIs();
  }, [business.id]);

  const loadKPIs = async () => {
    try {
      const manualKPIs = await base44.entities.ManualKPI.filter({
        business_id: business.id
      });

      const kpiMap = {};
      manualKPIs.forEach(kpi => {
        if (kpi.metric_name === 'tiktok_followers') kpiMap.followers = kpi.metric_value;
        if (kpi.metric_name === 'tiktok_views_7d') kpiMap.views_7d = kpi.metric_value;
        if (kpi.metric_name === 'tiktok_likes_7d') kpiMap.likes_7d = kpi.metric_value;
        if (kpi.metric_name === 'tiktok_notes') kpiMap.notes = kpi.notes;
      });

      setKpis({
        followers: kpiMap.followers || '',
        views_7d: kpiMap.views_7d || '',
        likes_7d: kpiMap.likes_7d || '',
        notes: kpiMap.notes || ''
      });
    } catch (error) {
      console.error('Failed to load manual KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const timestamp = new Date().toISOString();
      const updates = [];

      // Save each KPI
      if (kpis.followers !== '') {
        updates.push(
          base44.entities.ManualKPI.filter({
            business_id: business.id,
            metric_name: 'tiktok_followers'
          }).then(async (existing) => {
            if (existing.length > 0) {
              await base44.entities.ManualKPI.update(existing[0].id, {
                metric_value: parseFloat(kpis.followers),
                recorded_at: timestamp
              });
            } else {
              await base44.entities.ManualKPI.create({
                agency_id: business.agency_id,
                business_id: business.id,
                metric_name: 'tiktok_followers',
                metric_value: parseFloat(kpis.followers),
                recorded_at: timestamp
              });
            }
          })
        );
      }

      if (kpis.views_7d !== '') {
        updates.push(
          base44.entities.ManualKPI.filter({
            business_id: business.id,
            metric_name: 'tiktok_views_7d'
          }).then(async (existing) => {
            if (existing.length > 0) {
              await base44.entities.ManualKPI.update(existing[0].id, {
                metric_value: parseFloat(kpis.views_7d),
                recorded_at: timestamp
              });
            } else {
              await base44.entities.ManualKPI.create({
                agency_id: business.agency_id,
                business_id: business.id,
                metric_name: 'tiktok_views_7d',
                metric_value: parseFloat(kpis.views_7d),
                recorded_at: timestamp
              });
            }
          })
        );
      }

      if (kpis.likes_7d !== '') {
        updates.push(
          base44.entities.ManualKPI.filter({
            business_id: business.id,
            metric_name: 'tiktok_likes_7d'
          }).then(async (existing) => {
            if (existing.length > 0) {
              await base44.entities.ManualKPI.update(existing[0].id, {
                metric_value: parseFloat(kpis.likes_7d),
                recorded_at: timestamp
              });
            } else {
              await base44.entities.ManualKPI.create({
                agency_id: business.agency_id,
                business_id: business.id,
                metric_name: 'tiktok_likes_7d',
                metric_value: parseFloat(kpis.likes_7d),
                recorded_at: timestamp
              });
            }
          })
        );
      }

      if (kpis.notes !== '') {
        updates.push(
          base44.entities.ManualKPI.filter({
            business_id: business.id,
            metric_name: 'tiktok_notes'
          }).then(async (existing) => {
            if (existing.length > 0) {
              await base44.entities.ManualKPI.update(existing[0].id, {
                notes: kpis.notes,
                recorded_at: timestamp
              });
            } else {
              await base44.entities.ManualKPI.create({
                agency_id: business.agency_id,
                business_id: business.id,
                metric_name: 'tiktok_notes',
                notes: kpis.notes,
                recorded_at: timestamp
              });
            }
          })
        );
      }

      await Promise.all(updates);
      alert('Manual KPIs saved successfully!');
    } catch (error) {
      console.error('Failed to save manual KPIs:', error);
      alert('Failed to save manual KPIs. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          Manual TikTok KPIs
          <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-1 rounded">Manual Entry</span>
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Track TikTok performance manually until API connection is complete.
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="followers">Followers</Label>
            <Input
              id="followers"
              type="number"
              placeholder="0"
              value={kpis.followers}
              onChange={(e) => setKpis({ ...kpis, followers: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="views_7d">Views (Last 7 Days)</Label>
            <Input
              id="views_7d"
              type="number"
              placeholder="0"
              value={kpis.views_7d}
              onChange={(e) => setKpis({ ...kpis, views_7d: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="likes_7d">Likes (Last 7 Days)</Label>
            <Input
              id="likes_7d"
              type="number"
              placeholder="0"
              value={kpis.likes_7d}
              onChange={(e) => setKpis({ ...kpis, likes_7d: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes about these metrics..."
            value={kpis.notes}
            onChange={(e) => setKpis({ ...kpis, notes: e.target.value })}
            className="mt-1"
            rows={3}
          />
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {saving ? 'Saving...' : 'Save KPIs'}
        </Button>
      </CardContent>
    </Card>
  );
}