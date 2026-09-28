import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  Server,
  FileCode,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  GitFork,
  SlidersHorizontal,
  Compass,
  FileText
} from 'lucide-react';
import { useSecurityStore } from '../store/useSecurityStore';
import { SeverityBadge, StatusBadge } from '../components/common/Badges';
import { AttackGraphFlow } from '../components/attackGraph/AttackGraphFlow';
import { SentinelAIPanel } from '../components/sentinelAI/SentinelAIPanel';
import { CounterfactualSimulator } from '../components/simulation/CounterfactualSimulator';
import { VerificationLivePanel } from '../demo/components/VerificationLivePanel';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useDemoStore } from '../demo/demoController';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    incidents,
    getIncident,
    executeSimulatedAction,
    startLiveAttackSimulation,
    simulation
  } = useSecurityStore();
  const { currentPhase } = useDemoStore();

  const incidentId = id || 'INC-2026-0042';
  const incident = getIncident(incidentId) || incidents[0];

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTACK_DNA' | 'EVIDENCE' | 'ATTACK_PATH' | 'RESPONSE' | 'VERIFICATION'>('OVERVIEW');

  const isContained = Boolean(incident.containmentStatus?.isContained);
  const verificationState = incident.containmentStatus?.verificationState || 'NOT_VERIFIED';

  return (
    <div className="space-y-4 max-w-[1900px] mx-auto min-h-[calc(100vh-5.5rem)] flex flex-col">
      {/* ============================================================ */}
      {/* HEADER: ID, TITLE, SEVERITY, RISK, CONFIDENCE, FIRST/LAST, ASSETS, EVIDENCE */}
      {/* ============================================================ */}
      <div className="bg-[#090e1d] border border-slate-800 rounded-lg p-4 shadow-xl shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <Link
              to="/incidents"
              className="p-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors mt-0.5"
              title="Return to incidents"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm font-mono font-bold text-cyan-400">
                  {incident.id}
                </span>
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  verificationState === 'VERIFIED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    : verificationState === 'CHECKING'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 animate-pulse'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {verificationState === 'VERIFIED' ? '✓ VERIFIED' : verificationState === 'CHECKING' ? 'CHECKING...' : '● NOT VERIFIED'}
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-100 mt-1">
                {incident.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/attack-replay"
              className="px-3 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Attack Replay</span>
            </Link>

            <button
              onClick={() => executeSimulatedAction(incident.id, 'act-01')}
              disabled={isContained || verificationState === 'VERIFIED'}
              className="px-3.5 py-1.5 text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/40"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isContained ? 'Containment Applied' : 'Simulate Containment'}</span>
            </button>
          </div>
        </div>

        {/* Header Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-3 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Risk Score</div>
            <div className="text-base font-bold text-red-400 tabular-nums">
              {incident.riskScore}/100
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase">Confidence</div>
            <div className="text-base font-bold text-cyan-300 tabular-nums">
              {incident.confidence}%
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase">First Seen</div>
            <div className="text-xs font-semibold text-slate-200">
              {incident.firstSeen}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase">Last Seen</div>
            <div className="text-xs font-semibold text-slate-200">
              {incident.lastSeen}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase">Affected Assets</div>
            <div className="text-xs font-semibold text-slate-200 truncate">
              {incident.affectedAssets.length} nodes
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase">Evidence Count</div>
            <div className="text-xs font-semibold text-purple-300">
              {incident.evidence.length || incident.evidenceCount} artifacts
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* NAVIGATION TABS: OVERVIEW | ATTACK DNA | EVIDENCE | ATTACK PATH | RESPONSE | VERIFICATION */}
      {/* ============================================================ */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-1 text-xs font-mono">
        {[
          { id: 'OVERVIEW', label: 'OVERVIEW' },
          { id: 'ATTACK_DNA', label: 'ATTACK DNA' },
          { id: 'EVIDENCE', label: `EVIDENCE (${incident.evidence.length || incident.evidenceCount})` },
          { id: 'ATTACK_PATH', label: 'ATTACK PATH' },
          { id: 'RESPONSE', label: 'RESPONSE SIMULATOR' },
          { id: 'VERIFICATION', label: 'VERIFICATION ATTESTATION' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 font-bold uppercase tracking-wider rounded-t transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-cyan-300 border-b-2 border-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Verification Live Panel (Automatically displayed during verification/verified phase) */}
      {(currentPhase === 'VERIFYING' || currentPhase === 'VERIFIED') && activeTab !== 'VERIFICATION' && (
        <div className="shrink-0 animate-in fade-in slide-in-from-top-2 duration-300">
          <ErrorBoundary componentName="Live Verification Attestation Banner">
            <VerificationLivePanel />
          </ErrorBoundary>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB CONTENT PANELS */}
      {/* ============================================================ */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT: Timeline & Affected Assets (3 cols) */}
          <div className="lg:col-span-3 space-y-4 bg-[#080d1a] border border-slate-800 rounded-lg p-4">
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-cyan-400">
                Affected Infrastructure
              </div>
              <div className="space-y-1">
                {incident.affectedAssets.map((ast) => (
                  <div key={ast} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
                    <span className="truncate max-w-[180px]">{ast}</span>
                    <span className="text-[10px] text-red-400 uppercase font-bold">TARGET</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Chronological Attack Timeline
              </div>
              <div className="space-y-2 border-l-2 border-slate-800 pl-3">
                {incident.timeline.map((evt) => (
                  <div key={evt.id} className="relative group">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="text-cyan-400 font-semibold">{evt.timestamp}</span>
                      <span className="uppercase">{evt.stage}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 mt-0.5">
                      {evt.title}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      {evt.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER: AttackDNA Graph (5 cols) */}
          <div className="lg:col-span-5 bg-[#070b14] border border-slate-800 rounded-lg overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-2.5 bg-[#080d19] border-b border-slate-800 text-xs font-mono font-bold text-slate-200">
              AttackDNA Graph Workspace
            </div>
            <div className="flex-1 w-full relative">
              <ErrorBoundary componentName="AttackDNA Graph Workspace">
                <AttackGraphFlow interactive={true} />
              </ErrorBoundary>
            </div>
          </div>

          {/* RIGHT: Sentinel AI Panel (4 cols) */}
          <div className="lg:col-span-4 min-h-[500px]">
            <ErrorBoundary componentName="Sentinel AI Security Analyst">
              <SentinelAIPanel
                analysis={incident.aiAnalysis}
                evidenceList={incident.evidence}
                incidentId={incident.id}
                onSimulateResponse={() => executeSimulatedAction(incident.id, 'act-01')}
              />
            </ErrorBoundary>
          </div>
        </div>
      )}

      {activeTab === 'ATTACK_DNA' && (
        <div className="bg-[#070b14] border border-slate-800 rounded-lg overflow-hidden h-[620px]">
          <ErrorBoundary componentName="AttackDNA Interactive Canvas">
            <AttackGraphFlow interactive={true} />
          </ErrorBoundary>
        </div>
      )}

      {activeTab === 'EVIDENCE' && (
        <div className="bg-[#090e1d] border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-slate-200">
              Traceable Cryptographic Evidence Ledger ({incident.evidence.length} Artifacts)
            </span>
            <span className="text-[11px] font-mono text-emerald-400">All Hash Signatures Attested</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incident.evidence.map((ev) => (
              <div key={ev.id} className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-cyan-300 font-bold">{ev.id} · {ev.title}</span>
                  <span className="text-emerald-400 font-bold">{ev.confidence}% Certainty</span>
                </div>
                <div className="text-slate-300 leading-relaxed font-sans">
                  {ev.description}
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Source: {ev.source}</span>
                  <span>Type: <strong className="text-purple-300 uppercase">{ev.type}</strong></span>
                  <span>Timestamp: {ev.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ATTACK_PATH' && (
        <div className="bg-[#090e1d] border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Predictive Attack Path & Blast Radius Analysis
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded bg-cyan-950/20 border border-cyan-800/40 text-xs space-y-1">
              <div className="font-mono text-cyan-400 font-bold uppercase">1. Origin Point</div>
              <div className="font-semibold text-slate-100">Tor Exit Node (185.220.101.44)</div>
              <p className="text-slate-400">Sprayed password credential stuffing against DMZ ingress.</p>
            </div>

            <div className="p-4 rounded bg-amber-950/20 border border-amber-800/40 text-xs space-y-1">
              <div className="font-mono text-amber-400 font-bold uppercase">2. Current Compromise Stage</div>
              <div className="font-semibold text-slate-100">db-customer-aurora-primary (Core Tier)</div>
              <p className="text-slate-400">Role escalation bypassed MFA step-up; honeytoken tripped.</p>
            </div>

            <div className="p-4 rounded bg-purple-950/20 border border-purple-800/40 text-xs space-y-1">
              <div className="font-mono text-purple-400 font-bold uppercase">3. Predicted Blast Radius</div>
              <div className="font-semibold text-slate-100">AWS S3 Finance Vault & IAM Cloud Keys</div>
              <p className="text-slate-400">High probability of AWS metadata API lateral probe (169.254.169.254).</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'RESPONSE' && (
        <ErrorBoundary componentName="Counterfactual Response Simulator">
          <CounterfactualSimulator incident={incident} />
        </ErrorBoundary>
      )}

      {activeTab === 'VERIFICATION' && (
        <div className="space-y-4">
          <ErrorBoundary componentName="Verification Live Attestation Panel">
            <VerificationLivePanel />
          </ErrorBoundary>
          <div className="bg-[#090e1d] border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Automated Containment Attestation Suite
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Cryptographic and stateful probes proving threat eradication
              </div>
            </div>

            <span className={`text-xs font-mono px-3 py-1 rounded font-bold uppercase ${
              verificationState === 'VERIFIED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                : verificationState === 'CHECKING'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 animate-pulse'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}>
              STATUS: {verificationState}
            </span>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Session invalidated in Okta IdP and Redis session cache', status: verificationState === 'VERIFIED' ? 'pass' : 'checking', detail: 'OAuth refresh tokens permanently burned.' },
              { name: 'Database connection closed on port 5432', status: verificationState === 'VERIFIED' ? 'pass' : 'checking', detail: '0 active sockets associated with actor m_ross_dba_temp.' },
              { name: 'Privileged token inactive', status: verificationState === 'VERIFIED' ? 'pass' : 'checking', detail: 'ROLE_DATA_RECOVERY_OFFICER revoked from IAM directory.' },
              { name: 'Honeytoken access stopped', status: verificationState === 'VERIFIED' ? 'pass' : 'checking', detail: 'No further queries recorded on PG_SUPERUSER_RECOVERY_KEY.' },
              { name: 'No new correlated events in telemetry window', status: verificationState === 'VERIFIED' ? 'pass' : 'checking', detail: 'Egress traffic dropped to baseline.' }
            ].map((chk, idx) => (
              <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                  chk.status === 'pass' ? 'text-emerald-400' : 'text-slate-600'
                }`} />
                <div className="flex-1">
                  <div className="font-bold text-slate-200">{chk.name}</div>
                  <div className="text-slate-400 text-[11px] font-mono mt-0.5">{chk.detail}</div>
                </div>
                <span className={`text-[10px] font-mono uppercase font-bold ${
                  chk.status === 'pass' ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {chk.status === 'pass' ? 'PASSED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};
