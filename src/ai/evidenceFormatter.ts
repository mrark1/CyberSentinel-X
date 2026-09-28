/**
 * CyberSentinel X - Evidence Formatter & Privacy Sanitization Layer
 * Extracts verified evidence from application state, builds structured EvidencePackets,
 * and redacts sensitive credentials (passwords, JWTs, API keys, private tokens) before model submission.
 */

import { Asset, DeceptionObject, Incident, SecurityEvent } from '../types/security';
import { EvidencePacket } from './schemas';

// Regex patterns to identify sensitive data for privacy sanitization
const SENSITIVE_PATTERNS = [
  // Passwords
  /(password|passwd|pwd)\s*[:=]\s*['"]?([^\s'";,]+)['"]?/gi,
  // Bearer tokens / JWT
  /bearer\s+([a-zA-Z0-9_\-\.]+)/gi,
  // API keys / AWS access keys
  /(AKIA[0-9A-Z]{16})/g,
  /(api[_-]?key|secret[_-]?key)\s*[:=]\s*['"]?([^\s'";,]+)['"]?/gi,
  // Private SSH/RSA Keys
  /-----BEGIN\s+[A-Z\s]+PRIVATE\s+KEY-----[\s\S]*?-----END\s+[A-Z\s]+PRIVATE\s+KEY-----/gi,
  // Social security / Credit cards
  /\b\d{3}-\d{2}-\d{4}\b/g,
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g
];

/**
 * Sanitizes a string by replacing sensitive secrets with [REDACTED].
 */
export function sanitizeString(text: string): { sanitized: string; redactions: number } {
  if (!text) return { sanitized: text, redactions: 0 };
  let sanitized = text;
  let redactions = 0;

  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match) => {
      redactions += 1;
      return match.includes(':') || match.includes('=')
        ? match.split(/[:=]/)[0] + '=[REDACTED]'
        : '[REDACTED]';
    });
  }

  return { sanitized, redactions };
}

/**
 * Deep-sanitizes any object or array recursively.
 */
export function sanitizeObject<T>(obj: T): { sanitized: T; redactions: number } {
  let totalRedactions = 0;

  function recurse(val: any): any {
    if (typeof val === 'string') {
      const { sanitized, redactions } = sanitizeString(val);
      totalRedactions += redactions;
      return sanitized;
    }
    if (Array.isArray(val)) {
      return val.map((item) => recurse(item));
    }
    if (val !== null && typeof val === 'object') {
      const copy: Record<string, any> = {};
      for (const key of Object.keys(val)) {
        // Redact suspicious key names entirely
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('token_hash') ||
          lowerKey.includes('privatekey')
        ) {
          totalRedactions += 1;
          copy[key] = '[REDACTED]';
        } else {
          copy[key] = recurse(val[key]);
        }
      }
      return copy;
    }
    return val;
  }

  const sanitized = recurse(obj);
  return { sanitized, redactions: totalRedactions };
}

/**
 * Builds an EvidencePacket from application incident, assets, deception objects, and security events.
 */
export function buildEvidencePacket(
  incident: Incident,
  allEvents: SecurityEvent[] = [],
  allAssets: Asset[] = [],
  allDeception: DeceptionObject[] = []
): { packet: EvidencePacket; redactions: number } {
  // Filter events relevant to this incident
  const relevantEvents = allEvents.filter(
    (e) =>
      e.assetId && incident.affectedAssets.includes(e.assetId) ||
      (e.user && incident.affectedUsers.includes(e.user)) ||
      (e.actor && incident.affectedUsers.includes(e.actor))
  ).slice(0, 15);

  // Evidence list
  const evidenceSummaries = (incident.evidence || []).map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    source: e.source,
    confidence: e.confidence,
    verified: e.verified,
    description: e.description
  }));

  // AttackDNA nodes summary
  const attackDNA = (incident.timeline || []).map((t, idx) => ({
    id: `node-${idx}`,
    stage: t.stage,
    label: t.title,
    severity: t.severity,
    source: incident.affectedUsers[0] || '185.220.101.44',
    target: incident.affectedAssets[0] || '10.0.4.12',
    confidence: incident.confidence,
    evidenceIds: t.evidenceRefId ? [t.evidenceRefId] : [],
    details: t.description
  }));

  // Affected assets
  const affectedAssetsSummary = allAssets
    .filter((a) => incident.affectedAssets.includes(a.assetId) || incident.affectedAssets.includes(a.hostname))
    .map((a) => ({
      assetId: a.assetId,
      hostname: a.hostname,
      ip: a.ip,
      type: a.type,
      criticality: a.criticality,
      status: a.status,
      risk: a.risk
    }));

  // Deception objects relevant
  const deceptionEvents = allDeception.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    targetAsset: d.targetAsset,
    status: d.status,
    triggerCount: d.triggerCount,
    lastTriggered: d.lastTriggered
  }));

  // Response options
  const responseOptions = (incident.responseOptions || []).map((r) => ({
    id: r.id,
    title: r.title,
    actionType: r.actionType,
    description: r.description,
    securityBenefit: r.securityBenefit,
    operationalImpact: r.operationalImpact,
    affectedAssets: r.affectedAssets
  }));

  // Raw packet
  const rawPacket: EvidencePacket = {
    incident: {
      id: incident.id,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      riskScore: incident.riskScore,
      firstSeen: incident.firstSeen,
      lastSeen: incident.lastSeen,
      stage: incident.stage,
      summary: incident.summary,
      techniques: incident.techniques,
      affectedUsers: incident.affectedUsers,
      affectedAssets: incident.affectedAssets
    },
    detections: incident.timeline.map((t, idx) => ({
      ruleId: `DET-${idx + 1}`,
      ruleName: t.title,
      severity: t.severity,
      confidence: incident.confidence,
      mitreTechnique: incident.techniques[idx % incident.techniques.length] || 'T1078',
      evidenceIds: t.evidenceRefId ? [t.evidenceRefId] : [],
      description: t.description,
      asset: incident.affectedAssets[0] || 'db-customer-aurora-primary',
      user: incident.affectedUsers[0] || 'm_ross_dba_temp'
    })),
    securityEvents: relevantEvents.map((e) => ({
      id: e.id,
      timestamp: e.timestamp,
      type: e.type,
      severity: e.severity,
      actor: e.actor || e.user || 'system',
      asset: e.assetId || e.asset || 'bastion',
      action: e.action,
      status: e.status,
      evidenceRefId: e.evidenceRefId || e.evidenceId,
      description: e.description || e.message || ''
    })),
    evidence: evidenceSummaries,
    attackDNA,
    affectedAssets: affectedAssetsSummary,
    cyberTwinContext: {
      zones: ['perimeter', 'internal', 'database', 'cloud_vpc'],
      highValueAssets: ['db-customer-aurora-primary', 'internal-bastion-us-east']
    },
    riskAssessment: {
      riskScore: incident.riskScore,
      threatLevel: incident.riskScore > 80 ? 'CRITICAL' : 'HIGH',
      contributingFactors: [
        'Multiple failed auth attempts from Tor Exit node',
        'Unauthorized role elevation to temporary DBA without approval',
        'Restricted salary & PII queries on primary Aurora DB',
        'Canary honeytoken trap tripped'
      ]
    },
    deceptionEvents,
    responseOptions,
    verificationState: {
      isContained: Boolean(incident.containmentStatus?.isContained),
      verificationState: incident.containmentStatus?.verificationState || 'NOT_VERIFIED',
      checks: incident.containmentStatus?.checks || []
    },
    evidenceVersion: `${incident.id}-v${incident.evidenceCount}-${incident.lastSeen}-${incident.riskScore}`
  };

  const { sanitized, redactions } = sanitizeObject(rawPacket);
  return { packet: sanitized, redactions };
}

/**
 * Returns the set of all valid evidence IDs present in an EvidencePacket.
 * Used to filter and detect hallucinated evidence citations from AI output.
 */
export function getAllValidEvidenceIds(packet: EvidencePacket): Set<string> {
  const ids = new Set<string>();

  for (const ev of packet.evidence) {
    ids.add(ev.id);
  }
  for (const det of packet.detections) {
    for (const eid of det.evidenceIds) ids.add(eid);
  }
  for (const evt of packet.securityEvents) {
    if (evt.evidenceRefId) ids.add(evt.evidenceRefId);
  }
  for (const dna of packet.attackDNA) {
    for (const eid of dna.evidenceIds) ids.add(eid);
  }

  return ids;
}
