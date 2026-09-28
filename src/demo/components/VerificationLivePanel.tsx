/**
 * CyberSentinel X - Verification Live Panel
 * Displays large animated verification interface executing 5 cryptographic attestation checks
 * and confirms post-containment zero-attacker-state.
 */

import React from 'react';
import { CheckCircle2, ShieldCheck, Clock, Check, Sparkles } from 'lucide-react';
import { useDemoStore } from '../demoController';
import { VERIFICATION_CHECKS_LIST } from '../demoScenario';

export const VerificationLivePanel: React.FC = () => {
  const { currentPhase, verificationStepIndex } = useDemoStore();

  const isVerifying = currentPhase === 'VERIFYING';
  const isVerified = currentPhase === 'VERIFIED';

  if (!isVerifying && !isVerified) return null;

  return (
    <div className="p-4 rounded-xl bg-[#080e1e] border-2 border-emerald-500/70 shadow-[0_0_30px_rgba(16,185,129,0.25)] space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-2">
              <span>{isVerified ? '✓ CONTAINMENT VERIFIED' : isVerifying ? 'VERIFICATION IN PROGRESS' : 'VERIFICATION PENDING'}</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[9px]">
                SIMULATED VERIFICATION
              </span>
            </div>
            <h3 className="text-base font-bold font-mono text-white">
              {isVerified ? '✓ CONTAINMENT VERIFIED' : isVerifying ? 'Evaluating 5 Cryptographic Probes...' : 'Verification Pending Containment Approval'}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
              isVerified
                ? 'bg-emerald-950 text-emerald-300 border-emerald-400'
                : 'bg-amber-950 text-amber-300 border-amber-500 animate-pulse'
            }`}
          >
            {isVerified ? 'VERIFIED (5/5 PASS)' : `PROBE ${Math.min(5, verificationStepIndex + 1)} / 5`}
          </span>
        </div>
      </div>

      {/* 5 Animated Verification Checks */}
      <div className="space-y-2">
        {VERIFICATION_CHECKS_LIST.map((chk, idx) => {
          const isPassed = isVerified || (isVerifying && idx < verificationStepIndex);
          const isChecking = isVerifying && idx === verificationStepIndex;

          return (
            <div
              key={chk.id}
              className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                isPassed
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-slate-200'
                  : isChecking
                  ? 'bg-amber-950/30 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-950/40 border-slate-800/40 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    isPassed
                      ? 'bg-emerald-500 text-slate-950'
                      : isChecking
                      ? 'bg-amber-500 text-slate-950 animate-spin'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                </div>

                <div>
                  <div className="text-xs font-mono font-bold">{chk.name}</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">{chk.detail}</div>
                </div>
              </div>

              <div className="shrink-0 text-right font-mono text-[11px] font-bold">
                {isPassed ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    PASS
                  </span>
                ) : isChecking ? (
                  <span className="text-amber-400 animate-pulse">CHECKING...</span>
                ) : (
                  <span className="text-slate-600">PENDING</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Verification Box Callout (Payoff) */}
      {isVerified && (
        <div className="p-4 rounded-lg bg-emerald-950/60 border-2 border-emerald-400 space-y-3 shadow-[0_0_30px_rgba(16,185,129,0.35)] animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-1">
            <div className="text-base font-bold font-mono text-emerald-300 tracking-wide flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>✓ CONTAINMENT VERIFIED</span>
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold">
              5 / 5 checks passed · SIMULATED VERIFICATION
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded bg-slate-950/80 border border-emerald-500/40 text-xs font-mono text-center">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Risk Reduction</span>
              <strong className="text-emerald-400 font-bold">96 → 10</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Asset State</span>
              <strong className="text-emerald-400 font-bold">COMPROMISED → VERIFIED</strong>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block uppercase">Containment Status</span>
              <strong className="text-cyan-300 font-bold">ACTIVE DECOYS QUIET</strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans text-center">
            All required verification checks passed. Attacker session destroyed, database sockets severed, lateral propagation neutralized.
          </p>
        </div>
      )}
    </div>
  );
};
