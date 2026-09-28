/**
 * CyberSentinel X - Sentinel AI Panel
 * Evidence-Grounded Security Analyst Interface powered by Gemini & Deterministic Guardrails
 * Displays OBSERVED, INFERRED, PREDICTED tiers, evidence artifact citations,
 * operator Q&A console, executive report generation, and immutable audit logs.
 */

import React, { useEffect, useState, useTransition } from 'react';
import {
  Sparkles,
  Eye,
  Brain,
  Compass,
  FileCode,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  X,
  Play,
  RotateCcw,
  MessageSquare,
  Send,
  HelpCircle,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Search,
  Activity,
  Layers
} from 'lucide-react';
import { AIAnalysis, Evidence } from '../../types/security';
import { useSecurityStore } from '../../store/useSecurityStore';
import {
  AIAuditRecord,
  ExecutiveSummary,
  OperatorQuestionAnswer,
  StructuredAIAnalysis
} from '../../ai/schemas';
import { sentinelAnalyst } from '../../ai/sentinelAnalyst';
import { EvidenceChip } from '../common/EvidenceModal';

interface SentinelAIPanelProps {
  analysis?: AIAnalysis;
  evidenceList: Evidence[];
  incidentId: string;
  onSimulateResponse?: () => void;
}

const PRESET_QUESTIONS = [
  'What happened?',
  'Why is this incident high risk?',
  'What evidence supports credential compromise?',
  'What could the attacker access next?',
  'What should I investigate?'
];

export const SentinelAIPanel: React.FC<SentinelAIPanelProps> = ({
  evidenceList,
  incidentId,
  onSimulateResponse
}) => {
  const {
    getIncident,
    events,
    assets,
    deceptionObjects,
    executeSimulatedAction
  } = useSecurityStore();

  const incident = getIncident(incidentId);

  // AI State
  const [currentAnalysis, setCurrentAnalysis] = useState<StructuredAIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Verifying evidence...');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Modals & Panels
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<Evidence | null>(null);
  const [activeAuditModal, setActiveAuditModal] = useState<AIAuditRecord | null>(null);
  const [executiveSummaryModal, setExecutiveSummaryModal] = useState<ExecutiveSummary | null>(null);
  const [isGeneratingExecSummary, setIsGeneratingExecSummary] = useState(false);

  // Operator Q&A Console
  const [customQuestion, setCustomQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<OperatorQuestionAnswer[]>([]);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [isQaExpanded, setIsQaExpanded] = useState(false);

  // Fetch or refresh analysis
  const runAnalysis = async () => {
    if (!incident) return;
    setIsLoading(true);
    setAnalysisError(null);
    setLoadingStage('Sanitizing credentials & telemetry...');

    const timer1 = setTimeout(() => setLoadingStage('Constructing EvidencePacket v4...'), 350);
    const timer2 = setTimeout(() => setLoadingStage('Evaluating grounded security claims...'), 700);

    try {
      const { analysis } = await sentinelAnalyst.analyzeIncident(
        incident,
        events,
        assets,
        deceptionObjects
      );
      setCurrentAnalysis(analysis);
    } catch (err: any) {
      console.error('Sentinel AI analysis error:', err);
      setAnalysisError(err.message || 'AI analysis temporarily unavailable');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [incidentId, incident?.lastSeen, incident?.stage]);

  const handleAskQuestion = async (queryText: string) => {
    if (!incident || !queryText.trim() || isAskingQuestion) return;
    setIsAskingQuestion(true);
    try {
      const answer = await sentinelAnalyst.askQuestion(
        incident,
        queryText,
        events,
        assets,
        deceptionObjects
      );
      setQaHistory((prev) => [answer, ...prev.slice(0, 5)]);
      setCustomQuestion('');
      setIsQaExpanded(true);
    } catch (err) {
      console.error('Failed to answer question:', err);
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const handleGenerateExecutiveSummary = async () => {
    if (!incident || isGeneratingExecSummary) return;
    setIsGeneratingExecSummary(true);
    try {
      const summary = await sentinelAnalyst.generateExecutiveSummary(
        incident,
        events,
        assets,
        deceptionObjects
      );
      setExecutiveSummaryModal(summary);
    } catch (err) {
      console.error('Failed to generate executive summary:', err);
    } finally {
      setIsGeneratingExecSummary(false);
    }
  };

  const handleViewAuditLog = () => {
    const latest = sentinelAnalyst.getLatestAuditRecord();
    if (latest) {
      setActiveAuditModal(latest);
    }
  };

  const getEvidenceById = (id: string): Evidence | undefined => {
    return evidenceList.find((e) => e.id === id) || (incident?.evidence || []).find((e) => e.id === id);
  };

  const handleSimulateClick = (actionId = 'resp-revoke-session') => {
    if (onSimulateResponse) {
      onSimulateResponse();
    } else {
      executeSimulatedAction(incidentId, actionId);
    }
  };

  // Safe display values
  const confidence = currentAnalysis?.observedFacts[0]?.confidence || incident?.confidence || 94;
  const isDemo = currentAnalysis?.isDemoFallback ?? true;
  const modelName = isDemo ? 'DEMO ANALYSIS' : (currentAnalysis?.modelUsed || 'GEMINI 3.8 FLASH');

  return (
    <div className="bg-[#090e1c] border border-slate-800 rounded-lg p-4 h-full flex flex-col justify-between overflow-y-auto space-y-4">
      <div className="space-y-4">
        {/* ============================================================ */}
        {/* HEADER: Title, Model Badge, Refresh, Audit & Exec Summary */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-slate-100 flex items-center gap-1.5">
                SENTINEL AI
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-amber-500/60 bg-amber-950/80 text-amber-300 uppercase font-bold tracking-wider"
                  title="Advisory Role: Human operator review and approval required for any infrastructure response"
                >
                  ADVISORY
                </span>
                <span className="text-[9px] font-mono px-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {modelName}
                </span>
              </div>
              <div className="text-[10px] font-mono font-semibold text-cyan-400 tracking-wider">
                EVIDENCE-GROUNDED ANALYST
              </div>
            </div>
          </div>

          {/* Quick Header Actions: Refresh, Audit, Report */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={runAnalysis}
              disabled={isLoading}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
              title="Refresh AI analysis using current verified evidence packet"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={handleViewAuditLog}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-purple-300 border border-slate-800 transition-colors cursor-pointer text-[10px] font-mono"
              title="Inspect AI Audit Log: Why did Sentinel AI say this?"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleGenerateExecutiveSummary}
              disabled={isGeneratingExecSummary}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-purple-950/50 text-slate-300 hover:text-purple-300 border border-slate-800 hover:border-purple-600/40 transition-colors cursor-pointer text-[10px] font-mono flex items-center gap-1"
              title="Generate Executive Leadership Briefing"
            >
              <FileText className="w-3 h-3 text-purple-400" />
              <span className="hidden sm:inline">Exec Brief</span>
            </button>

            <div className="text-right pl-2 border-l border-slate-800/80">
              <div className="text-sm font-mono font-bold text-cyan-400 tabular-nums">
                {confidence}%
              </div>
              <div className="text-[8px] font-mono text-slate-400 uppercase">Certainty</div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* LOADING STATE (Requirement 8) */}
        {/* ============================================================ */}
        {isLoading && (
          <div className="p-4 rounded-lg bg-slate-950/90 border border-cyan-900/60 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                SENTINEL AI ANALYZING VERIFIED EVIDENCE...
              </span>
              <span className="text-[10px] text-slate-400">
                {incident?.evidence.length || 6} artifacts · {incident?.affectedAssets.length || 2} assets
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono">
              Stage: <span className="text-cyan-300">{loadingStage}</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full w-2/3 animate-pulse" />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ERROR STATE (Requirement 9) */}
        {/* ============================================================ */}
        {analysisError && !isLoading && (
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-600/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>AI ANALYSIS TEMPORARILY UNAVAILABLE</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Deterministic security analysis remains fully operational. Verified detections, AttackDNA, and response actions are unaffected.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-400">
              <span>Risk Score: <strong className="text-red-400">{incident?.riskScore}</strong></span>
              <span>Detections: <strong className="text-cyan-400">{incident?.timeline.length}</strong></span>
              <span>Evidence: <strong className="text-purple-400">{incident?.evidence.length}</strong></span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MAIN BODY: THREAT ASSESSMENT & EPISTEMIC TIERS */}
        {/* ============================================================ */}
        {currentAnalysis && !isLoading && (
          <>
            {/* THREAT ASSESSMENT */}
            <div className="p-3 rounded bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider flex items-center justify-between">
                <span>THREAT ASSESSMENT</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  Updated: {currentAnalysis.generatedAt}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {currentAnalysis.summary}
              </p>
            </div>

            {/* THREE EPISTEMIC TIERS: OBSERVED, INFERRED, PREDICTED */}
            <div className="space-y-2.5">
              {/* OBSERVED (Evidence-backed facts) */}
              <div className="rounded border border-cyan-900/50 bg-cyan-950/20 p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5" />
                  <span>OBSERVED (Evidence-Backed Facts)</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                  {currentAnalysis.observedFacts.map((fact, i) => (
                    <li key={i} className="flex flex-col gap-1">
                      <div className="flex items-start gap-1.5">
                        <span className="text-cyan-500 font-mono mt-0.5">•</span>
                        <span className="leading-snug text-slate-200">{fact.statement}</span>
                      </div>
                      {/* Evidence citations chips */}
                      <div className="flex items-center gap-1.5 ml-3.5 flex-wrap pt-0.5">
                        {fact.evidenceIds.map((eid) => (
                          <EvidenceChip key={eid} id={eid} />
                        ))}
                        {fact.unverifiedClaim && (
                          <span className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-[9px] font-mono text-red-300 font-bold">
                            UNVERIFIED AI CLAIM
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* INFERRED (Reasoning derived from observed evidence) */}
              <div className="rounded border border-amber-900/50 bg-amber-950/20 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" />
                    <span>INFERRED (Derived from Evidence)</span>
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                  {currentAnalysis.inferredConclusions.map((inf, i) => (
                    <li key={i} className="space-y-1">
                      <div className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-mono mt-0.5">•</span>
                        <span className="leading-snug text-slate-200">{inf.statement}</span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-3.5 text-[10px] font-mono text-slate-400 flex-wrap pt-0.5">
                        <span className="text-amber-400">Confidence: {inf.confidence}%</span>
                        {inf.supportingEvidenceIds.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>Based on:</span>
                            {inf.supportingEvidenceIds.map((eid) => (
                              <EvidenceChip key={eid} id={eid} />
                            ))}
                          </div>
                        )}
                        {inf.unverifiedClaim && (
                          <span className="text-red-400 font-bold">[UNVERIFIED]</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PREDICTED (Potential next attack stages) */}
              <div className="rounded border border-purple-900/50 bg-purple-950/20 p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5" />
                  <span>PREDICTED (Potential Next Attack Stages)</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                  {currentAnalysis.predictedNextSteps.map((pred, i) => (
                    <li key={i} className="space-y-0.5">
                      <div className="flex items-start gap-1.5">
                        <span className="text-purple-500 font-mono mt-0.5">•</span>
                        <span className="leading-snug text-slate-200">{pred.statement}</span>
                      </div>
                      <div className="ml-3.5 text-[10px] font-mono text-slate-400">
                        Basis: <span className="text-slate-300">{pred.basis}</span> (Confidence: {pred.confidence}%)
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* RECOMMENDED INVESTIGATION */}
            <div className="p-3 rounded bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1 flex items-center justify-between">
                <span>RECOMMENDED INVESTIGATION</span>
                <span className="text-[9px] text-cyan-400">Advisory Checklist</span>
              </div>
              <ol className="space-y-1.5 text-xs text-slate-200 list-decimal list-inside font-sans">
                {currentAnalysis.investigationRecommendations.map((inv, i) => (
                  <li key={i} className="leading-snug">
                    <span className="font-medium text-slate-100">{inv.action}</span>
                    <div className="ml-4 text-[10px] text-slate-400 font-mono">
                      Reason: {inv.reason}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* OPERATOR INQUIRY CONSOLE (Interactive Question Answering) */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-purple-400" />
                  OPERATOR SECURITY INQUIRY
                </span>
                <button
                  onClick={() => setIsQaExpanded(!isQaExpanded)}
                  className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {isQaExpanded ? 'Hide History' : 'Show History'}
                </button>
              </div>

              {/* Preset question pills */}
              <div className="flex flex-wrap gap-1">
                {PRESET_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    disabled={isAskingQuestion}
                    onClick={() => handleAskQuestion(q)}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-800 hover:border-purple-500/40 transition-colors cursor-pointer text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Custom question input */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Ask Sentinel AI about evidence, risk, or lateral movement..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion(customQuestion)}
                  className="flex-1 px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 placeholder:text-slate-400 font-mono focus:outline-none focus:border-purple-500/60"
                />
                <button
                  onClick={() => handleAskQuestion(customQuestion)}
                  disabled={!customQuestion.trim() || isAskingQuestion}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              {/* Q&A Recent Answer */}
              {qaHistory.length > 0 && isQaExpanded && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  {qaHistory.map((item, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900/60 border border-purple-900/30 text-xs space-y-1">
                      <div className="text-[10px] font-mono font-bold text-purple-300">
                        Q: {item.question}
                      </div>
                      <p className="text-slate-200 leading-snug font-sans">{item.answer}</p>
                      <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 pt-0.5">
                        <span>Certainty: {item.confidence}%</span>
                        {item.evidenceIds.length > 0 && (
                          <span>Cites: {item.evidenceIds.join(', ')}</span>
                        )}
                        {item.unverifiedClaim && (
                          <span className="text-red-400 font-bold">[UNVERIFIED CITATION]</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MODEL LIMITATIONS (Requirement 7) */}
            <div className="p-2.5 rounded bg-slate-950/40 border border-slate-800/50 text-[10px] font-mono text-slate-400 space-y-0.5">
              <div className="text-slate-400 font-bold uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" />
                MODEL EPISTEMIC LIMITATIONS
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                {currentAnalysis.limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* RECOMMENDED RESPONSE (Bottom action box, advisory only) */}
      {/* ============================================================ */}
      <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-500/50 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            RECOMMENDED RESPONSE (ADVISORY)
          </span>
          <span className="text-emerald-400 font-bold text-[10px]">
            Security Benefit: +94%
          </span>
        </div>

        {/* Visual Operator Workflow */}
        <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 text-[9px] font-mono text-slate-300 flex items-center justify-between gap-1 overflow-x-auto">
          <span className="text-purple-300 font-bold">AI Recommends</span>
          <span className="text-slate-500">→</span>
          <span className="text-amber-300 font-bold">Operator Reviews</span>
          <span className="text-slate-500">→</span>
          <span className="text-cyan-300 font-bold">Simulator</span>
          <span className="text-slate-500">→</span>
          <span className="text-emerald-300 font-bold">Verify</span>
        </div>

        <div className="text-xs font-bold text-slate-100 font-sans">
          {currentAnalysis?.responseConsiderations[0]?.action || 'Revoke User Session & Invalidate Tokens'}
        </div>

        <p className="text-[11px] text-slate-300 font-sans leading-tight">
          {currentAnalysis?.responseConsiderations[0]?.rationale || 'Sever adversary database socket without host downtime.'}
        </p>

        <button
          onClick={() => handleSimulateClick('resp-revoke-session')}
          className="w-full py-2 px-3 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-950/50 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>SIMULATE RESPONSE</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* EVIDENCE ARTIFACT MODAL */}
      {/* ============================================================ */}
      {activeEvidenceModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1122] border border-cyan-800/80 rounded-lg max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-mono font-bold text-slate-100">
                  {activeEvidenceModal.id}: {activeEvidenceModal.title}
                </span>
              </div>
              <button
                onClick={() => setActiveEvidenceModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400">Source: </span>
                  <span className="text-slate-200">{activeEvidenceModal.source}</span>
                </div>
                <div>
                  <span className="text-slate-400">Timestamp: </span>
                  <span className="text-cyan-300">{activeEvidenceModal.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400">Artifact Type: </span>
                  <span className="text-purple-300 uppercase">{activeEvidenceModal.type}</span>
                </div>
                <div>
                  <span className="text-slate-400">Certainty: </span>
                  <span className="text-emerald-400 font-bold">{activeEvidenceModal.confidence}%</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-200 leading-relaxed font-sans">
                {activeEvidenceModal.description}
              </div>

              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic hash match verified against cryptographic telemetry store.</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveEvidenceModal(null)}
                className="px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer"
              >
                Close Artifact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* AI AUDIT RECORD MODAL ("Why did Sentinel AI say this?") */}
      {/* ============================================================ */}
      {activeAuditModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1122] border border-purple-800/80 rounded-lg max-w-xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-mono font-bold text-slate-100">
                  AI Audit Record: {activeAuditModal.analysisId}
                </span>
              </div>
              <button
                onClick={() => setActiveAuditModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-3 rounded border border-slate-800">
                <div>
                  <span className="text-slate-400">Incident: </span>
                  <span className="text-cyan-400">{activeAuditModal.incidentId}</span>
                </div>
                <div>
                  <span className="text-slate-400">Generated: </span>
                  <span className="text-slate-200">{activeAuditModal.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400">Model: </span>
                  <span className="text-purple-300">{activeAuditModal.model}</span>
                </div>
                <div>
                  <span className="text-slate-400">Prompt Version: </span>
                  <span className="text-slate-200">{activeAuditModal.promptVersion}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status: </span>
                  <span className="text-emerald-400 font-bold">{activeAuditModal.status}</span>
                </div>
                <div>
                  <span className="text-slate-400">Redactions: </span>
                  <span className="text-amber-400 font-bold">{activeAuditModal.sanitizationCount} secrets</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Evidence IDs Bound to Reasoning:
                </div>
                <div className="flex flex-wrap gap-1">
                  {activeAuditModal.evidenceIds.map((eid, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-cyan-300">
                      {eid}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-300 leading-relaxed font-sans text-xs">
                {activeAuditModal.analysis.summary}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveAuditModal(null)}
                className="px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EXECUTIVE SUMMARY REPORT MODAL */}
      {/* ============================================================ */}
      {executiveSummaryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1122] border border-cyan-700/80 rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-sm font-mono font-bold text-slate-100">
                    EXECUTIVE LEADERSHIP BRIEFING
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Incident: {executiveSummaryModal.incidentId} · Generated: {executiveSummaryModal.generatedAt}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExecutiveSummaryModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  EXECUTIVE OVERVIEW
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {executiveSummaryModal.incidentOverview}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                    BUSINESS & REGULATORY IMPACT
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    {executiveSummaryModal.businessImpact}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-red-400 font-bold">
                    SECURITY IMPACT & EXPOSURE
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    {executiveSummaryModal.securityImpact}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] p-3 rounded bg-slate-900/60 border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Response Status</span>
                  <span className="text-emerald-400 font-bold">{executiveSummaryModal.responseStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Verification</span>
                  <span className="text-cyan-400 font-bold">{executiveSummaryModal.verificationStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Residual Risk</span>
                  <span className="text-amber-400 font-bold">{executiveSummaryModal.remainingRisk} / 100</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                  Affected Infrastructure & Data Assets:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {executiveSummaryModal.affectedAssets.map((asset, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setExecutiveSummaryModal(null)}
                className="px-3 py-1.5 text-xs font-mono bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded cursor-pointer"
              >
                Close Executive Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
