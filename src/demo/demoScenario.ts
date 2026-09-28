/**
 * CyberSentinel X - Flagship Demo Scenario Script
 * INC-2026-0042: Credential compromise leading to privileged database access
 * Master timeline, deterministic transitions, evidence mappings, and asset state synchronizer.
 */

import { DemoStepDefinition } from './demoState';

export const FLAGSHIP_INCIDENT_ID = 'INC-2026-0042';

export const DECEPTION_CALLOUT_DATA = {
  honeytokenName: 'HR-ADMIN-004 (PG_SUPERUSER_RECOVERY_KEY)',
  targetAsset: 'db-decoy-payroll-shadow',
  evidenceId: 'E-113',
  confidence: 97,
  actor: 'm_ross_dba_temp (from 185.220.101.44)',
  accessType: 'Canary shadow table credential scrape',
  timestamp: '14:33:24'
};

export const VERIFICATION_CHECKS_LIST = [
  {
    id: 'chk-1',
    name: 'Session invalidated in Okta IdP & Redis',
    target: 'Okta IdP & Redis Session Cluster',
    detail: 'OAuth2 refresh and access tokens permanently purged from Redis cache.'
  },
  {
    id: 'chk-2',
    name: 'Database connection closed on port 5432',
    target: 'db-customer-aurora-primary',
    detail: '0 active TCP sockets found for user m_ross_dba_temp; connection pool clean.'
  },
  {
    id: 'chk-3',
    name: 'Privileged token inactive',
    target: 'internal-bastion-us-east',
    detail: 'ROLE_DATA_RECOVERY_OFFICER session context stripped; root access revoked.'
  },
  {
    id: 'chk-4',
    name: 'Honeytoken access stopped',
    target: 'db-decoy-payroll-shadow',
    detail: 'Zero query probes recorded on canary decoy table over last 180 seconds.'
  },
  {
    id: 'chk-5',
    name: 'No new correlated events',
    target: 'Sentinel Autonomous Controller',
    detail: 'Telemetry stream returned to baseline. Zero unauthorized egress spikes.'
  }
];

export const CANDIDATE_ACTIONS_DATA = [
  {
    id: 'resp-revoke-session',
    title: 'Revoke User Session & Invalidate Tokens',
    badge: 'RECOMMENDED',
    securityBenefit: 'VERY HIGH (94%)',
    operationalImpact: 'LOW (0 min downtime)',
    affectedAssetsCount: 1,
    residualRisk: 10,
    confidence: 96,
    estimatedRecovery: 'Immediate (< 30s)',
    verificationPlan: '5 automated checks (Session, Socket, Token, Deception, Baseline)'
  },
  {
    id: 'resp-isolate-bastion',
    title: 'Quarantine Host Endpoint (Network Isolation)',
    badge: 'AGGRESSIVE',
    securityBenefit: 'HIGH (88%)',
    operationalImpact: 'MEDIUM (45 min downtime)',
    affectedAssetsCount: 2,
    residualRisk: 18,
    confidence: 91,
    estimatedRecovery: '45 minutes',
    verificationPlan: '2 checks (Host unreachable on port 22, route table isolated)'
  },
  {
    id: 'resp-block-ip',
    title: 'Perimeter Edge Block on Offending IP',
    badge: 'PERIMETER',
    securityBenefit: 'MEDIUM (72%)',
    operationalImpact: 'LOW (0 min downtime)',
    affectedAssetsCount: 1,
    residualRisk: 35,
    confidence: 89,
    estimatedRecovery: 'Immediate (< 10s)',
    verificationPlan: '1 check (Cloudflare & AWS WAF rate limiter synced)'
  },
  {
    id: 'resp-reset-credentials',
    title: 'Force Enterprise Credential Rotation',
    badge: 'DIRECTORY',
    securityBenefit: 'HIGH (85%)',
    operationalImpact: 'MEDIUM (15 min downtime)',
    affectedAssetsCount: 1,
    residualRisk: 22,
    confidence: 93,
    estimatedRecovery: '15 minutes',
    verificationPlan: '2 checks (Temporary password flag active, session tickets wiped)'
  }
];

export const DEMO_SCENARIO_STEPS: DemoStepDefinition[] = [
  // Step 0: IDLE
  {
    phase: 'IDLE',
    stepNumber: 0,
    timestamp: '14:31:00',
    workflowStage: 'OBSERVE',
    title: 'Baseline SOC Monitoring',
    statusMessage: 'SOC ONLINE — Routine background telemetry monitored. Threat Level LOW.',
    threatLevel: 'LOW',
    riskScore: 15,
    confidence: 50,
    activeNodeId: 'node-ip',
    revealedNodeIds: ['node-ip'],
    revealedEdgeIds: [],
    assetUpdates: {
      'ast-zn-01': 'normal',
      'ast-id-01': 'normal',
      'ast-srv-02': 'normal',
      'ast-db-01': 'normal',
      'ast-db-decoy': 'normal'
    },
    autoDelayMs: 1200
  },

  // Step 1: MONITORING
  {
    phase: 'MONITORING',
    stepNumber: 1,
    timestamp: '14:31:45',
    workflowStage: 'OBSERVE',
    title: 'Suspicious External Ingress Observed',
    statusMessage: 'External Tor Exit Node (185.220.101.44) initiating handshake probes.',
    threatLevel: 'LOW',
    riskScore: 28,
    confidence: 65,
    activeNodeId: 'node-ip',
    revealedNodeIds: ['node-ip'],
    revealedEdgeIds: [],
    assetUpdates: {
      'ast-zn-01': 'at_risk'
    },
    autoDelayMs: 1800
  },

  // Step 2: INITIAL_ACCESS
  {
    phase: 'INITIAL_ACCESS',
    stepNumber: 2,
    timestamp: '14:32:04',
    workflowStage: 'OBSERVE',
    title: 'Multiple Failed Authentication Attempts',
    statusMessage: 'E-101: 5 rapid failed authentication attempts detected from Tor exit node.',
    threatLevel: 'ELEVATED',
    riskScore: 45,
    confidence: 88,
    activeNodeId: 'node-auth',
    revealedNodeIds: ['node-ip', 'node-auth'],
    revealedEdgeIds: ['e-ip-auth'],
    assetUpdates: {
      'ast-zn-01': 'at_risk',
      'ast-id-01': 'at_risk'
    },
    evidenceTriggered: 'E-101',
    autoDelayMs: 2000
  },

  // Step 3: ACCOUNT_COMPROMISED
  {
    phase: 'ACCOUNT_COMPROMISED',
    stepNumber: 3,
    timestamp: '14:32:17',
    workflowStage: 'DETECT',
    title: 'Successful Login from Anomalous Device',
    statusMessage: 'E-102: Credential accepted for s_chen. Unrecognized ArchLinux device fingerprint.',
    threatLevel: 'ELEVATED',
    riskScore: 68,
    confidence: 92,
    activeNodeId: 'node-acc',
    revealedNodeIds: ['node-ip', 'node-auth', 'node-acc'],
    revealedEdgeIds: ['e-ip-auth', 'e-auth-acc'],
    assetUpdates: {
      'ast-id-01': 'compromised',
      'ast-srv-02': 'at_risk'
    },
    evidenceTriggered: 'E-102',
    autoDelayMs: 2200
  },

  // Step 4: PRIVILEGE_ESCALATION
  {
    phase: 'PRIVILEGE_ESCALATION',
    stepNumber: 4,
    timestamp: '14:32:31',
    workflowStage: 'DETECT',
    title: 'PRIVILEGE ESCALATION DETECTED',
    statusMessage: 'E-104: Local sudo elevation executed on bastion host -> ROLE_DATA_RECOVERY_OFFICER.',
    threatLevel: 'HIGH',
    riskScore: 82,
    confidence: 94,
    activeNodeId: 'node-priv',
    revealedNodeIds: ['node-ip', 'node-auth', 'node-acc', 'node-priv'],
    revealedEdgeIds: ['e-ip-auth', 'e-auth-acc', 'e-acc-priv'],
    assetUpdates: {
      'ast-id-01': 'compromised',
      'ast-srv-02': 'compromised',
      'ast-db-01': 'at_risk'
    },
    evidenceTriggered: 'E-104',
    autoDelayMs: 2200
  },

  // Step 5: DISCOVERY
  {
    phase: 'DISCOVERY',
    stepNumber: 5,
    timestamp: '14:32:46',
    workflowStage: 'CORRELATE',
    title: 'Internal Service Discovery / Subnet Sweep',
    statusMessage: 'E-105: Horizontal SYN port sweep against internal database subnet 10.0.4.0/24.',
    threatLevel: 'HIGH',
    riskScore: 86,
    confidence: 93,
    activeNodeId: 'node-recon',
    revealedNodeIds: ['node-ip', 'node-auth', 'node-acc', 'node-priv', 'node-recon'],
    revealedEdgeIds: ['e-ip-auth', 'e-auth-acc', 'e-acc-priv', 'e-priv-recon'],
    assetUpdates: {
      'ast-srv-02': 'compromised',
      'ast-db-01': 'at_risk'
    },
    evidenceTriggered: 'E-105',
    autoDelayMs: 2000
  },

  // Step 6: DATABASE_ACCESS
  {
    phase: 'DATABASE_ACCESS',
    stepNumber: 6,
    timestamp: '14:33:02',
    workflowStage: 'CORRELATE',
    title: 'Connection to Customer Database & Sensitive Queries',
    statusMessage: 'E-107 & E-109: Port 5432 query executed on primary customer payroll table.',
    threatLevel: 'CRITICAL',
    riskScore: 92,
    confidence: 95,
    activeNodeId: 'node-db',
    revealedNodeIds: ['node-ip', 'node-auth', 'node-acc', 'node-priv', 'node-recon', 'node-db', 'node-query'],
    revealedEdgeIds: ['e-ip-auth', 'e-auth-acc', 'e-acc-priv', 'e-priv-recon', 'e-priv-db', 'e-db-query'],
    assetUpdates: {
      'ast-db-01': 'compromised'
    },
    evidenceTriggered: 'E-107',
    autoDelayMs: 2200
  },

  // Step 7: DECEPTION_TRIGGERED
  {
    phase: 'DECEPTION_TRIGGERED',
    stepNumber: 7,
    timestamp: '14:33:24',
    workflowStage: 'CORRELATE',
    title: 'Synthetic Honeytoken Accessed (HR-ADMIN-004)',
    statusMessage: 'E-113: DECEPTION SIGNAL CONFIRMED! Honeytoken accessed in shadow database.',
    threatLevel: 'CRITICAL',
    riskScore: 96,
    confidence: 97,
    activeNodeId: 'node-honey',
    revealedNodeIds: ['node-ip', 'node-auth', 'node-acc', 'node-priv', 'node-recon', 'node-db', 'node-query', 'node-honey'],
    revealedEdgeIds: ['e-ip-auth', 'e-auth-acc', 'e-acc-priv', 'e-priv-recon', 'e-priv-db', 'e-db-query', 'e-db-honey'],
    assetUpdates: {
      'ast-db-decoy': 'compromised'
    },
    evidenceTriggered: 'E-113',
    deceptionTripped: true,
    autoDelayMs: 2800
  },

  // Step 8: CORRELATED
  {
    phase: 'CORRELATED',
    stepNumber: 8,
    timestamp: '14:33:30',
    workflowStage: 'UNDERSTAND',
    title: 'ATTACK CORRELATION COMPLETE',
    statusMessage: '7 multi-stage events correlated into single high-confidence attack narrative.',
    threatLevel: 'CRITICAL',
    riskScore: 96,
    confidence: 96,
    activeNodeId: 'node-honey',
    revealedNodeIds: ['node-ip', 'node-auth', 'node-acc', 'node-priv', 'node-recon', 'node-db', 'node-query', 'node-honey'],
    revealedEdgeIds: ['e-ip-auth', 'e-auth-acc', 'e-acc-priv', 'e-priv-recon', 'e-priv-db', 'e-db-query', 'e-db-honey'],
    assetUpdates: {},
    autoDelayMs: 1800
  },

  // Step 9: ANALYSIS_READY (Operator Decision Point)
  {
    phase: 'ANALYSIS_READY',
    stepNumber: 9,
    timestamp: '14:33:36',
    workflowStage: 'PREDICT',
    title: 'Sentinel AI Assessment Ready — Operator Review Required',
    statusMessage: 'Sentinel AI evidence-grounded assessment generated (Confidence: 96%). Awaiting operator containment review.',
    threatLevel: 'CRITICAL',
    riskScore: 96,
    confidence: 96,
    activeNodeId: 'node-honey',
    revealedNodeIds: ['node-ip', 'node-auth', 'node-acc', 'node-priv', 'node-recon', 'node-db', 'node-query', 'node-honey'],
    revealedEdgeIds: ['e-ip-auth', 'e-auth-acc', 'e-acc-priv', 'e-priv-recon', 'e-priv-db', 'e-db-query', 'e-db-honey'],
    assetUpdates: {},
    isOperatorDecisionPoint: true,
    autoDelayMs: 0
  },

  // Step 10: RESPONSE_SIMULATION (Counterfactual Simulator Modal)
  {
    phase: 'RESPONSE_SIMULATION',
    stepNumber: 10,
    timestamp: '14:33:42',
    workflowStage: 'SIMULATE',
    title: 'Counterfactual Response Evaluated',
    statusMessage: 'Action simulated: Revoke User Session (Security Benefit: 94%, Downtime: 0 min, Residual Risk: 10).',
    threatLevel: 'CRITICAL',
    riskScore: 96,
    confidence: 96,
    activeNodeId: 'node-contain',
    revealedNodeIds: ['node-ip', 'node-auth', 'node-acc', 'node-priv', 'node-recon', 'node-db', 'node-query', 'node-honey', 'node-contain'],
    revealedEdgeIds: ['e-ip-auth', 'e-auth-acc', 'e-acc-priv', 'e-priv-recon', 'e-priv-db', 'e-db-query', 'e-db-honey', 'e-honey-contain'],
    assetUpdates: {},
    isOperatorDecisionPoint: true,
    autoDelayMs: 0
  },

  // Step 11: CONTAINMENT
  {
    phase: 'CONTAINMENT',
    stepNumber: 11,
    timestamp: '14:33:48',
    workflowStage: 'CONTAIN',
    title: 'SIMULATED CONTAINMENT COMPLETE',
    statusMessage: 'SIMULATED ACTION: Tokens revoked in Redis, database TCP sockets severed, bastion isolated.',
    threatLevel: 'ELEVATED',
    riskScore: 25,
    confidence: 96,
    activeNodeId: 'node-contain',
    revealedNodeIds: ['node-ip', 'node-auth', 'node-acc', 'node-priv', 'node-recon', 'node-db', 'node-query', 'node-honey', 'node-contain'],
    revealedEdgeIds: ['e-ip-auth', 'e-auth-acc', 'e-acc-priv', 'e-priv-recon', 'e-priv-db', 'e-db-query', 'e-db-honey', 'e-honey-contain'],
    assetUpdates: {
      'ast-id-01': 'contained',
      'ast-srv-02': 'contained',
      'ast-db-01': 'contained',
      'ast-db-decoy': 'contained'
    },
    autoDelayMs: 2000
  },

  // Step 12: VERIFYING
  {
    phase: 'VERIFYING',
    stepNumber: 12,
    timestamp: '14:33:50',
    workflowStage: 'VERIFY',
    title: 'Verification In Progress (5 Cryptographic Probes)',
    statusMessage: 'Executing 5 counterfactual verification probes against simulated infrastructure state...',
    threatLevel: 'ELEVATED',
    riskScore: 20,
    confidence: 97,
    activeNodeId: 'node-contain',
    revealedNodeIds: ['node-ip', 'node-auth', 'node-acc', 'node-priv', 'node-recon', 'node-db', 'node-query', 'node-honey', 'node-contain'],
    revealedEdgeIds: ['e-ip-auth', 'e-auth-acc', 'e-acc-priv', 'e-priv-recon', 'e-priv-db', 'e-db-query', 'e-db-honey', 'e-honey-contain'],
    assetUpdates: {
      'ast-id-01': 'contained',
      'ast-db-01': 'contained'
    },
    autoDelayMs: 3200
  },

  // Step 13: VERIFIED
  {
    phase: 'VERIFIED',
    stepNumber: 13,
    timestamp: '14:33:55',
    workflowStage: 'VERIFY',
    title: '✓ CONTAINMENT VERIFIED',
    statusMessage: 'All 5 verification checks passed. 0 active sockets, session neutralized, lateral paths severed.',
    threatLevel: 'LOW',
    riskScore: 10,
    confidence: 98,
    activeNodeId: 'node-contain',
    revealedNodeIds: ['node-ip', 'node-auth', 'node-acc', 'node-priv', 'node-recon', 'node-db', 'node-query', 'node-honey', 'node-contain'],
    revealedEdgeIds: ['e-ip-auth', 'e-auth-acc', 'e-acc-priv', 'e-priv-recon', 'e-priv-db', 'e-db-query', 'e-db-honey', 'e-honey-contain'],
    assetUpdates: {
      'ast-zn-01': 'normal',
      'ast-id-01': 'verified',
      'ast-srv-02': 'verified',
      'ast-db-01': 'verified',
      'ast-db-decoy': 'verified'
    },
    autoDelayMs: 0
  }
];
