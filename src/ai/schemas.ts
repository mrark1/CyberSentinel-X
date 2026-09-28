/**
 * CyberSentinel X - Sentinel AI Schemas & Type Contracts
 * Strictly defines input EvidencePacket, output AIAnalysis, ExecutiveSummary,
 * Operator Q&A, and Audit Logs.
 */

export interface EvidenceItemSummary {
  id: string;
  type: string;
  title: string;
  source: string;
  confidence: number;
  verified: boolean;
  description: string;
}

export interface EvidencePacket {
  incident: {
    id: string;
    title: string;
    severity: string;
    status: string;
    riskScore: number;
    firstSeen: string;
    lastSeen: string;
    stage: string;
    summary: string;
    techniques: string[];
    affectedUsers: string[];
    affectedAssets: string[];
  };
  detections: Array<{
    ruleId: string;
    ruleName: string;
    severity: string;
    confidence: number;
    mitreTechnique: string;
    evidenceIds: string[];
    description: string;
    asset: string;
    user: string;
  }>;
  securityEvents: Array<{
    id: string;
    timestamp: string;
    type: string;
    severity: string;
    actor: string;
    asset: string;
    action: string;
    status: string;
    evidenceRefId?: string;
    description: string;
  }>;
  evidence: EvidenceItemSummary[];
  attackDNA: Array<{
    id: string;
    stage: string;
    label: string;
    severity: string;
    source: string;
    target: string;
    confidence: number;
    evidenceIds: string[];
    details: string;
  }>;
  affectedAssets: Array<{
    assetId: string;
    hostname: string;
    ip: string;
    type: string;
    criticality: string;
    status: string;
    risk: number;
  }>;
  cyberTwinContext: {
    zones: string[];
    highValueAssets: string[];
  };
  riskAssessment: {
    riskScore: number;
    threatLevel: string;
    contributingFactors: string[];
  };
  deceptionEvents: Array<{
    id: string;
    name: string;
    type: string;
    targetAsset: string;
    status: string;
    triggerCount: number;
    lastTriggered?: string;
  }>;
  responseOptions: Array<{
    id: string;
    title: string;
    actionType: string;
    description: string;
    securityBenefit: string;
    operationalImpact: string;
    affectedAssets: string[];
  }>;
  verificationState: {
    isContained: boolean;
    verificationState: string;
    checks: Array<{
      name: string;
      status: string;
      detail?: string;
    }>;
  };
  evidenceVersion: string;
}

export interface StructuredAIAnalysis {
  incidentId: string;
  summary: string;
  observedFacts: Array<{
    statement: string;
    evidenceIds: string[];
    confidence: number;
    unverifiedClaim?: boolean;
  }>;
  inferredConclusions: Array<{
    statement: string;
    supportingEvidenceIds: string[];
    confidence: number;
    unverifiedClaim?: boolean;
  }>;
  predictedNextSteps: Array<{
    statement: string;
    basis: string;
    confidence: number;
  }>;
  attackStageAssessment: Array<{
    stage: string;
    assessment: string;
    evidenceIds: string[];
    confidence: number;
  }>;
  investigationRecommendations: Array<{
    action: string;
    reason: string;
    evidenceIds: string[];
  }>;
  responseConsiderations: Array<{
    action: string;
    rationale: string;
    expectedSecurityBenefit: string;
    operationalConsideration: string;
  }>;
  limitations: string[];
  generatedAt: string;
  isDemoFallback?: boolean;
  modelUsed?: string;
}

export interface ExecutiveSummary {
  incidentId: string;
  incidentOverview: string;
  businessImpact: string;
  affectedAssets: string[];
  securityImpact: string;
  responseStatus: string;
  verificationStatus: string;
  remainingRisk: number;
  limitations: string[];
  generatedAt: string;
  isDemoFallback?: boolean;
}

export interface OperatorQuestionAnswer {
  question: string;
  answer: string;
  evidenceIds: string[];
  confidence: number;
  limitations: string[];
  unverifiedClaim?: boolean;
  generatedAt: string;
}

export interface AIAuditRecord {
  analysisId: string;
  incidentId: string;
  timestamp: string;
  model: string;
  promptVersion: string;
  evidenceIds: string[];
  analysis: StructuredAIAnalysis;
  status: 'SUCCESS' | 'FALLBACK' | 'INVALID_JSON_CORRECTED' | 'SANITIZED';
  sanitizationCount: number;
}

/**
 * Validates whether an arbitrary object strictly conforms to StructuredAIAnalysis.
 */
export function validateAIAnalysisSchema(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Output is not an object'] };
  }

  const obj = data as Partial<StructuredAIAnalysis>;

  if (typeof obj.incidentId !== 'string' || !obj.incidentId.trim()) {
    errors.push('Missing or invalid incidentId');
  }
  if (typeof obj.summary !== 'string' || !obj.summary.trim()) {
    errors.push('Missing or invalid summary');
  }
  if (!Array.isArray(obj.observedFacts)) {
    errors.push('observedFacts must be an array');
  }
  if (!Array.isArray(obj.inferredConclusions)) {
    errors.push('inferredConclusions must be an array');
  }
  if (!Array.isArray(obj.predictedNextSteps)) {
    errors.push('predictedNextSteps must be an array');
  }
  if (!Array.isArray(obj.investigationRecommendations)) {
    errors.push('investigationRecommendations must be an array');
  }
  if (!Array.isArray(obj.responseConsiderations)) {
    errors.push('responseConsiderations must be an array');
  }
  if (!Array.isArray(obj.limitations)) {
    errors.push('limitations must be an array');
  }

  return { valid: errors.length === 0, errors };
}
