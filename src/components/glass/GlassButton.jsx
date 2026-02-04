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
      "bg-primary-green/85 backdrop-blur-md text-cream-surface border border-white/10",
      "shadow-[0_2px_16px_0_rgba(134,168,134,0.2)]",
      "hover:bg-primary-green/90 hover:brightness-105",
      "active:bg-primary-green/95 active:scale-[0.98]"
    ),
    secondary: cn(
      "bg-cream-surface/50 backdrop-blur-md text-primary-green-dark border border-white/20",
      "hover:bg-cream-surface/70 hover:brightness-105",
      "active:bg-cream-surface/80 active:scale-[0.98]"
    ),
    ghost: cn(
      "bg-transparent hover:bg-cream-surface/40 text-text-primary",
      "active:bg-cream-surface/60 active:scale-[0.98]"
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