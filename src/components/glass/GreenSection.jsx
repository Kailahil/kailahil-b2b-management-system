import React from 'react';
import { cn } from '@/lib/utils';

export default function GreenSection({ 
  children, 
  className,
  rounded = true,
  ...props 
}) {
  return (
    <div
      className={cn(
        "bg-primary-green-rich text-cream-card p-8",
        rounded && "rounded-[32px]",
        "shadow-[0_20px_60px_0_rgba(68,104,68,0.15)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}