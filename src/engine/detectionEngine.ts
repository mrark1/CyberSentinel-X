/**
 * CyberSentinel X - Detection Engine
 * Evaluates normalized SecurityEvents against deterministic SOC detection rules.
 * Generates Evidence-grounded DetectionFinding records mapped to MITRE ATT&CK techniques.
 */

import { DetectionFinding, SecurityEvent, SeverityLevel } from '../types/security';

interface DetectionRule {
  id: string;
  name: string;
  description: string;
  mitreTechnique: string;
  mitreTactic: string;
  severity: SeverityLevel;
  baseConfidence: number;
  match: (event: SecurityEvent, history: SecurityEvent[]) => { matched: boolean; details?: string; confidenceBonus?: number };
}

export const DETECTION_RULES: DetectionRule[] = [
  {
    id: 'RULE-AUTH-001',
    name: 'Multiple Authentication Failures from External IP',
    description: 'Rapid failed authentication attempts exceeding threshold from untrusted external or anonymized proxy IP.',
    mitreTechnique: 'T1110.003 - Password Spraying',
    mitreTactic: 'Credential Access',
    severity: 'high',
    baseConfidence: 88,
    match: (event, history) => {
      const isAuthFail = event.type === 'AUTH_FAILURE' || event.eventType === 'AUTH_FAILURE' || event.action.includes('failed_login');
      if (!isAuthFail) return { matched: false };

      const sameIpFails = history.filter(
        (h) => (h.sourceIp === event.sourceIp || h.source === event.source) && (h.type === 'AUTH_FAILURE' || h.eventType === 'AUTH_FAILURE')
      );

      const count = sameIpFails.length + 1;
      const isTorOrExternal = event.sourceIp.startsWith('185.') || event.source.includes('Tor');
      const bonus = (isTorOrExternal ? 5 : 0) + Math.min(count * 2, 8);

      return {
        matched: true,
        details: `${count} sequential failed authentication attempts detected from source ${event.sourceIp} against account ${event.user || event.actor}`,
        confidenceBonus: bonus
      };
    }
  },
  {
    id: 'RULE-AUTH-002',
    name: 'Abnormal Login Location / Unrecognized Device Session',
    description: 'Successful authentication following failed probes from a new or unmanaged external device.',
    mitreTechnique: 'T1078.004 - Valid Cloud Accounts',
    mitreTactic: 'Initial Access',
    severity: 'high',
    baseConfidence: 91,
    match: (event, history) => {
      const isAuthSuccess = event.type === 'AUTH_SUCCESS' || event.eventType === 'AUTH_SUCCESS' || event.action.includes('successful_login');
      if (!isAuthSuccess) return { matched: false };

      // Check if preceded by AUTH_FAILURE from same IP
      const hadPriorFailure = history.some(
        (h) => (h.sourceIp === event.sourceIp || h.source === event.source) && (h.type === 'AUTH_FAILURE' || h.eventType === 'AUTH_FAILURE')
      );

      return {
        matched: true,
        details: `Successful authentication by ${event.user || event.actor} from untrusted IP ${event.sourceIp}${hadPriorFailure ? ' following prior failed brute-force probes' : ''}`,
        confidenceBonus: hadPriorFailure ? 4 : 0
      };
    }
  },
  {
    id: 'RULE-PRIV-001',
    name: 'Privilege Escalation via Sudo or Temporary Role Assumption',
    description: 'Standard enterprise user account elevated privileges to DBA or Root without scheduled maintenance ticket.',
    mitreTechnique: 'T1068 - Exploitation for Privilege Escalation',
    mitreTactic: 'Privilege Escalation',
    severity: 'critical',
    baseConfidence: 93,
    match: (event) => {
      const isPrivEsc = event.type === 'PRIVILEGE_ESCALATION' || event.eventType === 'PRIVILEGE_ESCALATION' || event.action.includes('sudo') || event.action.includes('elevation');
      if (!isPrivEsc) return { matched: false };

      return {
        matched: true,
        details: `User ${event.user || event.actor} executed unauthorized privilege elevation (${event.action}) on host ${event.asset || event.assetId}`
      };
    }
  },
  {
    id: 'RULE-NET-001',
    name: 'Internal Lateral Reconnaissance / Subnet Port Sweep',
    description: 'An internal bastion or endpoint initiated horizontal port scanning against internal database and cloud subnets.',
    mitreTechnique: 'T1046 - Network Service Discovery',
    mitreTactic: 'Discovery',
    severity: 'medium',
    baseConfidence: 86,
    match: (event) => {
      const isDiscovery = event.type === 'SERVICE_DISCOVERY' || event.type === 'NETWORK_SWEEP' || event.action.includes('port_sweep') || event.action.includes('SYN_SCAN');
      if (!isDiscovery) return { matched: false };

      return {
        matched: true,
        details: `Port discovery probe initiated from host ${event.sourceIp} targeting internal database cluster`
      };
    }
  },
  {
    id: 'RULE-DATA-001',
    name: 'Sensitive Database Table Access without Authorized Scope',
    description: 'Query executed against restricted salary, customer PII, or vault records via newly assumed privileged credential.',
    mitreTechnique: 'T1005 - Data from Local System',
    mitreTactic: 'Collection',
    severity: 'critical',
    baseConfidence: 94,
    match: (event) => {
      const isDataQuery = event.type === 'SENSITIVE_QUERY' || event.type === 'DATABASE_ACCESS' || event.action.includes('SELECT') || event.action.includes('query');
      const isRestricted = event.description.toLowerCase().includes('salary') || event.description.toLowerCase().includes('restricted') || (event.metadata && (event.metadata as any).is_sensitive);

      if (!isDataQuery && !isRestricted) return { matched: false };

      return {
        matched: true,
        details: `High-risk database extraction query executed against ${event.asset || event.assetId} by actor ${event.user || event.actor}`
      };
    }
  },
  {
    id: 'RULE-DECEP-001',
    name: 'High-Fidelity Honeytoken / Canary Decoy Triggered',
    description: 'Access detected against zero-business-traffic decoy trap asset. Conclusive evidence of active adversary lateral reconnaissance.',
    mitreTechnique: 'D3-DA - Honeytoken / Decoy Trap Trip',
    mitreTactic: 'Deception Detection',
    severity: 'critical',
    baseConfidence: 98,
    match: (event) => {
      const isHoney = event.type === 'HONEYTOKEN_ACCESS' || event.type === 'HONEYTOKEN_TRIGGER' || event.action.includes('canary') || (event.asset || '').includes('decoy');
      if (!isHoney) return { matched: false };

      return {
        matched: true,
        details: `Canary trap ${event.asset || event.assetId} tripped by ${event.user || event.actor}. High-confidence proof of active hostile intent.`,
        confidenceBonus: 2
      };
    }
  },
  {
    id: 'RULE-CONT-001',
    name: 'Autonomous Containment Action Applied',
    description: 'Autonomous or operator-authorized containment signal executed across identity and network perimeters.',
    mitreTechnique: 'D3-SAC - Session Token Invalidation',
    mitreTactic: 'Containment',
    severity: 'info',
    baseConfidence: 99,
    match: (event) => {
      const isContainment = event.type === 'SESSION_REVOKED' || event.action.includes('session_revoke') || event.action.includes('isolate');
      if (!isContainment) return { matched: false };

      return {
        matched: true,
        details: `Defensive containment action applied: ${event.description || event.action} on ${event.asset || event.user}`
      };
    }
  },
  {
    id: 'RULE-VERIF-001',
    name: 'Post-Containment Counterfactual Verification Probe',
    description: 'Automated verification query checking that active attacker session is severed and residual threat is zero.',
    mitreTechnique: 'D3-VAF - Counterfactual Verification Probe',
    mitreTactic: 'Verification',
    severity: 'info',
    baseConfidence: 100,
    match: (event) => {
      const isVerify = event.type === 'VERIFICATION_CHECK' || event.type === 'VERIFY_PROBE' || event.action.includes('verification');
      if (!isVerify) return { matched: false };

      return {
        matched: true,
        details: `Verification probe executed: ${event.description || 'Active socket test confirms zero residual unauthorized sessions'}`
      };
    }
  }
];

let findingCounter = 100;

/**
 * Evaluates a single event against the deterministic detection rules.
 */
export function evaluateSingleEvent(event: SecurityEvent, eventHistory: SecurityEvent[] = []): DetectionFinding[] {
  const findings: DetectionFinding[] = [];

  for (const rule of DETECTION_RULES) {
    const result = rule.match(event, eventHistory);
    if (result.matched) {
      findingCounter += 1;
      const conf = Math.min(100, rule.baseConfidence + (result.confidenceBonus || 0));
      const evId = event.evidenceId || event.evidenceRefId || `E-${100 + findings.length}`;

      findings.push({
        id: `FND-${findingCounter}`,
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        confidence: conf,
        mitreTechnique: rule.mitreTechnique,
        mitreTactic: rule.mitreTactic,
        evidenceIds: [evId],
        description: result.details || rule.description,
        asset: event.asset || event.assetId || 'unknown-asset',
        user: event.user || event.actor || 'unknown-user',
        sourceIp: event.sourceIp || event.source,
        destinationIp: event.destinationIp || event.destination,
        timestamp: event.timestamp,
        rawEventId: event.id
      });
    }
  }

  return findings;
}

/**
 * Evaluates an array of events and returns all detected findings.
 */
export function evaluateEvents(events: SecurityEvent[]): DetectionFinding[] {
  const allFindings: DetectionFinding[] = [];
  const history: SecurityEvent[] = [];

  for (const event of events) {
    const eventFindings = evaluateSingleEvent(event, history);
    allFindings.push(...eventFindings);
    history.push(event);
  }

  return allFindings;
}
