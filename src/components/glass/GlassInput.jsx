import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassInput({ 
  className,
  type = 'text',
  ...props 
}) {
  return (
    <input
      type={type}
      className={cn(
        "w-full px-4 py-3.5 rounded-2xl",
        "bg-cream-surface/60 backdrop-blur-md",
        "border border-white/15",
        "text-text-primary placeholder:text-text-secondary/50",
        "shadow-[0_2px_12px_0_rgba(134,168,134,0.04)]",
        "focus:outline-none focus:ring-2 focus:ring-primary-green/25 focus:border-white/25 focus:bg-cream-surface/70",
        "transition-all duration-300",
        className
      )}
      {...props}
    />
  );
}