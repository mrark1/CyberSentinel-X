/**
 * CyberSentinel X - Counterfactual Response Decision Modal
 * Human-in-the-Loop decision interface: Operator reviews candidate actions,
 * evaluates counterfactual simulation impact, and approves simulated containment.
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Lock,
  X,
  ArrowRight,
  Server,
  Layers
} from 'lucide-react';
import { useDemoStore } from '../demoController';
import { CANDIDATE_ACTIONS_DATA } from '../demoScenario';

export const CounterfactualDecisionModal: React.FC = () => {
  const {
    showResponseDecisionModal,
    selectedResponseActionId,
    selectResponseAction,
    approveContainment,
    jumpToStep,
    currentStepIndex,
    isContainmentApproved,
    currentPhase
  } = useDemoStore();

  const isExecutingContainment =
    isContainmentApproved ||
    currentPhase === 'CONTAINMENT' ||
    currentPhase === 'VERIFYING' ||
    currentPhase === 'VERIFIED';

  const [activeActionId, setActiveActionId] = useState<string>(
    selectedResponseActionId || 'resp-revoke-session'
  );
  const [hasSimulated, setHasSimulated] = useState(true);

  if (!showResponseDecisionModal && currentStepIndex !== 9 && currentStepIndex !== 10) {
    return null;
  }

  const selectedAction =
    CANDIDATE_ACTIONS_DATA.find((a) => a.id === activeActionId) || CANDIDATE_ACTIONS_DATA[0];

  const handleSimulate = (actionId: string) => {
    setActiveActionId(actionId);
    setHasSimulated(true);
    selectResponseAction(actionId);
  };

  const handleClose = () => {
    useDemoStore.setState({ showResponseDecisionModal: false });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b1022] border border-cyan-500/80 rounded-xl max-w-3xl w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                HUMAN-IN-THE-LOOP DEFENSIVE CONTROL
              </div>
              <h2 className="text-lg font-bold font-mono text-white">
                RESPONSE DECISION REQUIRED
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
              OPERATOR REVIEW
            </span>
          </div>
        </div>

        {/* Visual 6-Step Response Workflow */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-2">
            Human-in-the-Loop Defense Workflow:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center font-mono text-[10px]">
            <div className="p-1.5 rounded bg-purple-950/40 border border-purple-800/40 text-purple-300">
              <span className="block text-[8px] text-slate-400 uppercase">1. Advisory</span>
              <strong>AI Recommends</strong>
            </div>
            <div className="p-1.5 rounded bg-amber-950/70 border border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30">
              <span className="block text-[8px] text-slate-400 uppercase">2. Oversight</span>
              <strong>Operator Reviews</strong>
            </div>
            <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
              <span className="block text-[8px] text-slate-400 uppercase">3. Twin Test</span>
              <strong>Simulator</strong>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              <span className="block text-[8px] text-slate-400 uppercase">4. Gate</span>
              <strong>Operator Approves</strong>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              <span className="block text-[8px] text-slate-400 uppercase">5. Contain</span>
              <strong>Simulated Action</strong>
            </div>
            <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
              <span className="block text-[8px] text-slate-400 uppercase">6. Attest</span>
              <strong>Verification</strong>
            </div>
          </div>
        </div>

        {/* Candidate Actions Grid */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Candidate Containment Actions</span>
            <span className="text-[10px] text-cyan-400">Select to simulate counterfactual outcome</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {CANDIDATE_ACTIONS_DATA.map((act) => {
              const isSelected = act.id === activeActionId;

              return (
                <div
                  key={act.id}
                  onClick={() => handleSimulate(act.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-slate-100">
                      {act.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        act.badge === 'RECOMMENDED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {act.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono pt-1 text-slate-400 border-t border-slate-800/80">
                    <div>
                      <span>Benefit: </span>
                      <strong className="text-emerald-400">{act.securityBenefit}</strong>
                    </div>
                    <div>
                      <span>Impact: </span>
                      <strong className="text-slate-200">{act.operationalImpact}</strong>
                    </div>
                    <div>
                      <span>Confidence: </span>
                      <span className="text-cyan-300">{act.confidence}%</span>
                    </div>
                    <div>
                      <span>Residual Risk: </span>
                      <span className="text-amber-400 font-bold">{act.residualRisk} / 100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Counterfactual Simulation Result Panel */}
        {hasSimulated && (
          <div className="p-4 rounded-lg bg-slate-950/90 border border-cyan-900/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800/80 pb-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                COUNTERFACTUAL SIMULATION EVALUATION
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Model: Deterministic Behavioral Twin
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Selected Action</div>
                <div className="text-xs font-mono font-bold text-cyan-300 truncate mt-0.5">
                  {selectedAction.title}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Expected Benefit</div>
                <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                  {selectedAction.securityBenefit}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Business Downtime</div>
                <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                  {selectedAction.operationalImpact}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Residual Risk</div>
                <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                  {selectedAction.residualRisk} / 100
                </div>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">
                Automated Verification Plan:
              </span>
              {selectedAction.verificationPlan}
            </div>

            <div className="p-2 rounded bg-cyan-950/30 border border-cyan-800/40 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                Safety Assurance: Containment will execute purely as a simulated in-memory action. Zero production disruption.
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded cursor-pointer"
          >
            Review Evidence Later
          </button>

          <button
            onClick={approveContainment}
            disabled={isExecutingContainment}
            className="px-5 py-2.5 text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer transition-all"
          >
            <Play className={`w-4 h-4 fill-current ${isExecutingContainment ? 'animate-spin' : ''}`} />
            <span>{isExecutingContainment ? 'EXECUTING CONTAINMENT...' : 'APPROVE SIMULATED CONTAINMENT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
