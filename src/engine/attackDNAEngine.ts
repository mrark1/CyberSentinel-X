/**
 * CyberSentinel X - AttackDNA Engine
 * Constructs the deterministic causal attack graph (nodes and edges) for the AttackDNA
 * visualization across standard attack stages. Returns React Flow compliant graph structures.
 */

import { Edge, MarkerType } from '@xyflow/react';
import { CustomAttackNode } from '../components/attackGraph/AttackNodeComponent';
import { Incident, SecurityEvent } from '../types/security';

export interface AttackDNAGraphResult {
  nodes: CustomAttackNode[];
  edges: Edge[];
}

interface AttackDNAStageDefinition {
  id: string;
  stage:
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
  label: string;
  subtitle: string;
  entityType: 'ip' | 'auth' | 'account' | 'privilege' | 'asset' | 'database' | 'deception' | 'containment';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source: string;
  target: string;
  confidence: number;
  evidenceIds: string[];
  details: string;
  isHoneytoken?: boolean;
  position: { x: number; y: number };
}

const ATTACK_DNA_STAGES: AttackDNAStageDefinition[] = [
  {
    id: 'node-ip',
    stage: 'INITIAL ACCESS',
    label: 'External Tor Exit Node',
    subtitle: '185.220.101.44 (ASN AS9009)',
    entityType: 'ip',
    severity: 'high',
    source: '185.220.101.44',
    target: '198.51.100.1',
    confidence: 91,
    evidenceIds: ['E-101'],
    details: 'Adversary leveraged external Tor routing to conduct rapid credential guessing against Sentinel perimeter.',
    position: { x: 300, y: 20 }
  },
  {
    id: 'node-auth',
    stage: 'CREDENTIAL ACCESS',
    label: 'Authentication Boundary',
    subtitle: 'Okta IDP (s_chen)',
    entityType: 'auth',
    severity: 'high',
    source: '185.220.101.44',
    target: 'okta-idp.sentinel.corp',
    confidence: 94,
    evidenceIds: ['E-101', 'E-102'],
    details: '5 failed authentication attempts followed by single successful session establishment.',
    position: { x: 300, y: 150 }
  },
  {
    id: 'node-account',
    stage: 'ACCOUNT COMPROMISE',
    label: 'Compromised Account',
    subtitle: 's_chen (DevOps Engineer)',
    entityType: 'account',
    severity: 'critical',
    source: 'okta-idp.sentinel.corp',
    target: 'ws-s-chen-mac',
    confidence: 96,
    evidenceIds: ['E-102', 'E-104'],
    details: 'Valid employee credential hijacked from unexpected geographical location (Bucharest, RO).',
    position: { x: 300, y: 280 }
  },
  {
    id: 'node-priv',
    stage: 'PRIVILEGE ESCALATION',
    label: 'Privilege Escalation',
    subtitle: 'sudo -u m_ross_dba su -',
    entityType: 'privilege',
    severity: 'critical',
    source: 's_chen',
    target: 'm_ross_dba_temp',
    confidence: 95,
    evidenceIds: ['E-104'],
    details: 'Elevation from standard engineer to temporary Database Administrator role without approved ticket.',
    position: { x: 300, y: 410 }
  },
  {
    id: 'node-asset',
    stage: 'LATERAL MOVEMENT',
    label: 'Internal Bastion Host',
    subtitle: 'internal-bastion-us-east',
    entityType: 'asset',
    severity: 'high',
    source: 'ws-s-chen-mac',
    target: 'internal-bastion-us-east',
    confidence: 92,
    evidenceIds: ['E-105', 'E-106'],
    details: 'SSH jump box utilized as pivot point to access restricted core database subnet 10.0.4.0/24.',
    position: { x: 300, y: 540 }
  },
  {
    id: 'node-db',
    stage: 'DATA ACCESS',
    label: 'Sensitive Asset Target',
    subtitle: 'Aurora Primary (Payroll DB)',
    entityType: 'database',
    severity: 'critical',
    source: 'internal-bastion-us-east',
    target: 'db-customer-aurora-primary',
    confidence: 94,
    evidenceIds: ['E-106', 'E-107'],
    details: 'SELECT * query executed against restricted executive compensation & employee salary records table.',
    position: { x: 180, y: 680 }
  },
  {
    id: 'node-decoy',
    stage: 'DECEPTION TRIGGER',
    label: 'Honeytoken Decoy Trigger',
    subtitle: 'db-decoy-payroll-shadow',
    entityType: 'deception',
    severity: 'critical',
    source: 'm_ross_dba_temp',
    target: 'db-decoy-payroll-shadow',
    confidence: 99,
    evidenceIds: ['E-109'],
    isHoneytoken: true,
    details: 'Adversary queried planted canary table containing fake employee records. Conclusive hostile intent.',
    position: { x: 440, y: 680 }
  },
  {
    id: 'node-contain',
    stage: 'CONTAINMENT',
    label: 'Autonomous Containment',
    subtitle: 'Token Revoked & Session Killed',
    entityType: 'containment',
    severity: 'low',
    source: 'CyberSentinel Autonomous Controller',
    target: 'okta-idp / redis / bastion',
    confidence: 98,
    evidenceIds: ['E-111'],
    details: 'User session severed, bearer tokens revoked in Redis, database connection sockets terminated.',
    position: { x: 300, y: 820 }
  },
  {
    id: 'node-verify',
    stage: 'VERIFICATION',
    label: 'Counterfactual Verification',
    subtitle: '5/5 Probes Confirmed Closed',
    entityType: 'containment',
    severity: 'low',
    source: 'CyberSentinel Verification Engine',
    target: 'production-boundary',
    confidence: 100,
    evidenceIds: ['E-113'],
    details: 'Post-action probes confirm 0 active sockets, session invalidated, lateral paths neutralized.',
    position: { x: 300, y: 950 }
  }
];

const ATTACK_DNA_EDGES: {
  id: string;
  source: string;
  target: string;
  label: string;
  relation: string;
}[] = [
  { id: 'e-ip-auth', source: 'node-ip', target: 'node-auth', label: 'Password Spray', relation: 'adversary_traffic' },
  { id: 'e-auth-acc', source: 'node-auth', target: 'node-account', label: 'Compromised Session', relation: 'token_issued' },
  { id: 'e-acc-priv', source: 'node-account', target: 'node-priv', label: 'sudo elevation', relation: 'local_escalation' },
  { id: 'e-priv-asset', source: 'node-priv', target: 'node-asset', label: 'SSH Pivot', relation: 'lateral_hop' },
  { id: 'e-asset-db', source: 'node-asset', target: 'node-db', label: 'Port 5432 Query', relation: 'data_access' },
  { id: 'e-asset-decoy', source: 'node-asset', target: 'node-decoy', label: 'Canary Trap Trip', relation: 'canary_access' },
  { id: 'e-db-contain', source: 'node-db', target: 'node-contain', label: 'Containment Triggered', relation: 'defensive_action' },
  { id: 'e-decoy-contain', source: 'node-decoy', target: 'node-contain', label: 'Trap Signal', relation: 'defensive_action' },
  { id: 'e-contain-verify', source: 'node-contain', target: 'node-verify', label: 'Verification Scan', relation: 'verified_state' }
];

/**
 * Builds the AttackDNA graph dynamically based on incident state and active simulation step.
 */
export function buildAttackDNAGraph(
  incident?: Incident,
  _events?: SecurityEvent[],
  activeNodeId?: string
): AttackDNAGraphResult {
  const isContained = Boolean(incident?.containmentStatus?.isContained);
  const isVerified = incident?.containmentStatus?.verificationState === 'VERIFIED';
  const currentActiveId = activeNodeId || (isVerified ? 'node-verify' : isContained ? 'node-contain' : 'node-db');

  const nodes: CustomAttackNode[] = ATTACK_DNA_STAGES.map((stageDef) => {
    const isActive = stageDef.id === currentActiveId;
    const isNodeContained = (stageDef.id === 'node-contain' || stageDef.id === 'node-verify') ? isContained : false;

    return {
      id: stageDef.id,
      type: 'attackNode',
      position: stageDef.position,
      data: {
        label: stageDef.label,
        subtitle: stageDef.subtitle,
        stage: stageDef.stage,
        severity: stageDef.severity,
        entityType: stageDef.entityType,
        source: stageDef.source,
        target: stageDef.target,
        confidence: stageDef.confidence,
        evidenceIds: stageDef.evidenceIds,
        isHoneytoken: stageDef.isHoneytoken,
        isActive,
        isContained: isNodeContained,
        timestamp: incident?.lastSeen || '14:32:04',
        details: stageDef.details
      }
    };
  });

  const edges: Edge[] = ATTACK_DNA_EDGES.map((e) => {
    const isHoneyEdge = e.target === 'node-decoy' || e.source === 'node-decoy';
    const isContainEdge = e.target === 'node-contain' || e.source === 'node-contain';
    const isVerifyEdge = e.target === 'node-verify';

    const strokeColor = isVerifyEdge
      ? '#10b981'
      : isContainEdge
      ? '#06b6d4'
      : isHoneyEdge
      ? '#a855f7'
      : '#ef4444';

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: isHoneyEdge || isVerifyEdge || isContainEdge,
      style: {
        stroke: strokeColor,
        strokeWidth: isHoneyEdge || isVerifyEdge ? 2.5 : 1.5,
        strokeDasharray: isHoneyEdge ? '5 5' : undefined
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
        width: 14,
        height: 14
      },
      labelStyle: {
        fill: '#94a3b8',
        fontWeight: 600,
        fontSize: 10,
        fontFamily: 'monospace'
      },
      labelBgStyle: {
        fill: '#090d16',
        fillOpacity: 0.95
      },
      labelBgPadding: [6, 2],
      labelBgBorderRadius: 4
    };
  });

  return { nodes, edges };
}
