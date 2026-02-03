import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassBadge({ 
  children,
  variant = 'default',
  className,
  ...props 
}) {
  const variants = {
    default: "bg-cream-surface/60 text-text-primary border-white/20",
    green: "bg-primary-green/30 text-primary-green-dark border-primary-green/30",
    success: "bg-emerald-100/60 text-emerald-700 border-emerald-200/40",
    warning: "bg-amber-100/60 text-amber-700 border-amber-200/40",
    error: "bg-red-100/60 text-red-700 border-red-200/40"
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