import React from 'react';
import { Clock, CheckCircle2, XCircle, FileEdit } from 'lucide-react';
import type { ApplicationStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs = {
    draft: {
      label: 'Draft Application',
      icon: FileEdit,
      bg: 'bg-slate-800/80 text-slate-300 border-slate-700',
      dot: 'bg-slate-400',
    },
    pending_review: {
      label: 'Pending Review',
      icon: Clock,
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400 animate-ping',
    },
    approved: {
      label: 'Approved & Verified',
      icon: CheckCircle2,
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    rejected: {
      label: 'Action Required / Rejected',
      icon: XCircle,
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400',
    },
  };

  const current = configs[status] || configs.draft;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 space-x-1.5',
    md: 'text-sm px-3.5 py-1.5 space-x-2',
    lg: 'text-base px-5 py-2.5 space-x-2.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${current.bg} ${sizeClasses[size]}`}
    >
      <span className="relative flex h-2 w-2 mr-0.5">
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`} />
      </span>
      <Icon className="w-4 h-4" />
      <span>{current.label}</span>
    </span>
  );
};
