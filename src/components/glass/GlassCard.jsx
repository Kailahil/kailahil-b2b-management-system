import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassCard({ 
  children, 
  className, 
  hover = false,
  ...props 
}) {
  return (
    <div
      className={cn(
        "relative rounded-[24px] overflow-hidden",
        "bg-cream-surface/70 backdrop-blur-xl",
        "border border-white/10",
        "shadow-[0_16px_48px_0_rgba(134,168,134,0.08)]",
        // Inner reflection at top (critical for glass effect)
        "before:absolute before:inset-x-0 before:top-0 before:h-[1px]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        // Subtle green tint
        "after:absolute after:inset-0 after:bg-gradient-to-br after:from-primary-green/5 after:to-transparent after:pointer-events-none after:rounded-[24px]",
        hover && "transition-all duration-500 ease-out hover:shadow-[0_20px_56px_0_rgba(134,168,134,0.12)] hover:bg-cream-surface/75 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}