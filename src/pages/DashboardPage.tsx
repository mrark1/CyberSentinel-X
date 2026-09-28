import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Server,
  ArrowRight,
  CheckCircle2,
  FileCode,
  Sparkles,
  Radio,
  Flame,
  Clock,
  Layers,
  ShieldCheck,
  Play,
  RotateCcw,
  History,
  FileText,
  GitFork,
  Network
} from 'lucide-react';
import { useSecurityStore } from '../store/useSecurityStore';
import { useDemoStore } from '../demo/demoController';
import { SeverityBadge, StatusBadge, ThreatLevelBadge } from '../components/common/Badges';
import { AttackGraphFlow } from '../components/attackGraph/AttackGraphFlow';
import { SentinelAIPanel } from '../components/sentinelAI/SentinelAIPanel';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    incidents,
    events,
    assets,
    threatLevel,
    setSelectedIncidentId,
    simulation,
    startLiveAttackSimulation,
    executeSimulatedAction
  } = useSecurityStore();

  const { currentPhase, resetDemo } = useDemoStore();

  const flagship = incidents.find((i) => i.id === 'INC-2026-0042') || incidents[0];
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'false_positive');
  const recentEvents = events.slice(0, 6);
  const isContained = Boolean(flagship.containmentStatus?.isContained) || currentPhase === 'VERIFIED';
  const verificationState = currentPhase === 'VERIFIED' ? 'VERIFIED' : (flagship.containmentStatus?.verificationState || 'NOT_VERIFIED');

  return (
    <div className="space-y-4 max-w-[1900px] mx-auto">
      {/* ============================================================ */}
      {/* FINAL STATE PAYOFF: DOMINANT VERIFICATION BANNER (Requirement 11) */}
      {/* ============================================================ */}
      {verificationState === 'VERIFIED' && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/80 via-[#0a1424] to-cyan-950/80 border-2 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)] space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold font-mono text-emerald-300 tracking-wide flex items-center gap-2">
                  <span>✓ CONTAINMENT VERIFIED</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/80 border border-emerald-400 text-emerald-200 uppercase font-mono">
                    SIMULATED VERIFICATION
                  </span>
                </div>
                <div className="text-sm font-mono text-emerald-400 font-bold mt-0.5">
                  5 / 5 verification checks passed
                </div>
              </div>
            </div>

            {/* Metrics: Peak Risk 96, Residual Risk 10, Affected Assets 2, Evidence 14 (Requirement 11) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
              <div className="px-3 py-1.5 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Peak Risk</span>
                <strong className="text-base text-red-400 font-bold">96</strong>
              </div>
              <div className="px-3 py-1.5 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Residual Risk</span>
                <strong className="text-base text-emerald-400 font-bold">10</strong>
              </div>
              <div className="px-3 py-1.5 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Affected Assets</span>
                <strong className="text-base text-cyan-300 font-bold">2</strong>
              </div>
              <div className="px-3 py-1.5 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Evidence</span>
                <strong className="text-base text-purple-300 font-bold">14</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons: VIEW INCIDENT, REPLAY ATTACK, GENERATE REPORT, RESET DEMO */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              onClick={() => navigate('/incidents/INC-2026-0042')}
              className="px-3 py-1.5 text-xs font-mono font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>VIEW INCIDENT</span>
            </button>
            <button
              onClick={() => navigate('/attack-replay')}
              className="px-3 py-1.5 text-xs font-mono font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>REPLAY ATTACK</span>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="px-3 py-1.5 text-xs font-mono font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>GENERATE REPORT</span>
            </button>
            <button
              onClick={resetDemo}
              className="px-3 py-1.5 text-xs font-mono font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET DEMO</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FIRST 10 SECONDS: WHAT IS CYBERSENTINEL X / THE 5 PILLARS */}
      {/* ============================================================ */}
      <div className="bg-[#080d1a] border border-cyan-900/60 rounded-lg p-3.5 shadow-xl space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-mono font-bold shadow-md shadow-cyan-950/60 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white font-mono">
                  CYBERSENTINEL <span className="text-cyan-400">X</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold uppercase tracking-wider">
                  Evidence-First Cyber Defense
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                Autonomous SOC fusing graph correlation, twin blast radius modeling, and provable containment verification.
              </p>
            </div>
          </div>

          {/* The 5 Visually Obvious Pillars (Requirement 1) */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <span className="px-2 py-1 rounded bg-slate-900/90 border border-cyan-800/60 text-cyan-300 font-bold flex items-center gap-1" title="Correlates fragmented telemetry into unified causal attack graphs">
              <GitFork className="w-3 h-3 text-cyan-400" /> AttackDNA
            </span>
            <span className="px-2 py-1 rounded bg-slate-900/90 border border-blue-800/60 text-blue-300 font-bold flex items-center gap-1" title="Digital twin environment projecting attack radius & dependencies">
              <Network className="w-3 h-3 text-blue-400" /> CyberTwin
            </span>
            <span className="px-2 py-1 rounded bg-slate-900/90 border border-amber-800/60 text-amber-300 font-bold flex items-center gap-1" title="Simulates defense actions before taking production systems offline">
              <ShieldAlert className="w-3 h-3 text-amber-400" /> Counterfactual Defense
            </span>
            <span className="px-2 py-1 rounded bg-slate-900/90 border border-purple-800/60 text-purple-300 font-bold flex items-center gap-1" title="Advisory evidence-grounded AI analyst bounded by cryptographic facts">
              <Sparkles className="w-3 h-3 text-purple-400" /> Sentinel AI
            </span>
            <span className="px-2 py-1 rounded bg-slate-900/90 border border-emerald-800/60 text-emerald-300 font-bold flex items-center gap-1" title="Automated verification proving zero residual adversary state">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verification
            </span>
          </div>
        </div>

        {/* Primary Story Pipeline (Requirement 2) */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 overflow-x-auto py-0.5 gap-1">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-slate-400">Fragmented telemetry</span>
          </div>
          <span className="text-slate-600 shrink-0">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-cyan-400 font-bold">Attack correlation</span>
          </div>
          <span className="text-slate-600 shrink-0">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-200 font-bold">Attack story</span>
          </div>
          <span className="text-slate-600 shrink-0">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-amber-400 font-bold">Potential blast radius</span>
          </div>
          <span className="text-slate-600 shrink-0">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-purple-300 font-bold">Evidence analysis</span>
          </div>
          <span className="text-slate-600 shrink-0">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-cyan-300 font-bold">Response simulation</span>
          </div>
          <span className="text-slate-600 shrink-0">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-emerald-400 font-bold">Containment</span>
          </div>
          <span className="text-slate-600 shrink-0">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-emerald-300 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verification
            </span>
          </div>
        </div>
      </div>
      {/* ============================================================ */}
      {/* TOP BAR / SITUATIONAL AWARENESS: WHAT IS HAPPENING / WHY IT MATTERS */}
      {/* ============================================================ */}
      <div className="bg-[#090e1d] border border-slate-800 rounded-lg p-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
          {/* Question 1: WHAT IS HAPPENING? */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              WHAT IS HAPPENING?
            </div>
            <div className="text-xs font-semibold text-slate-100 leading-snug">
              Targeted Credential Compromise & Reconnaissance
            </div>
            <div className="text-[11px] text-slate-400 font-mono leading-tight">
              Tor Exit Node (AS9009) accessing DBA session
            </div>
          </div>

          {/* Question 2: WHY DOES IT MATTER? */}
          <div className="space-y-1 md:pl-4 pt-2 md:pt-0">
            <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              WHY DOES IT MATTER?
            </div>
            <div className="text-xs font-semibold text-slate-100 leading-snug">
              Unsanctioned Customer PII Database Query
            </div>
            <div className="text-[11px] text-slate-400 font-mono leading-tight">
              Bypassed MFA step-up; honeytoken tripped
            </div>
          </div>

          {/* Question 3: WHAT IS AT RISK? */}
          <div className="space-y-1 md:pl-4 pt-2 md:pt-0">
            <div className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-red-400" />
              WHAT IS AT RISK?
            </div>
            <div className="text-xs font-semibold text-slate-100 leading-snug">
              db-customer-aurora-primary & IAM Secrets
            </div>
            <div className="text-[11px] text-slate-400 font-mono leading-tight">
              50,000 sensitive records in scope
            </div>
          </div>

          {/* Question 4: WHAT SHOULD THE OPERATOR DO? */}
          <div className="space-y-1.5 md:pl-4 pt-2 md:pt-0 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                WHAT SHOULD OPERATOR DO?
              </div>
              <div className="text-xs font-semibold text-slate-100">
                Execute Session Revocation Containment
              </div>
            </div>

            <button
              onClick={() => executeSimulatedAction(flagship.id, 'act-01')}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-[11px] uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isContained ? 'RE-VERIFY CONTAINMENT' : 'SIMULATE CONTAINMENT'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN SECTION: LEFT (Incidents) | CENTER (AttackDNA Centerpiece) | RIGHT (Sentinel AI) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: ACTIVE INCIDENTS (3 cols) */}
        <div className="lg:col-span-3 bg-[#080d1a] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Active Incidents ({activeIncidents.length})
              </span>
              <Link to="/incidents" className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300">
                Register →
              </Link>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {activeIncidents.map((inc) => {
                const isSelected = inc.id === flagship.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-2.5 rounded border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-cyan-400 font-bold">{inc.id}</span>
                      <SeverityBadge severity={inc.severity} />
                    </div>
                    <div className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2">
                      {inc.title}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-1 border-t border-slate-800/60">
                      <span>Risk: <strong className="text-red-400">{inc.riskScore}</strong></span>
                      <span>Certainty: <strong className="text-cyan-300">{inc.confidence}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Correlation Engine:</span>
            <span className="text-emerald-400 font-bold">ATTACKDNA SYNCED</span>
          </div>
        </div>

        {/* CENTER COLUMN: ATTACKDNA ATTACK STORY CENTERPIECE (6 cols) */}
        <div className="lg:col-span-6 bg-[#070b14] border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-2xl">
          <div className="p-3 bg-[#080d19] border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-red-950 text-red-400 border border-red-500/40">
                <Flame className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                AttackDNA Active Attack Story (Centerpiece)
              </span>
            </div>
            <Link
              to={`/incidents/${flagship.id}`}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Full Investigation</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 w-full min-h-[460px] relative">
            <ErrorBoundary componentName="AttackDNA Visualization">
              <AttackGraphFlow interactive={true} />
            </ErrorBoundary>
          </div>
        </div>

        {/* RIGHT COLUMN: SENTINEL AI ASSESSMENT (3 cols) */}
        <div className="lg:col-span-3 min-h-[500px]">
          <ErrorBoundary componentName="Sentinel AI Security Analyst">
            <SentinelAIPanel
              analysis={flagship.aiAnalysis}
              evidenceList={flagship.evidence}
              incidentId={flagship.id}
              onSimulateResponse={() => executeSimulatedAction(flagship.id, 'act-01')}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM SECTION: Live Telemetry | Attack Path | Response State | Verification State */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Live Telemetry Stream */}
        <div className="bg-[#090e1d] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Live Telemetry
            </span>
            <span className="text-[10px] text-cyan-400">142 ev/min</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[10px]">
            {recentEvents.map((e) => (
              <div key={e.id} className="p-1.5 rounded bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 mr-1.5 font-bold">{e.type}</span>
                  <span className="text-slate-300 truncate max-w-[130px]">{e.actor}</span>
                </div>
                <span className="text-purple-300">{e.evidenceRefId || 'Telemetry'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Attack Path Breakdown */}
        <div className="bg-[#090e1d] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Attack Path Vector
            </span>
            <span className="text-[10px] text-amber-400">6 Stages</span>
          </div>

          <div className="text-[11px] font-mono space-y-1 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400">1.</span>
              <span>185.220.101.44 (Tor ASN AS9009)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400">2.</span>
              <span>IdP Okta Bypass (m.ross@sentinel.corp)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400">3.</span>
              <span>ROLE_DATA_RECOVERY_OFFICER Escalation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-red-400">4.</span>
              <span className="text-red-300 font-bold">db-customer-aurora-primary (PII Query)</span>
            </div>
          </div>
        </div>

        {/* 3. Response State */}
        <div className="bg-[#090e1d] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Response State
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold uppercase ${
              isContained
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-950 text-amber-300 border-amber-500/40'
            }`}>
              {isContained ? 'Executed' : 'Simulating'}
            </span>
          </div>

          <div className="text-xs space-y-1">
            <div className="font-semibold text-slate-200">
              {flagship.containmentStatus?.executedAction || 'Revoke User Session & Invalidate Tokens'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Policy: Automated Low-Risk Approval
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">
              Security Benefit: +94% Threat Reduction
            </div>
          </div>
        </div>

        {/* 4. Verification State */}
        <div className="bg-[#090e1d] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Verification State
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
              verificationState === 'VERIFIED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                : verificationState === 'CHECKING'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 animate-pulse'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}>
              {verificationState === 'VERIFIED' ? '✓ VERIFIED' : verificationState === 'CHECKING' ? 'CHECKING...' : '● NOT VERIFIED'}
            </span>
          </div>

          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Session Invalidated:</span>
              <span className={verificationState === 'VERIFIED' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {verificationState === 'VERIFIED' ? '✓ PASS' : 'PENDING'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">DB Connection Closed:</span>
              <span className={verificationState === 'VERIFIED' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {verificationState === 'VERIFIED' ? '✓ 0 Sockets' : 'PENDING'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Decoy Access Halted:</span>
              <span className={verificationState === 'VERIFIED' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {verificationState === 'VERIFIED' ? '✓ PASS' : 'PENDING'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
