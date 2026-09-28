/**
 * CyberSentinel X - Sentinel Analyst Orchestrator
 * High-level security analyst service managing EvidencePacket construction,
 * privacy sanitization, audit logging, model invocation, and operator questions.
 */

import { Asset, DeceptionObject, Incident, SecurityEvent } from '../types/security';
import { buildEvidencePacket } from './evidenceFormatter';
import { defaultAIProvider, AIProvider } from './geminiProvider';
import {
  AIAuditRecord,
  ExecutiveSummary,
  OperatorQuestionAnswer,
  StructuredAIAnalysis
} from './schemas';

class SentinelAnalystService {
  private provider: AIProvider = defaultAIProvider;
  private auditLogs: AIAuditRecord[] = [];
  private auditCounter = 1000;

  setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  /**
   * Performs evidence-grounded security analysis for an incident.
   */
  async analyzeIncident(
    incident: Incident,
    events: SecurityEvent[] = [],
    assets: Asset[] = [],
    deception: DeceptionObject[] = []
  ): Promise<{ analysis: StructuredAIAnalysis; auditRecord: AIAuditRecord }> {
    // 1. Build and sanitize evidence packet
    const { packet, redactions } = buildEvidencePacket(incident, events, assets, deception);

    // 2. Delegate to AI provider
    const analysis = await this.provider.analyzeIncident(packet);

    // 3. Create immutable audit record
    this.auditCounter += 1;
    const auditRecord: AIAuditRecord = {
      analysisId: `AUDIT-${this.auditCounter}`,
      incidentId: incident.id,
      timestamp: new Date().toTimeString().slice(0, 8),
      model: analysis.modelUsed || 'gemini-3.8-flash',
      promptVersion: 'sentinel-v4.2-evidence-grounded',
      evidenceIds: analysis.observedFacts.flatMap((f) => f.evidenceIds),
      analysis,
      status: analysis.isDemoFallback ? 'FALLBACK' : redactions > 0 ? 'SANITIZED' : 'SUCCESS',
      sanitizationCount: redactions
    };

    this.auditLogs.unshift(auditRecord);
    if (this.auditLogs.length > 50) this.auditLogs.pop();

    return { analysis, auditRecord };
  }

  /**
   * Answers operator security questions grounded in verified evidence.
   */
  async askQuestion(
    incident: Incident,
    question: string,
    events: SecurityEvent[] = [],
    assets: Asset[] = [],
    deception: DeceptionObject[] = []
  ): Promise<OperatorQuestionAnswer> {
    const { packet } = buildEvidencePacket(incident, events, assets, deception);
    return this.provider.askQuestion(packet, question);
  }

  /**
   * Generates executive summary report.
   */
  async generateExecutiveSummary(
    incident: Incident,
    events: SecurityEvent[] = [],
    assets: Asset[] = [],
    deception: DeceptionObject[] = []
  ): Promise<ExecutiveSummary> {
    const { packet } = buildEvidencePacket(incident, events, assets, deception);
    return this.provider.generateExecutiveSummary(packet);
  }

  /**
   * Returns audit logs for inspection in the UI ("Why did Sentinel AI say this?").
   */
  getAuditLogsForIncident(incidentId: string): AIAuditRecord[] {
    return this.auditLogs.filter((a) => a.incidentId === incidentId);
  }

  getLatestAuditRecord(): AIAuditRecord | undefined {
    return this.auditLogs[0];
  }

  /**
   * Resets all demo audit logs and counters back to initial baseline.
   */
  clearAuditLogs(): void {
    this.auditLogs = [];
    this.auditCounter = 1000;
  }
}

export const sentinelAnalyst = new SentinelAnalystService();
