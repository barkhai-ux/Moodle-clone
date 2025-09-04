import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export function NotificationBadge({ 
  count, 
  className, 
  size = 'md',
  variant = 'destructive' 
}: NotificationBadgeProps) {
  if (count === 0) return null;

  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-xs',
    lg: 'h-6 w-6 text-sm',
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <Badge 
      variant={variant}
      className={cn(
        'absolute -top-1 -right-1 flex items-center justify-center rounded-full p-0 min-w-0',
        sizeClasses[size],
        className
      )}
    >
      {displayCount}
    </Badge>
  );
}
