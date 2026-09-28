import React, { useState } from 'react';
import { GitFork, Layers, ShieldAlert, Sparkles, Filter, Info, ArrowRight } from 'lucide-react';
import { AttackGraphFlow } from '../components/attackGraph/AttackGraphFlow';
import { useSecurityStore } from '../store/useSecurityStore';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { Link } from 'react-router-dom';

export const AttackGraphPage: React.FC = () => {
  const { incidents, selectedIncidentId, setSelectedIncidentId, simulation } = useSecurityStore();
  const currentIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  return (
    <div className="space-y-4 max-w-[1900px] mx-auto h-[calc(100vh-5.5rem)] flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            AttackDNA Graph Correlation Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Temporal and contextual attack-graph reconstruction mapping fragmented security events into unified campaigns
          </p>
        </div>

        {/* Incident Selector */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Target Campaign:</span>
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.id} — {inc.title.slice(0, 40)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Flow Canvas with Info Overlay */}
      <div className="flex-1 relative rounded-lg border border-slate-800 overflow-hidden flex flex-col">
        {/* Top Info Banner */}
        <div className="bg-[#090e1c] border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-300 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold">{currentIncident.id}</span>
            <span className="text-slate-500">|</span>
            <span>Current Stage: <strong className="text-amber-400">{currentIncident.stage}</strong></span>
            <span className="text-slate-500">|</span>
            <span>Certainty: <strong className="text-cyan-300">{currentIncident.confidence}%</strong></span>
          </div>

          <Link
            to={`/incidents/${currentIncident.id}`}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
          >
            <span>Open 3-Column Investigation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* The Graph Canvas */}
        <div className="flex-1 w-full h-full relative">
          <ErrorBoundary componentName="AttackDNA Graph Engine">
            <AttackGraphFlow interactive={true} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
