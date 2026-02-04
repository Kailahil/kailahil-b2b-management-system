import React from 'react';
import { cn } from '@/lib/utils';

export default function FloatingCard({ 
  children, 
  className,
  hover = false,
  ...props 
}) {
  return (
    <div
      className={cn(
        "bg-cream-card rounded-[24px] p-6",
        "shadow-[0_12px_40px_0_rgba(68,104,68,0.12)]",
        hover && "transition-all duration-300 hover:shadow-[0_16px_48px_0_rgba(68,104,68,0.18)] hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}