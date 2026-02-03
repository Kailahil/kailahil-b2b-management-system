import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassTextarea({ 
  className,
  ...props 
}) {
  return (
    <textarea
      className={cn(
        "w-full px-4 py-3 rounded-xl",
        "bg-cream-surface/50 backdrop-blur-md",
        "border border-white/30",
        "text-text-primary placeholder:text-text-secondary/60",
        "focus:outline-none focus:ring-2 focus:ring-primary-green/40 focus:border-primary-green/50",
        "transition-all duration-200",
        "resize-none",
        className
      )}
      {...props}
    />
  );
}