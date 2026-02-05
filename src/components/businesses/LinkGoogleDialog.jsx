import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LinkGoogleDialog({ open, onClose, onSubmit, isSubmitting }) {
  const [placeId, setPlaceId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (placeId.trim()) {
      onSubmit({ place_id: placeId.trim() });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2d3319]">
            Link Google Business
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="place_id" className="text-[#2d3319] font-medium mb-2 block">
              Google Place ID
            </Label>
            <Input
              id="place_id"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
              className="border-[#e8e6de] focus:border-[#a8b88c]"
              required
            />
            <p className="text-xs text-[#6b7055] mt-2">
              Find your Place ID at{' '}
              <a
                href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a8b88c] underline"
              >
                Google Place ID Finder
              </a>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#e8e6de] text-[#6b7055]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#a8b88c] to-[#8a9a6e] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Linking...' : 'Link Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}