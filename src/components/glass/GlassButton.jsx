import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassButton({ 
  children, 
  variant = 'primary',
  size = 'default',
  disabled = false,
  className,
  ...props 
}) {
  const variants = {
    primary: cn(
      "bg-primary-green/90 backdrop-blur-md text-cream-surface",
      "hover:bg-primary-green hover:shadow-[0_4px_20px_0_rgba(134,168,134,0.4)]",
      "active:bg-primary-green-dark"
    ),
    secondary: cn(
      "bg-cream-surface/40 backdrop-blur-md text-primary-green-dark border border-primary-green/30",
      "hover:bg-cream-surface/60 hover:border-primary-green/50",
      "active:bg-cream-surface/80"
    ),
    ghost: cn(
      "bg-transparent hover:bg-cream-surface/30 text-text-primary",
      "active:bg-cream-surface/50"
    )
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-5 py-2.5 text-base",
    lg: "px-7 py-3.5 text-lg"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-2xl font-medium",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}