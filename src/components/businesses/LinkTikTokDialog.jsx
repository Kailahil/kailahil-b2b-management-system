import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LinkTikTokDialog({ open, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    handle: '',
    profile_url: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link TikTok Account</DialogTitle>
          <p className="text-sm text-slate-500 mt-2">
            TikTok API connection is being set up. Enter your account details below and analytics will appear once connected.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="handle">TikTok Handle</Label>
            <Input
              id="handle"
              placeholder="@username"
              value={formData.handle}
              onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="profile_url">Profile URL</Label>
            <Input
              id="profile_url"
              type="url"
              placeholder="https://www.tiktok.com/@username"
              value={formData.profile_url}
              onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
              required
              className="mt-1"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? 'Linking...' : 'Link Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}