import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, color = 'text-primary' }: StatCardProps) {
  return (
    <div className="bg-navy/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-slate-300 text-sm font-medium">{title}</h3>
        <Icon className={`${color}`} size={24} />
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="text-slate-400 text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
