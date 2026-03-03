import React from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({ title, value, unit, subtitle, className }: MetricCardProps) {
  return (
    <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between transition-colors duration-500", className)}>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
      <div className="mt-3">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
          {unit && <span className="text-sm text-slate-500 font-bold">{unit}</span>}
        </div>
        {subtitle && <p className="text-xs font-medium text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
