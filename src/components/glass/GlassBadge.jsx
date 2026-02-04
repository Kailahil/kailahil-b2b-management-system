import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassBadge({ 
  children,
  variant = 'default',
  className,
  ...props 
}) {
  const variants = {
    default: "bg-cream-surface/50 text-text-primary border-white/15",
    green: "bg-primary-green/20 text-primary-green-dark border-primary-green/20 shadow-[0_2px_8px_0_rgba(134,168,134,0.1)]",
    success: "bg-emerald-100/40 text-emerald-700 border-emerald-200/30 shadow-[0_2px_8px_0_rgba(16,185,129,0.08)]",
    warning: "bg-amber-100/40 text-amber-700 border-amber-200/30 shadow-[0_2px_8px_0_rgba(245,158,11,0.08)]",
    error: "bg-red-100/40 text-red-700 border-red-200/30 shadow-[0_2px_8px_0_rgba(239,68,68,0.08)]"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1",
        "rounded-full text-xs font-medium",
        "backdrop-blur-md border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}