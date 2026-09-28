/**
 * CyberSentinel X - Core Security Type Definitions
 * Evidence-First Autonomous Cyber Defense Platform
 */

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type IncidentStatus = 
  | 'open' 
  | 'triaged' 
  | 'investigating' 
  | 'containment_pending' 
  | 'contained' 
  | 'verifying' 
  | 'resolved'
  | 'false_positive';

export type ThreatLevel = 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export type AttackStage =
  | 'INITIAL ACCESS'
  | 'CREDENTIAL ACCESS'
  | 'ACCOUNT COMPROMISE'
  | 'PRIVILEGE ESCALATION'
  | 'DISCOVERY'
  | 'LATERAL MOVEMENT'
  | 'DATA ACCESS'
  | 'DECEPTION TRIGGER'
  | 'CONTAINMENT'
  | 'VERIFICATION';

export type EventSourceType = 'AUTH' | 'ENDPOINT' | 'NETWORK' | 'DATABASE' | 'CLOUD' | 'DECEPTION';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: string; // e.g. AUTH_FAILURE, AUTH_SUCCESS, PRIVILEGE_ESCALATION, NETWORK_SWEEP, DB_CONNECT, SENSITIVE_QUERY, HONEYTOKEN_TRIGGER, SESSION_REVOKED, VERIFY_PROBE
  eventType?: string; // Phase 3 expanded alias
  severity: SeverityLevel;
  source: string;
  destination?: string;
  sourceIp: string;
  destinationIp?: string;
  actor: string;
  user?: string;
  userId?: string;
  deviceId?: string;
  asset?: string;
  assetId?: string;
  action: string;
  status: 'success' | 'failure' | 'blocked' | 'detected';
  result?: 'success' | 'failure' | 'blocked' | 'detected' | string;
  description: string;
  message?: string;
  technique?: string;
  techniqueId?: string;
  techniqueName?: string;
  evidenceId?: string;
  evidenceRefId?: string; // e.g. E-101, E-102, E-109, E-113
  isSimulated?: boolean;
  metadata?: Record<string, unknown>;
  normalizedAt?: string;
  sourceType?: EventSourceType;
}

export interface RawTelemetryEvent {
  rawId?: string;
  timestamp?: string;
  sourceType: EventSourceType;
  sourceRaw: string;
  payload: Record<string, unknown>;
}

export interface DetectionFinding {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: SeverityLevel;
  confidence: number;
  mitreTechnique: string;
  mitreTactic?: string;
  evidenceIds: string[];
  description: string;
  asset: string;
  user: string;
  sourceIp?: string;
  destinationIp?: string;
  timestamp: string;
  rawEventId: string;
}

export type ResponseExecutionStatus = 'PROPOSED' | 'EXECUTING' | 'APPLIED' | 'REVERTED';

export interface ResponseActionRecord {
  id: string;
  actionId: string;
  actionType: string;
  title: string;
  targetAsset: string;
  targetUser?: string;
  status: ResponseExecutionStatus;
  appliedAt?: string;
  threatReductionPercent: number;
  businessImpactSummary: string;
}

export interface VerificationCheckItem {
  name: string;
  target?: string;
  status: 'pass' | 'fail' | 'checking' | 'pending';
  detail: string;
}

export interface VerificationResultRecord {
  verified: boolean;
  verificationState: 'NOT_VERIFIED' | 'CHECKING' | 'VERIFIED' | 'FAILED';
  verifiedAt?: string;
  checks: VerificationCheckItem[];
  notes: string;
}

export type AttackScenarioType = 'CREDENTIAL_COMPROMISE' | 'RANSOMWARE_OUTBREAK' | 'CLOUD_SUPPLY_CHAIN';

export interface Evidence {
  id: string; // e.g. E-101, E-102, E-104, E-105, E-106, E-107, E-109, E-113
  timestamp: string;
  type: 'log' | 'metric' | 'packet' | 'token_trigger' | 'behavioral_anomaly' | 'hash_match';
  source: string;
  title: string;
  description: string;
  confidence: number; // 0 - 100
  rawPayload?: Record<string, unknown>;
  verified: boolean;
}

export type AssetType = 'server' | 'database' | 'endpoint' | 'cloud_resource' | 'application' | 'network_zone' | 'identity';
export type AssetCriticality = 'critical' | 'high' | 'medium' | 'low';
export type AssetZone = 'internet' | 'perimeter' | 'dmz' | 'internal' | 'secure_core' | 'database' | 'cloud_vpc';
export type AssetStatus = 'normal' | 'at_risk' | 'compromised' | 'contained' | 'verified';

export interface Asset {
  assetId: string;
  hostname: string;
  ip: string;
  type: AssetType;
  criticality: AssetCriticality;
  owner: string;
  zone: AssetZone;
  risk: number; // 0 - 100
  status: AssetStatus;
  os?: string;
  services?: string[];
  lastActive: string;
  activeThreats?: string[];
}

export interface AttackNode {
  id: string;
  label: string;
  stage: AttackStage;
  entityType: 'ip' | 'auth' | 'account' | 'privilege' | 'asset' | 'database' | 'deception' | 'containment';
  severity: SeverityLevel;
  status: 'normal' | 'active' | 'compromised' | 'contained' | 'verified';
  timestamp: string;
  source: string;
  target: string;
  confidence: number;
  evidenceIds: string[];
  details: string;
  isHoneytoken?: boolean;
}

export interface AttackEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  confidence: number;
  highlighted?: boolean;
}

export interface AttackPath {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  probability: number;
  pathLength: number;
  nodes: string[];
  recommendedBlockPoint: string;
}

export interface DeceptionObject {
  id: string;
  name: string;
  type: 'honeytoken' | 'canary_file' | 'decoy_credential' | 'decoy_service';
  targetAsset: string;
  status: 'active' | 'triggered' | 'dormant';
  triggerCount: number;
  lastTriggered?: string;
  associatedIncidentId?: string;
  decoyLocation: string;
  plantedDate: string;
  confidenceContribution: number;
}

export interface ResponseOption {
  id: string;
  title: string;
  actionType: 'revoke_session' | 'disable_account' | 'isolate_endpoint' | 'block_source' | 'reset_credentials' | 'quarantine_process';
  description: string;
  securityBenefit: 'VERY HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  operationalImpact: 'VERY HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedAssets: string[];
  confidence: number;
  estimatedRecovery: string;
  verificationChecks: string[];
  scores: {
    securityScore: number;
    businessContinuity: number;
    recoveryComplexity: number;
  };
}

export interface SimulationResult {
  actionId: string;
  simulatedAt: string;
  outcome: 'CONTAINED' | 'PARTIALLY_CONTAINED' | 'FAILED_TO_ISOLATE';
  threatReductionPercent: number;
  businessDowntimeMinutes: number;
  remainingRiskScore: number;
  riskReduction: number;
  businessImpact: string;
  residualRisk: number;
  verificationChecks: {
    checkName: string;
    status: 'pass' | 'fail' | 'warn' | 'checking';
    detail: string;
  }[];
}

export interface AIAnalysis {
  assessment: string;
  confidence: number;
  evidenceIds: string[];
  observedFacts: string[];
  inferredConclusions: string[];
  predictedNextSteps: string[];
  recommendedInvestigation: string[];
  recommendedDefensiveActions: string[];
  lastUpdated: string;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  stage: AttackStage;
  severity: SeverityLevel;
  description: string;
  evidenceRefId?: string;
  contained?: boolean;
}

export interface Incident {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  riskScore: number;
  firstSeen: string;
  lastSeen: string;
  affectedAssets: string[];
  affectedUsers: string[];
  techniques: string[];
  confidence: number;
  stage: AttackStage;
  summary: string;
  evidenceCount: number;
  evidence: Evidence[];
  timeline: IncidentTimelineEvent[];
  aiAnalysis: AIAnalysis;
  responseOptions: ResponseOption[];
  simulationHistory?: SimulationResult[];
  containmentStatus?: {
    isContained: boolean;
    verificationState: 'NOT_VERIFIED' | 'CHECKING' | 'VERIFIED';
    containedAt?: string;
    verifiedAt?: string;
    executedAction?: string;
    verifierNotes?: string;
    checks: {
      name: string;
      status: 'pass' | 'fail' | 'checking' | 'pending';
    }[];
  };
}

export interface ReplayEvent {
  step: number;
  timestamp: string;
  title: string;
  eventType: string;
  activeNodeId: string;
  activeEdgeId?: string;
  description: string;
  evidenceTriggered?: string;
  affectedAsset: string;
  systemState: {
    riskScore: number;
    threatLevel: ThreatLevel;
    confidence: number;
    contained: boolean;
    verificationState: 'NOT_VERIFIED' | 'CHECKING' | 'VERIFIED';
  };
}

export interface IncidentReport {
  id: string;
  incidentId: string;
  title: string;
  generatedAt: string;
  generatedBy: string;
  executiveSummary: string;
  attackNarrative: string;
  affectedAssets: string[];
  evidenceSummary: {
    totalItems: number;
    highConfidenceItems: number;
    deceptionTriggers: number;
  };
  techniquesIdentified: { code: string; name: string; tactic: string }[];
  containmentVerification: {
    method: string;
    verifiedAt: string;
    result: 'CONTAINMENT VERIFIED' | 'MONITORING CONTINUED';
    verifier: string;
  };
}

export interface SystemSettings {
  detectionSensitivity: 'high' | 'balanced' | 'conservative';
  aiConfidenceThreshold: number;
  responseApprovalMode: 'human_in_the_loop' | 'semi_autonomous' | 'autonomous_low_risk';
  deceptionMode: 'active_mesh' | 'passive_canary' | 'dormant';
  demoSpeedMs: number;
  telemetryStreamEnabled: boolean;
  demoModeActive: boolean;
}
