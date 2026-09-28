import React from 'react';
import { SlidersHorizontal, ShieldCheck, AlertTriangle } from 'lucide-react';
import { CounterfactualSimulator } from '../components/simulation/CounterfactualSimulator';
import { useSecurityStore } from '../store/useSecurityStore';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const SimulationsPage: React.FC = () => {
  const { incidents, selectedIncidentId, setSelectedIncidentId } = useSecurityStore();
  const currentIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            Counterfactual Defense Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate alternative defensive response actions against the Digital Twin infrastructure before containment approval
          </p>
        </div>

        {/* Incident Selector */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Target Incident:</span>
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.id} — {inc.title.slice(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulator Component */}
      <ErrorBoundary componentName="Counterfactual Defense Simulator">
        <CounterfactualSimulator incident={currentIncident} />
      </ErrorBoundary>
    </div>
  );
};
