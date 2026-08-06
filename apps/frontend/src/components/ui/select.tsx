import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-500',
      className,
    )}
    {...props}
  />
));

Select.displayName = 'Select';
