import React from 'react';
import { cn } from '@/lib/utils';

export default function HeroCard({ 
  image,
  title,
  subtitle,
  children,
  className,
  ...props 
}) {
  return (
    <div
      className={cn(
        "bg-cream-card rounded-[28px] overflow-hidden",
        "shadow-[0_16px_48px_0_rgba(68,104,68,0.12)]",
        className
      )}
      {...props}
    >
      {image && (
        <div className="relative h-64 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        {title && (
          <h3 className="text-2xl font-semibold text-text-primary mb-2">{title}</h3>
        )}
        {subtitle && (
          <p className="text-text-secondary mb-4">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}