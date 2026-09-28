/**
 * CyberSentinel X - Risk Engine
 * Calculates deterministic dynamic risk scores (0-100) and overall SOC threat levels
 * based on asset criticality, detection rule severity, deception signals, and containment state.
 */

import { Asset, Incident, SeverityLevel, ThreatLevel } from '../types/security';

const ASSET_CRITICALITY_WEIGHTS: Record<string, number> = {
  critical: 35,
  high: 25,
  medium: 15,
  low: 5
};

const SEVERITY_WEIGHTS: Record<SeverityLevel, number> = {
  critical: 28,
  high: 18,
  medium: 10,
  low: 4,
  info: 1
};

/**
 * Calculates dynamic risk score (0-100) for a given incident.
 */
export function calculateIncidentRisk(
  incident: Partial<Incident>,
  affectedAssetsList: Asset[] = []
): number {
  // If contained and verified, residual risk is minimal (5 - 15)
  if (incident.containmentStatus?.verificationState === 'VERIFIED') {
    return 10;
  }

  // If contained but still under verification checking (20 - 30)
  if (incident.containmentStatus?.isContained) {
    return 24;
  }

  let baseRisk = 30;

  // 1. Severity weight
  const sevWeight = SEVERITY_WEIGHTS[incident.severity || 'high'] || 15;
  baseRisk += sevWeight;

  // 2. Asset criticality weighting
  let maxAssetWeight = 10;
  for (const assetId of incident.affectedAssets || []) {
    const assetObj = affectedAssetsList.find((a) => a.assetId === assetId || a.hostname === assetId);
    if (assetObj) {
      const weight = ASSET_CRITICALITY_WEIGHTS[assetObj.criticality] || 15;
      if (weight > maxAssetWeight) maxAssetWeight = weight;
    } else if (assetId.includes('db') || assetId.includes('aurora') || assetId.includes('primary')) {
      maxAssetWeight = Math.max(maxAssetWeight, 35);
    } else if (assetId.includes('bastion')) {
      maxAssetWeight = Math.max(maxAssetWeight, 25);
    }
  }
  baseRisk += maxAssetWeight;

  // 3. Deception trigger boost (conclusive threat proof)
  const hasDeception = incident.stage === 'DECEPTION TRIGGER' ||
    (incident.evidence || []).some((e) => e.type === 'token_trigger' || e.id.includes('109'));
  if (hasDeception) {
    baseRisk += 12;
  }

  // 4. Evidence count escalation
  const evCount = incident.evidenceCount || incident.evidence?.length || 1;
  baseRisk += Math.min(15, evCount * 2);

  return Math.min(99, Math.max(10, Math.round(baseRisk)));
}

/**
 * Evaluates risk score (0-100) for a specific Asset.
 */
export function evaluateAssetRisk(asset: Asset, incidents: Incident[]): number {
  if (asset.status === 'verified') return 10;
  if (asset.status === 'contained') return 25;

  const relevantIncidents = incidents.filter(
    (inc) => inc.affectedAssets.includes(asset.assetId) || inc.affectedAssets.includes(asset.hostname)
  );

  if (relevantIncidents.length === 0) {
    return asset.criticality === 'critical' ? 20 : asset.criticality === 'high' ? 15 : 5;
  }

  const maxIncidentRisk = Math.max(...relevantIncidents.map((i) => i.riskScore));
  const criticalityBonus = asset.criticality === 'critical' ? 10 : asset.criticality === 'high' ? 5 : 0;

  return Math.min(100, Math.round(maxIncidentRisk * 0.9 + criticalityBonus));
}

/**
 * Calculates overall SOC threat level across all active incidents.
 */
export function calculateOverallThreatLevel(incidents: Incident[]): ThreatLevel {
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'false_positive');
  if (activeIncidents.length === 0) return 'LOW';

  const maxRisk = Math.max(...activeIncidents.map((i) => i.riskScore));
  const hasCritical = activeIncidents.some((i) => i.severity === 'critical' && !i.containmentStatus?.isContained);
  const hasHigh = activeIncidents.some((i) => i.severity === 'high');

  if (maxRisk >= 85 || hasCritical) return 'CRITICAL';
  if (maxRisk >= 65 || hasHigh) return 'HIGH';
  if (maxRisk >= 40) return 'ELEVATED';
  return 'LOW';
}
