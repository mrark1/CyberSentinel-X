import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  FileCode,
  Server
} from 'lucide-react';
import { useSecurityStore } from '../store/useSecurityStore';
import { replayEventsSequence } from '../mock/seedData';
import { AttackGraphFlow } from '../components/attackGraph/AttackGraphFlow';
import { ThreatLevelBadge } from '../components/common/Badges';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const AttackReplayPage: React.FC = () => {
  const {
    replayStepIndex,
    isReplayPlaying,
    setReplayStep,
    nextReplayStep,
    prevReplayStep,
    playReplay,
    pauseReplay,
    resetReplay
  } = useSecurityStore();

  const currentEvent = replayEventsSequence[replayStepIndex];

  return (
    <div className="space-y-4 max-w-[1900px] mx-auto h-[calc(100vh-5.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Attack Replay & Chronological Reconstruction
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized timeline replay reconstructing propagation vectors, canary triggers, containment, and state verification
          </p>
        </div>

        {/* Current State Summary Pill */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <ThreatLevelBadge level={currentEvent.systemState.threatLevel} />
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Risk: <strong className="text-red-400">{currentEvent.systemState.riskScore}/100</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Certainty: <strong className="text-cyan-400">{currentEvent.systemState.confidence}%</strong>
          </div>
        </div>
      </div>

      {/* Main Area: Controls Strip + AttackDNA Canvas + Current Step Details */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Playback Controls & Timeline Steps (4 cols) */}
        <div className="lg:col-span-4 bg-[#080d1a] border border-slate-800 rounded-lg p-4 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            {/* Playback Transport Buttons: PLAY, PAUSE, RESTART, NEXT, PREVIOUS */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <button
                  onClick={prevReplayStep}
                  disabled={replayStepIndex === 0}
                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  title="PREVIOUS"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span>PREVIOUS</span>
                </button>

                {isReplayPlaying ? (
                  <button
                    onClick={pauseReplay}
                    className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold cursor-pointer flex items-center gap-1"
                    title="PAUSE"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>PAUSE</span>
                  </button>
                ) : (
                  <button
                    onClick={playReplay}
                    className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer flex items-center gap-1"
                    title="PLAY"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PLAY</span>
                  </button>
                )}

                <button
                  onClick={nextReplayStep}
                  disabled={replayStepIndex === replayEventsSequence.length - 1}
                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  title="NEXT"
                >
                  <span>NEXT</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={resetReplay}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 cursor-pointer"
                title="RESTART"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>RESTART</span>
              </button>
            </div>

            {/* Timeline Scrubber Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                <span>Timeline Scrubber</span>
                <span className="text-cyan-400 font-bold">
                  Step {replayStepIndex + 1} of {replayEventsSequence.length}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={replayEventsSequence.length - 1}
                value={replayStepIndex}
                onChange={(e) => setReplayStep(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Current Step Card Highlight: Shows timeline, current stage, event, affected asset, attack graph position */}
            <div className="p-3.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-cyan-400 font-bold">Timeline: T+{currentEvent.timestamp}</span>
                <span className="text-slate-400 uppercase font-semibold">Stage {currentEvent.step}/10</span>
              </div>

              <div className="text-sm font-bold text-slate-100">
                {currentEvent.title}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2 rounded bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-400">Event: </span>
                  <span className="text-cyan-300">{currentEvent.eventType}</span>
                </div>
                <div>
                  <span className="text-slate-400">Affected Asset: </span>
                  <span className="text-amber-300 truncate">{currentEvent.affectedAsset}</span>
                </div>
                <div>
                  <span className="text-slate-400">Graph Vector: </span>
                  <span className="text-purple-300 font-bold">{currentEvent.activeNodeId}</span>
                </div>
                <div>
                  <span className="text-slate-400">Verification: </span>
                  <span className={currentEvent.systemState.verificationState === 'VERIFIED' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {currentEvent.systemState.verificationState}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentEvent.description}
              </p>

              {currentEvent.evidenceTriggered && (
                <div className="text-[11px] font-mono text-purple-300 flex items-center gap-1.5 pt-1 border-t border-slate-800">
                  <FileCode className="w-3.5 h-3.5 text-purple-400" />
                  <span>Evidence Artifact: {currentEvent.evidenceTriggered}</span>
                </div>
              )}
            </div>

            {/* Step Sequence List */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                10-Stage Replay Sequence
              </div>
              <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                {replayEventsSequence.map((ev, idx) => {
                  const isCurrent = idx === replayStepIndex;
                  const isPast = idx < replayStepIndex;
                  return (
                    <button
                      key={ev.step}
                      onClick={() => setReplayStep(idx)}
                      className={`w-full text-left p-2 rounded text-xs transition-all flex items-center justify-between border cursor-pointer ${
                        isCurrent
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                          : isPast
                          ? 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-900'
                          : 'bg-slate-950/40 border-slate-900 text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] shrink-0 font-bold">
                          {ev.step}.
                        </span>
                        <span className="truncate">{ev.title}</span>
                      </div>
                      <span className="text-[10px] font-mono shrink-0 ml-2 text-slate-400">
                        {ev.timestamp}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Animated Attack Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-[#070b14] border border-slate-800 rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 bg-[#080d19] border-b border-slate-800 flex items-center justify-between shrink-0 text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Synchronized AttackDNA Flow — Active Position:
              <span className="text-cyan-400 uppercase font-bold">{currentEvent.activeNodeId}</span>
            </span>

            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
              currentEvent.systemState.verificationState === 'VERIFIED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}>
              {currentEvent.systemState.verificationState}
            </span>
          </div>

          <div className="flex-1 w-full h-full min-h-[400px]">
            <ErrorBoundary componentName="AttackDNA Replay Canvas">
              <AttackGraphFlow
                interactive={true}
                activeNodeOverride={currentEvent.activeNodeId}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};
