/**
 * CyberSentinel X - Deception Moment Callout
 * Prominently alerts the operator when synthetic honeytoken / canary trap is tripped,
 * boosting threat confidence to 97%.
 */

import React from 'react';
import { Crosshair, ShieldAlert, Sparkles, X, ArrowRight } from 'lucide-react';
import { useDemoStore } from '../demoController';
import { DECEPTION_CALLOUT_DATA } from '../demoScenario';

export const DeceptionCalloutModal: React.FC = () => {
  const { showDeceptionAlert, dismissDeceptionAlert, jumpToStep } = useDemoStore();

  if (!showDeceptionAlert) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b0a1a] border-2 border-purple-500 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(168,85,247,0.35)] relative space-y-5">
        <button
          onClick={dismissDeceptionAlert}
          className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Callout Box */}
        <div className="text-center space-y-2 border-b border-purple-900/50 pb-4">
          <div className="inline-flex p-3 rounded-full bg-purple-950/80 border border-purple-400/60 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-pulse">
            <Crosshair className="w-8 h-8 text-purple-400" />
          </div>

          <div className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">
            DECEPTION SIGNAL CONFIRMED
          </div>

          <h2 className="text-xl font-bold font-mono text-white tracking-wide">
            🍯 DECEPTION TRIGGERED
          </h2>

          <p className="text-xs text-slate-300 font-sans">
            Access detected against zero-business-traffic decoy trap asset. Conclusive evidence of active adversary lateral exploration.
          </p>
        </div>

        {/* Callout Info Matrix */}
        <div className="bg-purple-950/40 border border-purple-800/60 rounded-lg p-4 space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Honeytoken:</span>
            <span className="text-purple-300 font-bold">{DECEPTION_CALLOUT_DATA.honeytokenName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Target Asset:</span>
            <span className="text-slate-200 font-semibold">{DECEPTION_CALLOUT_DATA.targetAsset}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Evidence ID:</span>
            <span className="text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              {DECEPTION_CALLOUT_DATA.evidenceId}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Confidence Contribution:</span>
            <span className="text-emerald-400 font-bold">97% (+12% Certainty Boost)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Adversary Principal:</span>
            <span className="text-amber-300">{DECEPTION_CALLOUT_DATA.actor}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-purple-900/40 text-[11px]">
            <span className="text-slate-500">Timestamp:</span>
            <span className="text-slate-400">{DECEPTION_CALLOUT_DATA.timestamp}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={dismissDeceptionAlert}
            className="px-4 py-2 text-xs font-mono text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded cursor-pointer"
          >
            Acknowledge Trap
          </button>

          <button
            onClick={() => {
              dismissDeceptionAlert();
              jumpToStep(9); // Jump to Sentinel AI Analysis Ready
            }}
            className="px-4 py-2 text-xs font-mono font-bold text-white bg-purple-600 hover:bg-purple-500 rounded flex items-center gap-1.5 shadow-lg shadow-purple-900/50 cursor-pointer transition-all"
          >
            <span>Review Sentinel AI Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
