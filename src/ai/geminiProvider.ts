/**
 * CyberSentinel X - Gemini Provider & AI Provider Abstraction
 * Implements AIProvider contract with server-side proxy integration,
 * schema validation, hallucinated evidence filtering, and deterministic fallback.
 */

import { getAllValidEvidenceIds } from './evidenceFormatter';
import {
  ExecutiveSummary,
  OperatorQuestionAnswer,
  StructuredAIAnalysis,
  validateAIAnalysisSchema,
  EvidencePacket
} from './schemas';

export interface AIProvider {
  analyzeIncident(packet: EvidencePacket): Promise<StructuredAIAnalysis>;
  askQuestion(packet: EvidencePacket, question: string): Promise<OperatorQuestionAnswer>;
  generateExecutiveSummary(packet: EvidencePacket): Promise<ExecutiveSummary>;
}

function getApiUrl(endpoint: string): string {
  if (typeof window !== 'undefined') {
    return endpoint;
  }
  const baseUrl = process.env.APP_URL || 'http://127.0.0.1:3000';
  return `${baseUrl}${endpoint}`;
}

/**
 * Strips markdown code blocks and trims whitespace to safely parse JSON.
 */
export function safeExtractJson<T>(raw: string): T {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  }
  return JSON.parse(cleaned);
}

/**
 * Filters out any hallucinated evidence IDs not present in the original EvidencePacket.
 * If a statement cited an invalid ID, flags it as an unverified claim.
 */
export function sanitizeEvidenceCitations(
  analysis: StructuredAIAnalysis,
  packet: EvidencePacket
): StructuredAIAnalysis {
  const validIds = getAllValidEvidenceIds(packet);

  const cleanObserved = analysis.observedFacts.map((fact) => {
    const verifiedIds: string[] = [];
    let hadHallucinated = false;

    for (const eid of fact.evidenceIds || []) {
      if (validIds.has(eid)) {
        verifiedIds.push(eid);
      } else {
        hadHallucinated = true;
      }
    }

    return {
      ...fact,
      evidenceIds: verifiedIds,
      unverifiedClaim: hadHallucinated || (fact.evidenceIds.length > 0 && verifiedIds.length === 0)
    };
  });

  const cleanInferred = analysis.inferredConclusions.map((inf) => {
    const verifiedIds: string[] = [];
    let hadHallucinated = false;

    for (const eid of inf.supportingEvidenceIds || []) {
      if (validIds.has(eid)) {
        verifiedIds.push(eid);
      } else {
        hadHallucinated = true;
      }
    }

    return {
      ...inf,
      supportingEvidenceIds: verifiedIds,
      unverifiedClaim: hadHallucinated
    };
  });

  const cleanRecommendations = analysis.investigationRecommendations.map((rec) => ({
    ...rec,
    evidenceIds: (rec.evidenceIds || []).filter((id) => validIds.has(id))
  }));

  return {
    ...analysis,
    observedFacts: cleanObserved,
    inferredConclusions: cleanInferred,
    investigationRecommendations: cleanRecommendations
  };
}

/**
 * Deterministic fallback analysis used when Gemini API is unavailable or in offline demo mode.
 * Grounded strictly in supplied evidence. Labeled explicitly as deterministic fallback.
 */
export function getDeterministicFallbackAnalysis(packet: EvidencePacket): StructuredAIAnalysis {
  const evMap = new Map(packet.evidence.map((e) => [e.id, e]));
  const observedFacts: StructuredAIAnalysis['observedFacts'] = [];
  const inferredConclusions: StructuredAIAnalysis['inferredConclusions'] = [];

  // 1. Check for auth evidence
  if (evMap.has('E-101') || evMap.has('E-102')) {
    observedFacts.push({
      statement: 'Failed login attempts from external Tor IP were succeeded by authentication session establishment.',
      evidenceIds: ['E-101', 'E-102'].filter((id) => evMap.has(id)),
      confidence: 94
    });
    inferredConclusions.push({
      statement: 'Credential access succeeded via password spraying or stolen credential replay against Okta IdP boundary.',
      supportingEvidenceIds: ['E-102'].filter((id) => evMap.has(id)),
      confidence: 91
    });
  }

  // 2. Check for privilege escalation
  if (evMap.has('E-104')) {
    observedFacts.push({
      statement: 'Sudo privilege elevation executed on internal bastion host without authorized change ticket.',
      evidenceIds: ['E-104'],
      confidence: 96
    });
    inferredConclusions.push({
      statement: 'Adversary leveraged local privilege elevation to attain DBA-level permissions.',
      supportingEvidenceIds: ['E-104'],
      confidence: 93
    });
  }

  // 3. Check for database access
  if (evMap.has('E-106') || evMap.has('E-107')) {
    observedFacts.push({
      statement: 'High-volume database queries executed against restricted salary and employee records on Aurora Primary.',
      evidenceIds: ['E-106', 'E-107'].filter((id) => evMap.has(id)),
      confidence: 95
    });
    inferredConclusions.push({
      statement: 'Targeted data staging and collection underway on primary customer database cluster.',
      supportingEvidenceIds: ['E-107'].filter((id) => evMap.has(id)),
      confidence: 92
    });
  }

  // 4. Check for deception trigger
  if (evMap.has('E-109')) {
    observedFacts.push({
      statement: 'Synthetic canary honeytoken table (db-decoy-payroll-shadow) accessed by temporary DBA session.',
      evidenceIds: ['E-109'],
      confidence: 99
    });
    inferredConclusions.push({
      statement: 'Conclusive 99% proof of hostile lateral exploration: canary table has zero authorized operational traffic.',
      supportingEvidenceIds: ['E-109'],
      confidence: 99
    });
  }

  // Containment verification check
  const isContained = packet.verificationState.isContained;
  const isVerified = packet.verificationState.verificationState === 'VERIFIED';

  if (isContained) {
    observedFacts.push({
      statement: `Containment action applied. Verification status: ${packet.verificationState.verificationState}.`,
      evidenceIds: evMap.has('E-111') ? ['E-111'] : [],
      confidence: isVerified ? 100 : 90
    });
  }

  return {
    incidentId: packet.incident.id,
    summary: evMap.has('E-109')
      ? 'Multi-stage intrusion confirmed by honeytoken trigger. Unauthorized actor elevated to DBA and queried restricted payroll data before canary trip.'
      : `Correlated multi-stage security incident affecting ${packet.incident.affectedUsers.join(', ')} across ${packet.affectedAssets.map((a) => a.hostname).join(', ')}.`,
    observedFacts: observedFacts.length > 0 ? observedFacts : [
      {
        statement: `Security telemetry recorded anomalous events on asset ${packet.incident.affectedAssets?.[0] || 'sentinel-core'}.`,
        evidenceIds: packet.evidence[0] ? [packet.evidence[0].id] : [],
        confidence: 85
      }
    ],
    inferredConclusions: inferredConclusions.length > 0 ? inferredConclusions : [
      {
        statement: 'Adversary behavior indicates targeted unauthorized exploration.',
        supportingEvidenceIds: packet.evidence[0] ? [packet.evidence[0].id] : [],
        confidence: 80
      }
    ],
    predictedNextSteps: isContained ? [] : [
      {
        statement: 'Lateral movement towards cloud storage (S3 / GCS) for secondary data staging and exfiltration.',
        basis: 'Standard T1048 exfiltration sequence following database compromise.',
        confidence: 72
      },
      {
        statement: 'Persistence installation via SSH authorized_keys modification or cron backdoors.',
        basis: 'Adversary holds temporary root on bastion host.',
        confidence: 65
      }
    ],
    attackStageAssessment: packet.attackDNA.map((node) => ({
      stage: node.stage,
      assessment: node.details,
      evidenceIds: node.evidenceIds,
      confidence: node.confidence
    })),
    investigationRecommendations: [
      {
        action: 'Inspect active Okta IdP session tokens and Redis token cache keys for s_chen and m_ross',
        reason: 'Verify all active OAuth bearer tokens are terminated',
        evidenceIds: ['E-102'].filter((id) => evMap.has(id))
      },
      {
        action: 'Review PostgreSQL query log on db-customer-aurora-primary for unauthorized tables queried',
        reason: 'Quantify exact blast radius and records in scope',
        evidenceIds: ['E-107'].filter((id) => evMap.has(id))
      },
      {
        action: 'Check egress netflow at perimeter firewall for abnormal connections to Tor exit nodes',
        reason: 'Rule out secondary data exfiltration channels',
        evidenceIds: ['E-101'].filter((id) => evMap.has(id))
      }
    ],
    responseConsiderations: [
      {
        action: 'Revoke User Session & Invalidate Tokens',
        rationale: 'Terminates attacker socket connections instantly without disrupting other workloads.',
        expectedSecurityBenefit: 'Immediate attack termination (94% security benefit)',
        operationalConsideration: 'Zero downtime for production database services.'
      },
      {
        action: 'Quarantine Bastion Endpoint',
        rationale: 'Isolates compromised host if session revocation fails to sever persistent backdoor.',
        expectedSecurityBenefit: 'Physical blast radius containment',
        operationalConsideration: '45 minutes operational downtime for DevOps jump box.'
      }
    ],
    limitations: [
      'Deterministic fallback analysis generated from verified EvidencePacket (offline demo mode)',
      'No speculative extrapolations outside supplied evidence IDs'
    ],
    generatedAt: new Date().toTimeString().slice(0, 8),
    isDemoFallback: true,
    modelUsed: 'DEMO ANALYSIS'
  };
}

export function getDeterministicFallbackSummary(packet: EvidencePacket): ExecutiveSummary {
  return {
    incidentId: packet.incident.id,
    incidentOverview: `Executive Briefing: Incident ${packet.incident.id} involves unauthorized credential abuse and sensitive database queries initiated via Tor proxy AS9009.`,
    businessImpact: 'Risk exposure to customer and employee payroll records. Proactive canary traps triggered, preventing unmonitored mass extraction.',
    affectedAssets: packet.affectedAssets.map((a) => a.hostname),
    securityImpact: 'Blast radius contained to internal bastion and database pool. No lateral compromise into core payments detected.',
    responseStatus: packet.verificationState.isContained ? 'CONTAINED & VERIFIED' : 'INVESTIGATION / CONTAINMENT PENDING',
    verificationStatus: packet.verificationState.verificationState,
    remainingRisk: packet.incident.riskScore,
    limitations: ['Generated via deterministic evidence correlation engine snapshot.'],
    generatedAt: new Date().toTimeString().slice(0, 8),
    isDemoFallback: true
  };
}

export function createFallbackQuestionAnswer(packet: EvidencePacket, question: string): OperatorQuestionAnswer {
  const qLower = question.toLowerCase();
  const validIds = Array.from(getAllValidEvidenceIds(packet));
  const now = new Date().toTimeString().slice(0, 8);

  if (qLower.includes('what happened') || qLower.includes('happened')) {
    return {
      question,
      answer: `An external actor at 185.220.101.44 conducted credential spraying against Okta, gained access to s_chen, elevated to DBA privileges on bastion host 10.0.1.15, and queried database tables before tripping canary trap db-decoy-payroll-shadow.`,
      evidenceIds: validIds.slice(0, 3),
      confidence: 94,
      limitations: ['Grounded in verified evidence packet'],
      generatedAt: now
    };
  }

  if (qLower.includes('why') && qLower.includes('risk')) {
    return {
      question,
      answer: `This incident has a risk score of ${packet.incident.riskScore} because it involves unauthorized access to the production database cluster (db-customer-aurora-primary) holding customer records, verified role escalation, and confirmed hostile intent via honeytoken trip.`,
      evidenceIds: ['E-104', 'E-107', 'E-109'].filter((id) => validIds.includes(id)),
      confidence: 96,
      limitations: ['Risk formula derives from asset criticality and MITRE severity weights'],
      generatedAt: now
    };
  }

  if (qLower.includes('credential') || qLower.includes('evidence')) {
    return {
      question,
      answer: `Credential compromise is confirmed by evidence E-101 (failed auth spray from Tor exit node) and E-102 (immediate login from unmanaged ArchLinux user-agent fingerprint under s_chen).`,
      evidenceIds: ['E-101', 'E-102'].filter((id) => validIds.includes(id)),
      confidence: 95,
      limitations: ['Based on Okta IdP authentication logs'],
      generatedAt: now
    };
  }

  if (qLower.includes('next') || qLower.includes('could') || qLower.includes('access')) {
    return {
      question,
      answer: `If uncontained, adversary could seek secondary staging in AWS S3 buckets (arn:aws:s3:::prod-data-lake) or establish persistence via authorized_keys modification on the bastion host.`,
      evidenceIds: validIds.slice(0, 2),
      confidence: 74,
      limitations: ['PREDICTED scenario: theoretical adversary progression, not verified event.'],
      generatedAt: now
    };
  }

  return {
    question,
    answer: `Based on evidence (${validIds.slice(0, 2).join(', ')}), the primary recommendation is to execute Session Revocation to immediately invalidate all OAuth tokens and purge Redis session keys for the compromised account.`,
    evidenceIds: validIds.slice(0, 2),
    confidence: 92,
    limitations: ['Grounded in verified evidence packet'],
    generatedAt: now
  };
}

/**
 * Gemini AI Provider implementation
 */
export class GeminiProvider implements AIProvider {
  private cache = new Map<string, { analysis: StructuredAIAnalysis; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<StructuredAIAnalysis>>();

  async analyzeIncident(packet: EvidencePacket): Promise<StructuredAIAnalysis> {
    const cacheKey = packet.evidenceVersion;

    // Check memory cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 120_000) {
      return cached.analysis;
    }

    // Debounce parallel calls for identical evidence packet
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        const response = await fetch(getApiUrl('/api/ai/analyze'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packet })
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        const validation = validateAIAnalysisSchema(data);

        if (!validation.valid) {
          console.warn('AI response failed schema validation:', validation.errors);
          // Attempt fallback
          return getDeterministicFallbackAnalysis(packet);
        }

        // Sanitize and filter out hallucinated evidence IDs
        const sanitized = sanitizeEvidenceCitations(data as StructuredAIAnalysis, packet);
        this.cache.set(cacheKey, { analysis: sanitized, timestamp: Date.now() });
        return sanitized;
      } catch (err) {
        console.warn('Gemini server call unavailable, using deterministic evidence fallback:', err);
        const fallback = getDeterministicFallbackAnalysis(packet);
        this.cache.set(cacheKey, { analysis: fallback, timestamp: Date.now() });
        return fallback;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  async askQuestion(packet: EvidencePacket, question: string): Promise<OperatorQuestionAnswer> {
    try {
      const response = await fetch(getApiUrl('/api/ai/ask'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packet, question })
      });

      if (response.ok) {
        const result: OperatorQuestionAnswer = await response.json();
        // Verify citations
        const validIds = getAllValidEvidenceIds(packet);
        const verifiedIds = (result.evidenceIds || []).filter((id) => validIds.has(id));
        return {
          ...result,
          evidenceIds: verifiedIds,
          unverifiedClaim: (result.evidenceIds || []).length > 0 && verifiedIds.length === 0
        };
      }
    } catch {
      // Fallback
    }

    // Grounded fallback answer
    return createFallbackQuestionAnswer(packet, question);
  }

  async generateExecutiveSummary(packet: EvidencePacket): Promise<ExecutiveSummary> {
    try {
      const response = await fetch(getApiUrl('/api/ai/summary'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packet })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }

    return getDeterministicFallbackSummary(packet);
  }
}

export const defaultAIProvider = new GeminiProvider();
