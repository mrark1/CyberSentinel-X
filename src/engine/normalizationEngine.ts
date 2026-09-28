/**
 * CyberSentinel X - Normalization Engine
 * Normalizes disparate synthetic security telemetry sources (AUTH, ENDPOINT, NETWORK,
 * DATABASE, CLOUD, DECEPTION) into a standard, unified SecurityEvent schema.
 */

import { EventSourceType, RawTelemetryEvent, SecurityEvent, SeverityLevel } from '../types/security';

let evidenceCounter = 120;

export function generateEvidenceId(prefix = 'E'): string {
  evidenceCounter += 1;
  return `${prefix}-${evidenceCounter}`;
}

/**
 * Normalizes a raw synthetic event payload into the standard SecurityEvent schema.
 */
export function normalizeEvent(raw: RawTelemetryEvent | Partial<SecurityEvent>): SecurityEvent {
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);
  const normalizedAt = now.toISOString();

  // If already partially shaped as SecurityEvent
  if ('action' in raw && 'source' in raw && !('payload' in raw)) {
    const secEvent = raw as Partial<SecurityEvent>;
    const eventType = secEvent.eventType || secEvent.type || 'SYSTEM_TELEMETRY';
    const evidenceId = secEvent.evidenceId || secEvent.evidenceRefId || deriveEvidenceId(eventType);
    const user = secEvent.user || secEvent.actor || secEvent.userId || 'system';
    const asset = secEvent.asset || secEvent.assetId || 'sentinel-core';
    const message = secEvent.message || secEvent.description || `Event ${eventType} recorded on ${asset}`;
    const status = secEvent.status || (secEvent.result === 'failure' ? 'failure' : 'detected');

    return {
      id: secEvent.id || `evt-norm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: secEvent.timestamp || timeStr,
      type: eventType,
      eventType,
      severity: secEvent.severity || deriveSeverity(eventType),
      source: secEvent.source || '10.0.0.1',
      sourceIp: secEvent.sourceIp || secEvent.source || '10.0.0.1',
      destination: secEvent.destination || secEvent.destinationIp || '10.0.4.12',
      destinationIp: secEvent.destinationIp || secEvent.destination || '10.0.4.12',
      actor: user,
      user,
      userId: secEvent.userId || user,
      deviceId: secEvent.deviceId,
      asset,
      assetId: asset,
      action: secEvent.action || eventType.toLowerCase(),
      status,
      result: status,
      description: message,
      message,
      technique: secEvent.technique || secEvent.techniqueName,
      techniqueId: secEvent.techniqueId || deriveTechnique(eventType).id,
      techniqueName: secEvent.techniqueName || secEvent.technique || deriveTechnique(eventType).name,
      evidenceId,
      evidenceRefId: evidenceId,
      isSimulated: secEvent.isSimulated !== false,
      metadata: secEvent.metadata || {},
      normalizedAt,
      sourceType: secEvent.sourceType || deriveSourceType(eventType)
    };
  }

  // Handle RawTelemetryEvent
  const rawTel = raw as RawTelemetryEvent;
  const p = rawTel.payload || {};
  const sourceType = rawTel.sourceType || 'ENDPOINT';

  let eventType = 'TELEMETRY_SAMPLE';
  let severity: SeverityLevel = 'info';
  let user = 'svc_sentinel';
  let asset = 'core-bastion-01';
  let sourceIp = '10.0.0.1';
  let destinationIp = '10.0.4.12';
  let action = 'probe';
  let status: 'success' | 'failure' | 'blocked' | 'detected' = 'success';
  let message = 'Raw telemetry sample processed.';
  let evidenceId = deriveEvidenceId(eventType);

  switch (sourceType) {
    case 'AUTH': {
      // e.g. Okta, Azure AD, Linux PAM
      const isFail = p.outcome === 'FAILURE' || p.status === 'failure' || p.action === 'failed_login';
      eventType = isFail ? 'AUTH_FAILURE' : 'AUTH_SUCCESS';
      severity = isFail ? 'high' : 'info';
      user = String(p.user || p.username || p.actor || 's_chen');
      sourceIp = String(p.ip || p.src_ip || p.client_ip || '185.220.101.44');
      destinationIp = String(p.dst_ip || '198.51.100.1');
      asset = String(p.service || p.app || 'okta-idp-prod');
      action = String(p.action || (isFail ? 'login_rejected' : 'session_granted'));
      status = isFail ? 'failure' : 'success';
      message = `Authentication ${isFail ? 'failed' : 'succeeded'} for user ${user} from ${sourceIp}`;
      evidenceId = isFail ? 'E-101' : 'E-102';
      break;
    }

    case 'ENDPOINT': {
      // Host telemetry (Auditd, Sysmon, EDR)
      const isElevation = Boolean(p.elevation || p.is_elevated || p.action === 'sudo_su');
      eventType = isElevation ? 'PRIVILEGE_ESCALATION' : 'PROCESS_SPAWN';
      severity = isElevation ? 'high' : 'low';
      user = String(p.user || p.username || 's_chen');
      asset = String(p.host || p.hostname || 'internal-bastion-us-east');
      action = String(p.process || p.command || 'sudo -u root');
      sourceIp = '10.0.1.15';
      destinationIp = '10.0.1.1';
      status = 'detected';
      message = isElevation
        ? `Privilege escalation attempt observed on host ${asset}: ${action}`
        : `Process ${action} executed by ${user} on ${asset}`;
      evidenceId = isElevation ? 'E-104' : generateEvidenceId();
      break;
    }

    case 'NETWORK': {
      // Zeek, Suricata, VPC flow
      const isSweep = p.flag === 'SYN_SCAN' || p.ports_scanned;
      eventType = isSweep ? 'SERVICE_DISCOVERY' : 'NETWORK_FLOW';
      severity = isSweep ? 'high' : 'info';
      sourceIp = String(p.src_ip || '10.0.1.15');
      destinationIp = String(p.dst_ip || '10.0.4.12');
      asset = String(p.target_asset || 'secure-subnet-zone-a');
      action = isSweep ? 'port_sweep_syn' : 'tcp_established';
      status = isSweep ? 'detected' : 'success';
      message = isSweep
        ? `Horizontal port discovery detected from ${sourceIp} against internal subnet`
        : `Inbound flow established: ${sourceIp} -> ${destinationIp}:${p.dst_port || 443}`;
      evidenceId = isSweep ? 'E-105' : generateEvidenceId();
      break;
    }

    case 'DATABASE': {
      // Database query logs
      const isSensitive = Boolean(p.is_sensitive || p.table === 'payroll' || p.rows_returned && (p.rows_returned as number) > 100);
      eventType = isSensitive ? 'SENSITIVE_QUERY' : 'DATABASE_ACCESS';
      severity = isSensitive ? 'critical' : 'medium';
      user = String(p.db_user || p.user || 'm_ross_dba_temp');
      asset = String(p.database || 'db-customer-aurora-primary');
      sourceIp = String(p.client_ip || '10.0.1.15');
      destinationIp = String(p.db_ip || '10.0.4.12');
      action = String(p.query || 'SELECT * FROM salary_records_restricted');
      status = 'detected';
      message = `Query executed on ${asset} by ${user}: ${action}`;
      evidenceId = isSensitive ? 'E-107' : 'E-106';
      break;
    }

    case 'CLOUD': {
      // CloudTrail / GCP Audit
      eventType = p.action === 'AssumeRole' ? 'PRIVILEGE_ESCALATION' : 'CLOUD_API_CALL';
      severity = eventType === 'PRIVILEGE_ESCALATION' ? 'high' : 'low';
      user = String(p.principal || p.user || 'arn:aws:iam::role/DeployBot');
      asset = String(p.resource || 'arn:aws:s3:::prod-data-lake');
      sourceIp = String(p.source_ip || '54.239.28.85');
      action = String(p.action || 'GetObject');
      status = 'success';
      message = `Cloud action ${action} invoked by ${user} on ${asset}`;
      evidenceId = generateEvidenceId();
      break;
    }

    case 'DECEPTION': {
      // Honeytokens, Canary tables, Decoy files
      eventType = 'HONEYTOKEN_ACCESS';
      severity = 'critical';
      user = String(p.accessor || p.user || 'm_ross_dba_temp');
      asset = String(p.trap_name || p.target_asset || 'db-decoy-payroll-shadow');
      sourceIp = String(p.src_ip || '185.220.101.44');
      destinationIp = String(p.dst_ip || '10.0.4.99');
      action = String(p.access_type || 'canary_access_probe');
      status = 'detected';
      message = `CRITICAL: Canary trap tripped! Decoy asset ${asset} accessed by ${user}`;
      evidenceId = 'E-109';
      break;
    }
  }

  const tech = deriveTechnique(eventType);

  return {
    id: rawTel.rawId || `evt-norm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: rawTel.timestamp || timeStr,
    type: eventType,
    eventType,
    severity,
    source: sourceIp,
    sourceIp,
    destination: destinationIp,
    destinationIp,
    actor: user,
    user,
    userId: user,
    asset,
    assetId: asset,
    action,
    status,
    result: status,
    description: message,
    message,
    technique: tech.name,
    techniqueId: tech.id,
    techniqueName: tech.name,
    evidenceId,
    evidenceRefId: evidenceId,
    isSimulated: true,
    metadata: p,
    normalizedAt,
    sourceType
  };
}

/**
 * Batch normalizes an array of raw telemetry records.
 */
export function normalizeEvents(rawItems: (RawTelemetryEvent | Partial<SecurityEvent>)[]): SecurityEvent[] {
  return rawItems.map((item) => normalizeEvent(item));
}

// Helpers
function deriveSourceType(eventType: string): EventSourceType {
  if (eventType.includes('AUTH') || eventType.includes('LOGIN')) return 'AUTH';
  if (eventType.includes('PRIV') || eventType.includes('PROCESS') || eventType.includes('HOST')) return 'ENDPOINT';
  if (eventType.includes('SWEEP') || eventType.includes('NET') || eventType.includes('PORT')) return 'NETWORK';
  if (eventType.includes('DB') || eventType.includes('QUERY') || eventType.includes('DATABASE')) return 'DATABASE';
  if (eventType.includes('CLOUD') || eventType.includes('IAM')) return 'CLOUD';
  if (eventType.includes('HONEY') || eventType.includes('CANARY') || eventType.includes('DECOY')) return 'DECEPTION';
  return 'ENDPOINT';
}

function deriveSeverity(eventType: string): SeverityLevel {
  if (eventType.includes('HONEY') || eventType.includes('CANARY') || eventType.includes('CRITICAL')) return 'critical';
  if (eventType.includes('PRIVILEGE') || eventType.includes('SENSITIVE') || eventType.includes('FAILURE')) return 'high';
  if (eventType.includes('DISCOVERY') || eventType.includes('SWEEP') || eventType.includes('DB_CONNECT')) return 'medium';
  if (eventType.includes('SUCCESS') || eventType.includes('PROBE')) return 'info';
  return 'low';
}

function deriveTechnique(eventType: string): { id: string; name: string } {
  switch (eventType) {
    case 'AUTH_FAILURE':
      return { id: 'T1110.003', name: 'Password Spraying' };
    case 'AUTH_SUCCESS':
    case 'NEW_DEVICE_LOGIN':
      return { id: 'T1078.004', name: 'Valid Cloud Accounts' };
    case 'PRIVILEGE_ESCALATION':
      return { id: 'T1068', name: 'Exploitation for Privilege Escalation' };
    case 'SERVICE_DISCOVERY':
    case 'NETWORK_SWEEP':
      return { id: 'T1046', name: 'Network Service Discovery' };
    case 'DATABASE_ACCESS':
    case 'DB_CONNECT':
      return { id: 'T1199', name: 'Trusted Relationship' };
    case 'SENSITIVE_QUERY':
      return { id: 'T1005', name: 'Data from Local System' };
    case 'HONEYTOKEN_ACCESS':
    case 'HONEYTOKEN_TRIGGER':
      return { id: 'D3-DA', name: 'Honeytoken / Decoy Trap Trip' };
    case 'SESSION_REVOKED':
      return { id: 'D3-SAC', name: 'Session Token Invalidation (Containment)' };
    case 'VERIFICATION_CHECK':
      return { id: 'D3-VAF', name: 'Counterfactual Verification Probe' };
    default:
      return { id: 'T1082', name: 'System Information Discovery' };
  }
}

function deriveEvidenceId(eventType: string): string {
  switch (eventType) {
    case 'AUTH_FAILURE':
      return 'E-101';
    case 'AUTH_SUCCESS':
      return 'E-102';
    case 'NEW_DEVICE_LOGIN':
      return 'E-103';
    case 'PRIVILEGE_ESCALATION':
      return 'E-104';
    case 'SERVICE_DISCOVERY':
    case 'NETWORK_SWEEP':
      return 'E-105';
    case 'DATABASE_ACCESS':
    case 'DB_CONNECT':
      return 'E-106';
    case 'SENSITIVE_QUERY':
      return 'E-107';
    case 'HONEYTOKEN_ACCESS':
    case 'HONEYTOKEN_TRIGGER':
      return 'E-109';
    case 'SESSION_REVOKED':
      return 'E-111';
    case 'VERIFICATION_CHECK':
      return 'E-113';
    default:
      return generateEvidenceId();
  }
}
