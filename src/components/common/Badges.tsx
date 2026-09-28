import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { IncidentStatus, SeverityLevel, ThreatLevel } from '../../types/security';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  const styles: Record<SeverityLevel, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
    critical: {
      bg: 'bg-red-950/60 border-red-500/30',
      text: 'text-red-400',
      dot: 'bg-red-500',
      icon: <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" aria-hidden="true" />
    },
    high: {
      bg: 'bg-amber-950/60 border-amber-500/30',
      text: 'text-amber-400',
      dot: 'bg-amber-500',
      icon: <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" aria-hidden="true" />
    },
    medium: {
      bg: 'bg-yellow-950/60 border-yellow-500/30',
      text: 'text-yellow-400',
      dot: 'bg-yellow-500',
      icon: <AlertCircle className="w-3 h-3 text-yellow-400 shrink-0" aria-hidden="true" />
    },
    low: {
      bg: 'bg-blue-950/60 border-blue-500/30',
      text: 'text-blue-400',
      dot: 'bg-blue-500',
      icon: <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" aria-hidden="true" />
    },
    info: {
      bg: 'bg-slate-900/60 border-slate-700/40',
      text: 'text-slate-400',
      dot: 'bg-slate-400',
      icon: <ShieldCheck className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
    }
  };

  const style = styles[severity] || styles.info;

  return (
    <span
      role="status"
      aria-label={`Severity: ${severity}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono uppercase tracking-wider rounded border ${style.bg} ${style.text} ${className}`}
    >
      {style.icon}
      <span>{severity}</span>
    </span>
  );
};

interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const styles: Record<IncidentStatus, { bg: string; text: string; label: string }> = {
    open: { bg: 'bg-red-950/40 border-red-800/40', text: 'text-red-400', label: 'Open' },
    triaged: { bg: 'bg-amber-950/40 border-amber-800/40', text: 'text-amber-400', label: 'Triaged' },
    investigating: { bg: 'bg-cyan-950/40 border-cyan-800/40', text: 'text-cyan-400', label: 'Investigating' },
    containment_pending: { bg: 'bg-yellow-950/40 border-yellow-800/40', text: 'text-yellow-300', label: 'Containment Pending' },
    contained: { bg: 'bg-emerald-950/40 border-emerald-800/40', text: 'text-emerald-400', label: 'Contained' },
    verifying: { bg: 'bg-purple-950/40 border-purple-800/40', text: 'text-purple-400', label: 'Verifying' },
    resolved: { bg: 'bg-emerald-950/60 border-emerald-500/40', text: 'text-emerald-300', label: 'Resolved' },
    false_positive: { bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400', label: 'False Positive' }
  };

  const style = styles[status] || styles.open;

  return (
    <span
      role="status"
      aria-label={`Incident status: ${style.label}`}
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${style.bg} ${style.text} ${className}`}
    >
      {style.label}
    </span>
  );
};

interface ThreatLevelBadgeProps {
  level: ThreatLevel;
  className?: string;
}

export const ThreatLevelBadge: React.FC<ThreatLevelBadgeProps> = ({ level, className = '' }) => {
  const styles: Record<ThreatLevel, { bg: string; border: string; text: string; dot: string; pulse: boolean; icon: React.ReactNode }> = {
    LOW: {
      bg: 'bg-emerald-950/60',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
      pulse: false,
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
    },
    ELEVATED: {
      bg: 'bg-yellow-950/60',
      border: 'border-yellow-500/40',
      text: 'text-yellow-400',
      dot: 'bg-yellow-400',
      pulse: false,
      icon: <AlertCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" aria-hidden="true" />
    },
    HIGH: {
      bg: 'bg-amber-950/60',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      pulse: true,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
    },
    CRITICAL: {
      bg: 'bg-red-950/80',
      border: 'border-red-500/50',
      text: 'text-red-400',
      dot: 'bg-red-500',
      pulse: true,
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" aria-hidden="true" />
    }
  };

  const style = styles[level] || styles.LOW;

  return (
    <div
      role="status"
      aria-label={`Overall Threat Level: DEFCON ${level}`}
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono font-semibold tracking-wider border ${style.bg} ${style.border} ${style.text} ${className}`}
    >
      {style.icon}
      <span className="relative flex h-2 w-2">
        {style.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`} />
      </span>
      <span>DEFCON {level}</span>
    </div>
  );
};
