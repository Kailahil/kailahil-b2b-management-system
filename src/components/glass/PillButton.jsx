import React from 'react';
import { cn } from '@/lib/utils';

export default function PillButton({ 
  children,
  variant = 'green',
  className,
  ...props 
}) {
  const variants = {
    green: "bg-primary-green/30 text-primary-green-dark hover:bg-primary-green/40",
    cream: "bg-cream-surface/80 text-text-primary hover:bg-cream-surface"
  };

  return (
    <button
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium",
        "transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}