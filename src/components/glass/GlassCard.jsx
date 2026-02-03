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
        "relative rounded-3xl",
        "bg-cream-surface/60 backdrop-blur-xl",
        "border border-white/20",
        "shadow-[0_8px_32px_0_rgba(134,168,134,0.12)]",
        "before:absolute before:inset-x-0 before:top-0 before:h-px",
        "before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
        hover && "transition-all duration-300 hover:shadow-[0_12px_40px_0_rgba(134,168,134,0.18)] hover:translate-y-[-2px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}