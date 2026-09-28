/**
 * CyberSentinel X - End-to-End Hackathon Demo State Machine
 * Deterministic states for the flagship demonstration scenario:
 * INC-2026-0042: Credential compromise leading to privileged database access
 */

import { AssetStatus, ThreatLevel } from '../types/security';

export type DemoPhase =
  | 'IDLE'
  | 'MONITORING'
  | 'INITIAL_ACCESS'
  | 'ACCOUNT_COMPROMISED'
  | 'PRIVILEGE_ESCALATION'
  | 'DISCOVERY'
  | 'DATABASE_ACCESS'
  | 'DECEPTION_TRIGGERED'
  | 'CORRELATED'
  | 'ANALYSIS_READY'
  | 'RESPONSE_SIMULATION'
  | 'CONTAINMENT'
  | 'VERIFYING'
  | 'VERIFIED';

export type DefenseWorkflowStage =
  | 'OBSERVE'
  | 'DETECT'
  | 'CORRELATE'
  | 'UNDERSTAND'
  | 'PREDICT'
  | 'SIMULATE'
  | 'CONTAIN'
  | 'VERIFY';

export interface DemoStepDefinition {
  phase: DemoPhase;
  stepNumber: number;
  timestamp: string;
  workflowStage: DefenseWorkflowStage;
  title: string;
  statusMessage: string;
  threatLevel: ThreatLevel;
  riskScore: number;
  confidence: number;
  activeNodeId: string;
  revealedNodeIds: string[];
  revealedEdgeIds: string[];
  assetUpdates: Record<string, AssetStatus>;
  isOperatorDecisionPoint?: boolean;
  autoDelayMs: number;
  evidenceTriggered?: string;
  deceptionTripped?: boolean;
}

export interface DemoState {
  currentPhase: DemoPhase;
  currentStepIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  activeNodeId: string;
  revealedNodeIds: string[];
  threatLevel: ThreatLevel;
  riskScore: number;
  confidence: number;
  statusMessage: string;
  workflowStage: DefenseWorkflowStage;
  selectedResponseActionId: string | null;
  isSimulatingResponse: boolean;
  isContainmentApproved: boolean;
  verificationStepIndex: number; // -1 to 5
  showDeceptionAlert: boolean;
  showIncidentResolvedModal: boolean;
  showResponseDecisionModal: boolean;
  degradedSubsystems: string[];
}
