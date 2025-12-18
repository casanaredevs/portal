import * as React from 'react';
import { cn } from '@/lib/utils';

const VARIANT_STYLES: Record<string,string> = {
  neutral: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200',
  success: 'bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-300 border border-green-500/30',
  warning: 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300 border border-amber-500/30',
  danger: 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-500/30',
  info: 'bg-sky-500/15 text-sky-700 dark:bg-sky-500/25 dark:text-sky-300 border border-sky-500/30',
  brand: 'bg-fuchsia-500/15 text-fuchsia-700 dark:bg-fuchsia-600/25 dark:text-fuchsia-300 border border-fuchsia-500/30',
};

const SIZE_STYLES: Record<string,string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof VARIANT_STYLES;
  size?: keyof typeof SIZE_STYLES;
  rounded?: boolean; // pill style
  outline?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = 'neutral', size = 'sm', rounded = true, outline = false, ...props }, ref
) {
  const base = 'inline-flex items-center font-medium tracking-wide select-none align-middle';
  const radius = rounded ? 'rounded-full' : 'rounded-md';
  const variantCls = VARIANT_STYLES[variant] || VARIANT_STYLES.neutral;
  const sizeCls = SIZE_STYLES[size] || SIZE_STYLES.sm;
  const outlineCls = outline ? 'bg-transparent border border-current' : '';
  return (
    <span ref={ref} className={cn(base, radius, sizeCls, variantCls, outlineCls, className)} {...props} />
  );
});

export default Badge;
