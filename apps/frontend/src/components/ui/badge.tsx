import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'green' | 'amber' | 'red' | 'slate' | 'indigo';
};

const tones = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
};

export function Badge({ className, tone = 'slate', ...props }: BadgeProps) {
  return <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold', tones[tone], className)} {...props} />;
}
