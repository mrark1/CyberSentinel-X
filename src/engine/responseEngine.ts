/**
 * CyberSentinel X - Response Engine
 * Evaluates, proposes, and executes deterministic defensive containment actions.
 * Tracks lifecycle: PROPOSED -> EXECUTING -> APPLIED -> REVERTED.
 */

import { Incident, ResponseOption, SimulationResult } from '../types/security';

export const STANDARD_RESPONSE_ACTIONS: ResponseOption[] = [
  {
    id: 'resp-revoke-session',
    title: 'Revoke User Session & Invalidate Tokens',
    actionType: 'revoke_session',
    description: 'Immediately terminate all Okta and OAuth2 bearer sessions, purge session tokens from Redis, and sever active PostgreSQL TCP sockets.',
    securityBenefit: 'VERY HIGH',
    operationalImpact: 'LOW',
    affectedAssets: ['okta-idp-prod', 'redis-auth-cache', 'db-customer-aurora-primary'],
    confidence: 96,
    estimatedRecovery: 'Immediate (< 30s)',
    verificationChecks: [
      'Okta session token revocation API confirmed',
      'Redis cache key invalidation confirmed',
      'Database connection pool socket termination confirmed'
    ],
    scores: {
      securityScore: 94,
      businessContinuity: 98,
      recoveryComplexity: 12
    }
  },
  {
    id: 'resp-isolate-bastion',
    title: 'Quarantine Host Endpoint (Network Isolation)',
    actionType: 'isolate_endpoint',
    description: 'Apply SDN microsegmentation rule to isolate internal-bastion-us-east, dropping all ingress/egress except encrypted SOC telemetry channel.',
    securityBenefit: 'HIGH',
    operationalImpact: 'MEDIUM',
    affectedAssets: ['internal-bastion-us-east'],
    confidence: 91,
    estimatedRecovery: '45 minutes',
    verificationChecks: [
      'Host unreachable on port 22 (SSH)',
      'Subnet routing rule verified active in AWS VPC route table'
    ],
    scores: {
      securityScore: 88,
      businessContinuity: 75,
      recoveryComplexity: 45
    }
  },
  {
    id: 'resp-block-ip',
    title: 'Perimeter Edge Block on Offending IP',
    actionType: 'block_source',
    description: 'Push immediate DROP rule to perimeter edge firewall and Cloudflare WAF for adversary source IP 185.220.101.44.',
    securityBenefit: 'MEDIUM',
    operationalImpact: 'LOW',
    affectedAssets: ['perimeter-firewall-01'],
    confidence: 89,
    estimatedRecovery: 'Immediate (< 10s)',
    verificationChecks: [
      'Perimeter firewall DROP rule synced across all 3 zones',
      'WAF rate limiter confirmed active'
    ],
    scores: {
      securityScore: 72,
      businessContinuity: 100,
      recoveryComplexity: 5
    }
  },
  {
    id: 'resp-reset-credentials',
    title: 'Force Enterprise Credential Rotation',
    actionType: 'reset_credentials',
    description: 'Force immediate password reset and MFA re-enrollment for compromised DevOps accounts.',
    securityBenefit: 'HIGH',
    operationalImpact: 'MEDIUM',
    affectedAssets: ['okta-idp-prod'],
    confidence: 93,
    estimatedRecovery: '15 minutes',
    verificationChecks: [
      'Temporary password flag set in directory service',
      'Previous session keys permanently invalidated'
    ],
    scores: {
      securityScore: 85,
      businessContinuity: 82,
      recoveryComplexity: 25
    }
  }
];

/**
 * Returns available response options suited for the incident.
 */
export function getResponseOptionsForIncident(_incident: Incident): ResponseOption[] {
  return STANDARD_RESPONSE_ACTIONS;
}

/**
 * Simulates execution of a containment action against the incident and returns
 * updated incident and the deterministic SimulationResult.
 */
export function executeResponseAction(
  incident: Incident,
  actionId: string
): { updatedIncident: Incident; result: SimulationResult } {
  const action = STANDARD_RESPONSE_ACTIONS.find((a) => a.id === actionId) || STANDARD_RESPONSE_ACTIONS[0];
  const now = new Date().toTimeString().slice(0, 8);

  const securityScore = action.scores.securityScore;
  const downtime = action.actionType === 'isolate_endpoint' ? 45 : 0;
  const residualRisk = Math.max(8, Math.round(incident.riskScore * (1 - securityScore / 100)));

  const result: SimulationResult = {
    actionId: action.id,
    simulatedAt: now,
    outcome: 'CONTAINED',
    threatReductionPercent: securityScore,
    businessDowntimeMinutes: downtime,
    remainingRiskScore: residualRisk,
    riskReduction: incident.riskScore - residualRisk,
    businessImpact: downtime > 0 ? `${downtime} min scheduled downtime for isolated host.` : 'Zero operational downtime; session killed instantaneously.',
    residualRisk,
    verificationChecks: [
      { checkName: 'Session invalidated in Okta IdP and Redis token cache', status: 'pass', detail: 'OAuth refresh and access tokens revoked.' },
      { checkName: 'Database connection closed on port 5432', status: 'pass', detail: '0 active sockets for compromised account.' },
      { checkName: 'Privileged token inactive', status: 'pass', detail: 'Elevated role session context stripped.' },
      { checkName: 'Honeytoken access stopped', status: 'pass', detail: 'No further queries recorded against decoy tables.' },
      { checkName: 'No new correlated events', status: 'pass', detail: 'Telemetry stream returned to baseline levels.' }
    ]
  };

  const updatedIncident: Incident = {
    ...incident,
    status: 'contained',
    riskScore: residualRisk,
    stage: 'CONTAINMENT',
    simulationHistory: [result, ...(incident.simulationHistory || [])],
    containmentStatus: {
      isContained: true,
      verificationState: 'VERIFIED',
      containedAt: now,
      verifiedAt: now,
      executedAction: action.title,
      verifierNotes: 'Autonomous containment applied. 5/5 automated verification checks confirmed closed.',
      checks: [
        { name: 'Session invalidated', status: 'pass' },
        { name: 'Database connection closed', status: 'pass' },
        { name: 'Privileged token inactive', status: 'pass' },
        { name: 'Honeytoken access stopped', status: 'pass' },
        { name: 'No new correlated events', status: 'pass' }
      ]
    }
  };

  return { updatedIncident, result };
}
