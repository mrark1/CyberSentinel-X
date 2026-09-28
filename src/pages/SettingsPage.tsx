import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  Bot,
  Crosshair,
  Radio,
  CheckCircle2,
  Save,
  RotateCcw
} from 'lucide-react';
import { useSecurityStore } from '../store/useSecurityStore';
import { SystemSettings } from '../types/security';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToBaseline } = useSecurityStore();
  const [formState, setFormState] = useState<SystemSettings>({ ...settings });
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            Platform & Autonomous Policy Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure correlation thresholds, response approval boundaries, deception mesh topology, and simulation runner
          </p>
        </div>

        <button
          onClick={resetToBaseline}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Environment State</span>
        </button>
      </div>

      {savedBanner && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg flex items-center gap-2 text-xs font-mono text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Autonomous defense configurations updated and propagated across SOC telemetry workers.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Detection Sensitivity */}
        <div className="p-5 bg-[#090e1d] border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Detection & Anomaly Sensitivity
          </div>
          <p className="text-xs text-slate-400">
            Controls the statistical anomaly threshold for the AttackDNA temporal correlation engine.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {[
              { id: 'conservative', title: 'Conservative', desc: 'Minimizes false positives; triggers only on corroborated multi-signal evidence.' },
              { id: 'balanced', title: 'Balanced (Recommended)', desc: 'Standard SOC profile; optimal balance between early warning and precision.' },
              { id: 'high', title: 'High Sensitivity', desc: 'Aggressive heuristic flags; suitable for elevated threat postures and audits.' }
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  formState.detectionSensitivity === opt.id
                    ? 'bg-cyan-950/40 border-cyan-500 text-slate-100'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="detectionSensitivity"
                  value={opt.id}
                  checked={formState.detectionSensitivity === opt.id}
                  onChange={(e) => setFormState({ ...formState, detectionSensitivity: e.target.value as any })}
                  className="sr-only"
                />
                <div className="text-xs font-mono font-bold text-cyan-300">{opt.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">{opt.desc}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Sentinel AI Confidence Threshold */}
        <div className="p-5 bg-[#090e1d] border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              <Bot className="w-4 h-4 text-purple-400" />
              Sentinel AI Certainty Gate
            </div>
            <span className="text-xs font-mono font-bold text-purple-300 tabular-nums">
              {formState.aiConfidenceThreshold}%
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Defines the minimum evidence certainty required before Sentinel AI promotes a hypothesis from INFERRED to an approved DEFENSIVE PLAYBOOK.
          </p>
          <input
            type="range"
            min={50}
            max={99}
            value={formState.aiConfidenceThreshold}
            onChange={(e) => setFormState({ ...formState, aiConfidenceThreshold: Number(e.target.value) })}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Response Approval Mode */}
        <div className="p-5 bg-[#090e1d] border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-emerald-400" />
            Response Authorization Mode
          </div>
          <p className="text-xs text-slate-400">
            Enforces policy boundaries on whether containment actions can be autonomously triggered or require human authorization.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {[
              { id: 'human_in_the_loop', title: 'Human-in-the-Loop', desc: 'Strict mode: Every response requires explicit operator approval before simulation/execution.' },
              { id: 'autonomous_low_risk', title: 'Autonomous Low-Risk', desc: 'Low operational-impact actions (e.g. session revocation) execute automatically; endpoint isolation requires approval.' },
              { id: 'semi_autonomous', title: 'Semi-Autonomous', desc: 'Deception-confirmed incidents execute recommended defensive containment with 60s rollback window.' }
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  formState.responseApprovalMode === opt.id
                    ? 'bg-emerald-950/40 border-emerald-500 text-slate-100'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="responseApprovalMode"
                  value={opt.id}
                  checked={formState.responseApprovalMode === opt.id}
                  onChange={(e) => setFormState({ ...formState, responseApprovalMode: e.target.value as any })}
                  className="sr-only"
                />
                <div className="text-xs font-mono font-bold text-emerald-300">{opt.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">{opt.desc}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Demo Mode Configuration */}
        <div className="p-5 bg-[#090e1d] border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            <Radio className="w-4 h-4 text-cyan-400" />
            Attack Simulation Speed & Telemetry
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Simulation Step Interval</span>
                <span className="text-cyan-300 font-bold">{formState.demoSpeedMs} ms</span>
              </div>
              <input
                type="range"
                min={600}
                max={3000}
                step={200}
                value={formState.demoSpeedMs}
                onChange={(e) => setFormState({ ...formState, demoSpeedMs: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-200">Live Synthetic Telemetry Stream</div>
                <div className="text-[11px] text-slate-400">Stream background network and auth events</div>
              </div>
              <input
                type="checkbox"
                checked={formState.telemetryStreamEnabled}
                onChange={(e) => setFormState({ ...formState, telemetryStreamEnabled: e.target.checked })}
                className="accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-950/40 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
