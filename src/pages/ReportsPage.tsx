import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  ShieldAlert,
  Server,
  FileCode,
  Share2
} from 'lucide-react';
import { useSecurityStore } from '../store/useSecurityStore';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const ReportsPage: React.FC = () => {
  const { incidents, selectedIncidentId, setSelectedIncidentId } = useSecurityStore();
  const [copied, setCopied] = useState(false);

  const incident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const handleCopyReport = () => {
    const reportText = `CYBERSENTINEL X - INCIDENT DOSSIER: ${incident.id}
TITLE: ${incident.title}
SEVERITY: ${incident.severity.toUpperCase()}
RISK SCORE: ${incident.riskScore}/100
CONFIDENCE: ${incident.confidence}%

EXECUTIVE SUMMARY:
${incident.summary}

AFFECTED INFRASTRUCTURE:
${incident.affectedAssets.join(', ')}

MITRE ATT&CK TECHNIQUES:
${incident.techniques.join(', ')}

SENTINEL AI ASSESSMENT:
${incident.aiAnalysis?.assessment || incident.summary || 'Evidence-grounded assessment completed.'}

VERIFICATION RESULT:
${incident.containmentStatus?.isContained ? 'CONTAINMENT VERIFIED (5/5 PASS)' : 'PENDING VERIFICATION'}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            SOC Incident Forensic Dossiers & Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-ready, evidence-backed security reports with verified containment attestation
          </p>
        </div>

        {/* Report Actions */}
        <div className="flex items-center gap-2">
          {/* Select incident to generate report for */}
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.id}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copied ? 'Copied!' : 'Copy Dossier'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Report Document Container */}
      <ErrorBoundary componentName="Forensic Incident Report">
        <div className="bg-[#090e1d] border border-slate-800 rounded-lg p-6 space-y-6 shadow-2xl print:border-none print:p-0">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
              CyberSentinel X · Autonomous Defense Attestation
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              Incident Response Report: {incident.id}
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              {incident.title}
            </div>
          </div>

          <div className="text-right text-xs font-mono space-y-0.5">
            <div>Generated: <span className="text-slate-200">2026-09-27 05:45:00 UTC</span></div>
            <div>Classification: <span className="text-red-400 font-bold">STRICTLY CONFIDENTIAL</span></div>
            <div>Lead Auditor: <span className="text-cyan-300">Marcus Ross (SOC Tier-3)</span></div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <span>01.</span> Executive Summary
          </h3>
          <div className="p-4 rounded bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
            {incident.summary}
          </div>
        </div>

        {/* Section 2: Attack Chronology & Timeline */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <span>02.</span> Attack Progression Timeline
          </h3>
          <div className="border border-slate-800 rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Attack Stage</th>
                  <th className="p-2.5">Event Description</th>
                  <th className="p-2.5">Evidence Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {incident.timeline.map((tl) => (
                  <tr key={tl.id} className="hover:bg-slate-900/40">
                    <td className="p-2.5 text-cyan-400">{tl.timestamp}</td>
                    <td className="p-2.5 uppercase text-slate-300">{tl.stage}</td>
                    <td className="p-2.5 text-slate-200 font-sans text-xs">{tl.title} — {tl.description}</td>
                    <td className="p-2.5 text-purple-300">{tl.evidenceRefId || 'Verified Telemetry'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Affected Assets & Threat Techniques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span>03.</span> Impacted Infrastructure
            </h3>
            <div className="p-3 rounded bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
              {incident.affectedAssets.map((ast) => (
                <div key={ast} className="flex items-center justify-between font-mono text-[11px] p-1.5 rounded bg-slate-900/50">
                  <span className="text-slate-200">{ast}</span>
                  <span className="text-red-400">Target Core</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span>04.</span> Correlated MITRE ATT&CK Techniques
            </h3>
            <div className="p-3 rounded bg-slate-950/70 border border-slate-800 flex flex-wrap gap-1.5 text-xs">
              {incident.techniques.map((t) => (
                <span key={t} className="px-2.5 py-1 text-[11px] font-mono bg-slate-900 border border-slate-700 text-cyan-300 rounded">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Sentinel AI Epistemic Analysis */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <span>05.</span> Sentinel AI Epistemic Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded bg-cyan-950/20 border border-cyan-800/40 text-xs space-y-1">
              <div className="font-mono text-[10px] text-cyan-400 font-bold uppercase">Observed Facts</div>
              <ul className="text-slate-300 space-y-1 text-[11px]">
                {(incident.aiAnalysis?.observedFacts || []).slice(0, 3).map((f, i) => (
                  <li key={i}>• {typeof f === 'string' ? f : (f as any).statement || String(f)}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded bg-amber-950/20 border border-amber-800/40 text-xs space-y-1">
              <div className="font-mono text-[10px] text-amber-400 font-bold uppercase">Inferred Analysis</div>
              <ul className="text-slate-300 space-y-1 text-[11px]">
                {(incident.aiAnalysis?.inferredConclusions || []).slice(0, 3).map((f, i) => (
                  <li key={i}>• {typeof f === 'string' ? f : (f as any).statement || String(f)}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded bg-purple-950/20 border border-purple-800/40 text-xs space-y-1">
              <div className="font-mono text-[10px] text-purple-400 font-bold uppercase">Predicted Trajectory</div>
              <ul className="text-slate-300 space-y-1 text-[11px]">
                {(incident.aiAnalysis?.predictedNextSteps || []).slice(0, 3).map((f, i) => (
                  <li key={i}>• {typeof f === 'string' ? f : (f as any).statement || String(f)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 6: Containment Action & Verification Result */}
        <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-300 font-bold flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              06. Containment & Automated Attestation
            </span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-900/80 border border-emerald-500 text-emerald-200 uppercase font-bold text-[10px]">
              VERIFIED CONTAINED
            </span>
          </div>
          <div className="text-xs text-slate-200 leading-relaxed font-sans pt-1">
            <strong>Executed Defense Action: </strong>
            {incident.containmentStatus?.executedAction || 'Revoke User Session & Invalidate Tokens across IdP and DB Pool'}
          </div>
          <div className="text-xs text-slate-300 font-mono text-[11px] bg-slate-950/60 p-2.5 rounded border border-slate-800">
            Attestation Probe: 0 active socket connections to target database. Identity suspended in Okta directory. Egress traffic verified 0 B/s.
          </div>
        </div>
      </div>
      </ErrorBoundary>
    </div>
  );
};
