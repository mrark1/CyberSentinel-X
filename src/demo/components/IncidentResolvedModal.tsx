/**
 * CyberSentinel X - Incident Resolved Summary Modal
 * Concludes the end-to-end hackathon demonstration scenario with full metrics,
 * duration calculation, verification attestation, and navigation options.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  RotateCcw,
  History,
  FileText,
  ShieldCheck,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useDemoStore } from '../demoController';

export const IncidentResolvedModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    showIncidentResolvedModal,
    dismissResolvedModal,
    resetDemo,
    startDemo
  } = useDemoStore();

  if (!showIncidentResolvedModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#090f1f] border-2 border-emerald-500 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(16,185,129,0.35)] relative space-y-5">
        <button
          onClick={dismissResolvedModal}
          className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Badge */}
        <div className="text-center space-y-2 border-b border-emerald-950 pb-4">
          <div className="inline-flex p-3 rounded-full bg-emerald-950 border border-emerald-400/60 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
            SIMULATED VERIFICATION ENGINE
          </div>

          <h2 className="text-2xl font-bold font-mono text-emerald-300 tracking-wide flex items-center justify-center gap-2">
            <span>✓ CONTAINMENT VERIFIED</span>
          </h2>

          <div className="text-sm font-mono text-emerald-400 font-bold">
            5 / 5 verification checks passed
          </div>

          <p className="text-xs text-slate-300 font-sans">
            SIMULATED CONTAINMENT COMPLETE. Host sessions terminated, database connections severed, lateral progression stopped.
          </p>
        </div>

        {/* Dominant Metrics Matrix (Requirement 11) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 font-mono text-center">
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Peak Risk</span>
            <strong className="text-lg text-red-400 font-bold">96</strong>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Residual Risk</span>
            <strong className="text-lg text-emerald-400 font-bold">10</strong>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Affected Assets</span>
            <strong className="text-lg text-cyan-300 font-bold">2</strong>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Evidence</span>
            <strong className="text-lg text-purple-300 font-bold">14</strong>
          </div>
        </div>

        {/* 4 Action Buttons (Requirement 11) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => {
              dismissResolvedModal();
              navigate('/incidents/INC-2026-0042');
            }}
            className="px-2.5 py-2 text-xs font-mono font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>VIEW INCIDENT</span>
          </button>

          <button
            onClick={() => {
              dismissResolvedModal();
              navigate('/attack-replay');
            }}
            className="px-2.5 py-2 text-xs font-mono font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>REPLAY ATTACK</span>
          </button>

          <button
            onClick={() => {
              dismissResolvedModal();
              navigate('/reports');
            }}
            className="px-2.5 py-2 text-xs font-mono font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>GENERATE REPORT</span>
          </button>

          <button
            onClick={() => {
              resetDemo();
            }}
            className="px-2.5 py-2 text-xs font-mono font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEMO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
