import React, { useState } from 'react';
import {
  ShieldAlert,
  SlidersHorizontal,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Info,
  Server,
  Lock,
  Layers,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Incident, ResponseOption, SimulationResult } from '../../types/security';
import { useSecurityStore } from '../../store/useSecurityStore';

interface CounterfactualSimulatorProps {
  incident: Incident;
}

export const CounterfactualSimulator: React.FC<CounterfactualSimulatorProps> = ({ incident }) => {
  const { executeSimulatedAction } = useSecurityStore();
  const [selectedActionId, setSelectedActionId] = useState<string>(
    incident.responseOptions[0]?.id || 'act-01'
  );
  const [activeSimulationResult, setActiveSimulationResult] = useState<SimulationResult | null>(
    null
  );
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedAction = incident.responseOptions.find((a) => a.id === selectedActionId) || incident.responseOptions[0];

  const chartData = incident.responseOptions.map((opt) => ({
    name: opt.actionType.replace('_', ' ').toUpperCase(),
    shortTitle: opt.title.split(' ')[0] + ' ' + (opt.title.split(' ')[1] || ''),
    SecurityBenefit: opt.scores.securityScore,
    BusinessContinuity: opt.scores.businessContinuity,
    RecoveryCost: opt.scores.recoveryComplexity
  }));

  const handleRunSimulation = () => {
    if (!selectedAction) return;
    setIsSimulating(true);

    setTimeout(() => {
      const res = executeSimulatedAction(incident.id, selectedAction.id);
      setActiveSimulationResult(res);
      setIsSimulating(false);
    }, 1200);
  };

  const getBenefitColor = (benefit: string) => {
    switch (benefit) {
      case 'VERY HIGH': return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
      case 'HIGH': return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-950/60 border-yellow-500/40';
      default: return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'VERY HIGH': return 'text-red-400 bg-red-950/60 border-red-500/40';
      case 'HIGH': return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-950/60 border-yellow-500/40';
      case 'LOW': return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
      default: return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  return (
    <div className="space-y-5">
      {/* Simulation Safety Warning Notice */}
      <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs font-sans">
          <div className="font-bold text-blue-300 uppercase tracking-wide font-mono">
            Counterfactual Defense Engine — Deterministic Simulation Sandbox
          </div>
          <div className="text-slate-300 mt-0.5 leading-relaxed">
            Actions are evaluated against the CyberTwin infrastructure graph. No live commands are executed against real infrastructure.
          </div>
        </div>
      </div>

      {/* Grid: Action Selector & Action Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Actions List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-1">
            Candidate Defensive Responses ({incident.responseOptions.length})
          </div>

          {incident.responseOptions.map((opt) => {
            const isSelected = opt.id === selectedActionId;
            return (
              <div
                key={opt.id}
                onClick={() => {
                  setSelectedActionId(opt.id);
                  setActiveSimulationResult(null);
                }}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="text-xs font-bold text-slate-200 uppercase font-mono">{opt.title}</div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${getBenefitColor(opt.securityBenefit)}`}>
                    {opt.securityBenefit} Benefit
                  </span>
                </div>

                <div className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed font-sans">
                  {opt.description}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  <div>
                    <span>Impact: </span>
                    <strong className="text-slate-200">{opt.operationalImpact}</strong>
                  </div>
                  <div className="text-right">
                    <span>Confidence: </span>
                    <strong className="text-cyan-400">{opt.confidence}%</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Action Decision Interface (7 cols) */}
        <div className="lg:col-span-7 bg-[#090e1d] border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
          {selectedAction && (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                    ACTION PROPOSAL
                  </div>
                  <h3 className="text-base font-bold text-slate-100 uppercase font-mono mt-0.5">
                    {selectedAction.title}
                  </h3>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-slate-400 text-[10px]">CERTAINTY</div>
                  <div className="text-cyan-400 font-bold text-base tabular-nums">{selectedAction.confidence}%</div>
                </div>
              </div>

              {/* Exact fields required: Security Benefit, Operational Impact, Affected Assets, Confidence, Estimated Recovery, Verification Checks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Security Benefit</div>
                  <div className="font-bold text-emerald-400 mt-0.5">{selectedAction.securityBenefit}</div>
                </div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Operational Impact</div>
                  <div className="font-bold text-amber-400 mt-0.5">{selectedAction.operationalImpact}</div>
                </div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Estimated Recovery</div>
                  <div className="font-bold text-cyan-300 mt-0.5">{selectedAction.estimatedRecovery || 'Immediate'}</div>
                </div>
              </div>

              {/* Affected Assets */}
              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400 mb-1 font-semibold flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  Affected Assets ({selectedAction.affectedAssets.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAction.affectedAssets.map((astId) => (
                    <span
                      key={astId}
                      className="px-2 py-0.5 text-xs font-mono bg-slate-900 border border-slate-700 text-slate-200 rounded"
                    >
                      {astId}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verification Checks */}
              <div className="p-3 rounded bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Verification Checks
                </div>
                <ul className="space-y-1 text-xs text-slate-300 font-mono">
                  {selectedAction.verificationChecks.map((chk, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{chk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* RUN SIMULATION button */}
              <div className="pt-2">
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="w-full py-2.5 px-4 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/40 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isSimulating ? 'SIMULATING COUNTERFACTUAL MODEL...' : 'RUN SIMULATION'}</span>
                </button>
              </div>

              {/* SIMULATION RESULT */}
              {activeSimulationResult && (
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/50 space-y-3 mt-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      SIMULATION RESULT: {activeSimulationResult.outcome}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Timestamp: {activeSimulationResult.simulatedAt}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Risk Reduction</div>
                      <div className="text-base font-bold text-emerald-400 tabular-nums">
                        +{activeSimulationResult.riskReduction}%
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Business Impact</div>
                      <div className="text-xs font-bold text-cyan-300 truncate">
                        {activeSimulationResult.businessImpact}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Residual Risk</div>
                      <div className="text-base font-bold text-slate-200 tabular-nums">
                        {activeSimulationResult.residualRisk}/100
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Chart Section */}
      <div className="bg-[#090e1d] border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Counterfactual Defense Comparison Matrix
            </div>
            <div className="text-[11px] text-slate-400">
              Comparative security benefit vs business continuity across candidate responses
            </div>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <XAxis dataKey="shortTitle" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0f1d',
                  borderColor: '#334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="SecurityBenefit" fill="#10b981" name="Security Benefit" radius={[4, 4, 0, 0]} />
              <Bar dataKey="BusinessContinuity" fill="#38bdf8" name="Business Continuity" radius={[4, 4, 0, 0]} />
              <Bar dataKey="RecoveryCost" fill="#f59e0b" name="Recovery Complexity" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
