import React, { useState } from 'react';
import {
  Network,
  Server,
  Database,
  Cloud,
  Laptop,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Filter
} from 'lucide-react';
import { CyberTwinMap } from '../components/cyberTwin/CyberTwinMap';
import { useSecurityStore } from '../store/useSecurityStore';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const CyberTwinPage: React.FC = () => {
  const { assets } = useSecurityStore();
  const [selectedZone, setSelectedZone] = useState<string>('all');

  const compromisedCount = assets.filter((a) => a.status === 'compromised').length;
  const atRiskCount = assets.filter((a) => a.status === 'at_risk').length;
  const healthyCount = assets.filter((a) => a.status === 'normal' || a.status === 'verified').length;

  return (
    <div className="space-y-4 max-w-[1900px] mx-auto h-[calc(100vh-5.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            CyberTwin Infrastructure Digital Twin
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Machine-readable architectural model evaluating trust boundaries, lateral reachability, and attack paths
          </p>
        </div>

        {/* Quick Health Stats */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Healthy:</span>
            <span className="text-slate-200 font-bold">{healthyCount}</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-400 font-semibold">At Risk:</span>
            <span className="text-amber-300 font-bold">{atRiskCount}</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-red-950/40 border border-red-800/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-400 font-semibold">Compromised:</span>
            <span className="text-red-300 font-bold">{compromisedCount}</span>
          </div>
        </div>
      </div>

      {/* CyberTwin Flow Canvas */}
      <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-slate-800">
        <ErrorBoundary componentName="CyberTwin Digital Infrastructure Model">
          <CyberTwinMap />
        </ErrorBoundary>
      </div>
    </div>
  );
};
