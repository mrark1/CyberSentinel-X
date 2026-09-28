import React from 'react';

const WORKFLOW_STEPS = [
  { id: 'observe', label: 'OBSERVE', desc: 'Telemetry Ingestion' },
  { id: 'detect', label: 'DETECT', desc: 'Rules & Anomaly' },
  { id: 'correlate', label: 'CORRELATE', desc: 'AttackDNA' },
  { id: 'understand', label: 'UNDERSTAND', desc: 'Digital Context' },
  { id: 'predict', label: 'PREDICT', desc: 'Attack Paths' },
  { id: 'simulate', label: 'SIMULATE', desc: 'Counterfactuals' },
  { id: 'contain', label: 'CONTAIN', desc: 'Safe Action' },
  { id: 'verify', label: 'VERIFY', desc: 'State Attestation' },
];

interface WorkflowIndicatorProps {
  currentStage?: string;
  className?: string;
}

export const WorkflowIndicator: React.FC<WorkflowIndicatorProps> = ({ currentStage = 'understand', className = '' }) => {
  const getStepIndex = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'observe': return 0;
      case 'detect': return 1;
      case 'correlate': return 2;
      case 'understand': return 3;
      case 'predict': return 4;
      case 'simulate': return 5;
      case 'contain': return 6;
      case 'verify': return 7;
      default: return 3;
    }
  };

  const activeIdx = getStepIndex(currentStage);

  return (
    <div className={`bg-[#0a0f1d] border border-slate-800/80 rounded-lg p-2.5 ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 mb-2 px-1">
        <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          AUTONOMOUS DEFENSE PIPELINE
        </span>
        <span>Active Stage: <strong className="text-slate-200">{WORKFLOW_STEPS[activeIdx]?.label}</strong></span>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isPassed = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div
              key={step.id}
              className={`relative px-2 py-1.5 rounded border transition-all text-center ${
                isCurrent
                  ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                  : isPassed
                  ? 'bg-slate-900/60 border-slate-700/60 text-slate-300'
                  : 'bg-slate-950/40 border-slate-800/40 text-slate-600'
              }`}
            >
              <div className="text-[10px] font-mono uppercase font-bold tracking-wider leading-none">
                {step.label}
              </div>
              <div className="text-[9px] text-slate-400 truncate mt-0.5 hidden sm:block">
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
