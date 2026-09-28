/**
 * CyberSentinel X - Persistent Demo Progress Bar & Controller
 * Visualizes the 8-stage autonomous defense pipeline (OBSERVE -> VERIFY)
 * with checkmarks, step counter, persistent synthetic environment badge, and playback controls.
 */

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Check,
  ShieldAlert,
  Radio,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { useDemoStore } from '../demoController';
import { DEMO_SCENARIO_STEPS } from '../demoScenario';
import { DefenseWorkflowStage } from '../demoState';

const DEFENSE_PIPELINE_STAGES: Array<{ id: DefenseWorkflowStage; label: string; desc: string }> = [
  { id: 'OBSERVE', label: 'OBSERVE', desc: 'Telemetry' },
  { id: 'DETECT', label: 'DETECT', desc: 'Anomalies' },
  { id: 'CORRELATE', label: 'CORRELATE', desc: 'AttackDNA' },
  { id: 'UNDERSTAND', label: 'UNDERSTAND', desc: 'Twin Context' },
  { id: 'PREDICT', label: 'PREDICT', desc: 'Next Steps' },
  { id: 'SIMULATE', label: 'SIMULATE', desc: 'Counterfactuals' },
  { id: 'CONTAIN', label: 'CONTAIN', desc: 'Safe Action' },
  { id: 'VERIFY', label: 'VERIFY', desc: 'Attestation' }
];

export const DemoProgressBar: React.FC = () => {
  const {
    currentPhase,
    currentStepIndex,
    isPlaying,
    workflowStage,
    startDemo,
    pauseDemo,
    resumeDemo,
    nextStep,
    prevStep,
    resetDemo,
    openResponseModal,
    openResolvedModal
  } = useDemoStore();

  const stepDef = DEMO_SCENARIO_STEPS[currentStepIndex];

  const getStageIndex = (stage: DefenseWorkflowStage): number => {
    return DEFENSE_PIPELINE_STAGES.findIndex((s) => s.id === stage);
  };

  const activeStageIdx = getStageIndex(workflowStage);

  return (
    <div className="bg-[#070b16] border-b border-cyan-950/80 px-4 py-2 select-none shrink-0 shadow-lg">
      <div className="max-w-[1900px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left: Demo Label, Tooltip & Current Step Indicator */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          {/* Persistent Synthetic Environment Badge (Requirement 16) */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-[10px] font-mono text-purple-300 font-bold group relative cursor-help"
            title="DEMO MODE · SYNTHETIC ENVIRONMENT: All telemetry, attacks, responses, and verification checks are simulated."
          >
            <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
            <span>DEMO MODE</span>
            <span className="text-slate-400 font-normal">· SYNTHETIC ENVIRONMENT</span>
            <Info className="w-3 h-3 text-slate-400 ml-0.5" />

            {/* Hover Tooltip */}
            <div className="absolute left-0 top-full mt-1.5 hidden group-hover:block w-80 p-3 bg-slate-900 border border-slate-700 rounded text-[11px] font-sans text-slate-200 z-50 shadow-xl leading-relaxed">
              <div className="font-bold text-cyan-300 font-mono mb-1.5">SYNTHETIC DEFENSE SANDBOX</div>
              <ul className="space-y-1 list-disc list-inside text-slate-300 text-[10.5px]">
                <li>Telemetry is synthetic</li>
                <li>Attack activity is simulated</li>
                <li>Response actions are simulated</li>
                <li>Verification is simulated</li>
                <li>No real infrastructure is affected</li>
              </ul>
            </div>
          </div>

          {/* Current Step Description & Timestamp */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Step {currentStepIndex}/13:</span>
            <span className="text-slate-100 font-semibold truncate max-w-[260px] xl:max-w-md">
              {stepDef.title}
            </span>
            <span className="text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40 text-[10px]">
              {stepDef.timestamp}
            </span>
          </div>
        </div>

        {/* Center: 8-Stage Autonomous Defense Pipeline (Requirement 3) */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
          {DEFENSE_PIPELINE_STAGES.map((stage, idx) => {
            const isPassed = idx < activeStageIdx || (currentPhase === 'VERIFIED' && idx <= activeStageIdx);
            const isCurrent = idx === activeStageIdx && currentPhase !== 'VERIFIED';

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono tracking-wider transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
                    : isPassed
                    ? 'bg-emerald-950/50 border border-emerald-600/40 text-emerald-300'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-500'
                }`}
              >
                {isPassed ? (
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                )}
                <span className="font-bold">{stage.label}</span>
              </div>
            );
          })}
        </div>

        {/* Right: Demo Playback Controls & Decision Points */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Contextual Action: Decision Point or Resolved */}
          {currentPhase === 'ANALYSIS_READY' && (
            <button
              onClick={openResponseModal}
              className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.4)] cursor-pointer animate-pulse"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>DECISION REQUIRED</span>
            </button>
          )}

          {currentPhase === 'VERIFIED' && (
            <button
              onClick={openResolvedModal}
              className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer"
            >
              <span>VIEW RESOLUTION</span>
            </button>
          )}

          {/* Previous Step */}
          <button
            onClick={prevStep}
            disabled={currentStepIndex <= 0}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Previous Scenario Step"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Play / Pause / Start */}
          {currentStepIndex === 0 || currentPhase === 'VERIFIED' ? (
            <button
              onClick={startDemo}
              className="px-3 py-1 text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-500 rounded flex items-center gap-1.5 shadow-md shadow-red-950/60 cursor-pointer transition-all"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>START DEMO</span>
            </button>
          ) : isPlaying ? (
            <button
              onClick={pauseDemo}
              className="px-3 py-1 text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded flex items-center gap-1.5 shadow-md shadow-amber-950/60 cursor-pointer transition-all"
            >
              <Pause className="w-3 h-3 fill-current" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              onClick={resumeDemo}
              className="px-3 py-1 text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded flex items-center gap-1.5 shadow-md shadow-cyan-950/60 cursor-pointer transition-all"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>RESUME</span>
            </button>
          )}

          {/* Next Step */}
          <button
            onClick={nextStep}
            disabled={currentStepIndex >= DEMO_SCENARIO_STEPS.length - 1}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Next Scenario Step"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Reset Demo */}
          <button
            onClick={resetDemo}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
            title="Reset Scenario to Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
