import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
  NodeTypes
} from '@xyflow/react';
import { AttackNodeComponent, AttackNodeData, CustomAttackNode } from './AttackNodeComponent';
import { useSecurityStore } from '../../store/useSecurityStore';
import { useDemoStore } from '../../demo/demoController';
import { X, ShieldAlert, FileText, CheckCircle2, FileCode, ArrowRight, Eye, Layers, GitFork } from 'lucide-react';
import { EvidenceChip } from '../common/EvidenceModal';

const nodeTypes: NodeTypes = {
  attackNode: AttackNodeComponent as any
};

interface AttackGraphFlowProps {
  interactive?: boolean;
  activeNodeOverride?: string;
  className?: string;
}

export const AttackGraphFlow: React.FC<AttackGraphFlowProps> = ({
  interactive = true,
  activeNodeOverride,
  className = 'h-full w-full'
}) => {
  const { simulation, incidents, selectedIncidentId } = useSecurityStore();
  const { revealedNodeIds, activeNodeId: demoActiveNodeId, currentPhase } = useDemoStore();
  const [selectedNode, setSelectedNode] = useState<AttackNodeData | null>(null);
  const [showFullGraphOverride, setShowFullGraphOverride] = useState(false);

  const incident = incidents.find((i) => i.id === selectedIncidentId);
  const activeNodeId = activeNodeOverride || demoActiveNodeId || simulation.activeNodeId;
  const isContained = Boolean(incident?.containmentStatus?.isContained) || currentPhase === 'VERIFIED' || currentPhase === 'CONTAINMENT';

  // Nodes corresponding to defined attack stages
  const initialNodes: CustomAttackNode[] = useMemo(() => {
    return [
      {
        id: 'node-ip',
        type: 'attackNode',
        position: { x: 300, y: 20 },
        data: {
          label: 'External Tor Exit Node',
          subtitle: '185.220.101.44 (ASN AS9009)',
          stage: 'INITIAL ACCESS',
          severity: 'high',
          entityType: 'ip',
          source: '185.220.101.44',
          target: '198.51.100.1',
          confidence: 91,
          evidenceIds: ['E-101'],
          isActive: activeNodeId === 'node-ip',
          timestamp: '14:32:04',
          details: 'Adversary leveraged external Tor routing to conduct rapid credential guessing against Sentinel boundary.'
        }
      },
      {
        id: 'node-auth',
        type: 'attackNode',
        position: { x: 300, y: 190 },
        data: {
          label: 'IdP Authentication Bypass',
          subtitle: 'Okta SSO (Sprayed Credential)',
          stage: 'CREDENTIAL ACCESS',
          severity: 'high',
          entityType: 'auth',
          source: '185.220.101.44',
          target: 'idp-okta-sentinel-tenant',
          confidence: 94,
          evidenceIds: ['E-102'],
          isActive: activeNodeId === 'node-auth',
          timestamp: '14:32:11',
          details: '3 consecutive login failures were followed by valid credentials submission, bypassing single-factor protection.'
        }
      },
      {
        id: 'node-acc',
        type: 'attackNode',
        position: { x: 300, y: 360 },
        data: {
          label: 'Compromised DBA Principal',
          subtitle: 'm.ross@sentinel.corp (ArchLinux User-Agent)',
          stage: 'ACCOUNT COMPROMISE',
          severity: 'critical',
          entityType: 'account',
          source: 'idp-okta-sentinel-tenant',
          target: 'wkstn-mross-mac09',
          confidence: 95,
          evidenceIds: ['E-103'],
          isActive: activeNodeId === 'node-acc',
          timestamp: '14:32:17',
          details: 'Identity hijacked by foreign device fingerprint. Legitimate DBA was active on macOS Sequoia simultaneously.'
        }
      },
      {
        id: 'node-priv',
        type: 'attackNode',
        position: { x: 300, y: 530 },
        data: {
          label: 'Unsanctioned Role Escalation',
          subtitle: 'ROLE_DATA_RECOVERY_OFFICER (No MFA)',
          stage: 'PRIVILEGE ESCALATION',
          severity: 'high',
          entityType: 'privilege',
          source: 'm.ross@sentinel.corp',
          target: 'api-core-cluster-04',
          confidence: 98,
          evidenceIds: ['E-104'],
          isActive: activeNodeId === 'node-priv',
          timestamp: '14:32:31',
          details: 'Self-requested assignment of data recovery role granting broad database query permissions without manager approval.'
        }
      },
      {
        id: 'node-recon',
        type: 'attackNode',
        position: { x: 80, y: 700 },
        data: {
          label: 'Database Subnet TCP Sweep',
          subtitle: 'TCP SYN on 10.0.4.0/24 (Ports 5432, 6379)',
          stage: 'DISCOVERY',
          severity: 'medium',
          entityType: 'asset',
          source: '10.0.1.15',
          target: '10.0.4.0/24',
          confidence: 88,
          evidenceIds: ['E-105'],
          isActive: activeNodeId === 'node-recon',
          timestamp: '14:32:39',
          details: 'eBPF probe recorded systematic port scan mapping internal database listener interfaces.'
        }
      },
      {
        id: 'node-db',
        type: 'attackNode',
        position: { x: 520, y: 700 },
        data: {
          label: 'Production Aurora Cluster Access',
          subtitle: 'db-customer-aurora-primary (10.0.4.12:5432)',
          stage: 'LATERAL MOVEMENT',
          severity: 'critical',
          entityType: 'database',
          source: '10.0.1.15',
          target: 'db-customer-aurora-primary',
          confidence: 97,
          evidenceIds: ['E-106'],
          isActive: activeNodeId === 'node-db',
          timestamp: '14:32:45',
          details: 'Database connection pool connection established under elevated m_ross_dba_temp role.'
        }
      },
      {
        id: 'node-query',
        type: 'attackNode',
        position: { x: 120, y: 880 },
        data: {
          label: 'Bulk Customer Record Query',
          subtitle: 'SELECT * FROM pii_customer_vault_records',
          stage: 'DATA ACCESS',
          severity: 'critical',
          entityType: 'database',
          source: 'db-customer-aurora-primary',
          target: '10.0.1.15',
          confidence: 96,
          evidenceIds: ['E-107'],
          isActive: activeNodeId === 'node-query',
          timestamp: '14:32:51',
          details: 'Direct bulk extraction of customer records without application query layer abstraction.'
        }
      },
      {
        id: 'node-honey',
        type: 'attackNode',
        position: { x: 480, y: 880 },
        data: {
          label: 'Canary Decoy Trap Triggered',
          subtitle: 'PG_SUPERUSER_RECOVERY_KEY accessed',
          stage: 'DECEPTION TRIGGER',
          severity: 'critical',
          entityType: 'deception',
          source: '10.0.1.15',
          target: 'db-decoy-payroll-shadow',
          confidence: 100,
          evidenceIds: ['E-109'],
          isHoneytoken: true,
          isActive: activeNodeId === 'node-honey',
          timestamp: '14:32:58',
          details: 'Definitive proof: Trap credential accessed, conclusively establishing adversarial execution.'
        }
      },
      {
        id: 'node-contain',
        type: 'attackNode',
        position: { x: 300, y: 1070 },
        data: {
          label: 'Simulated Containment & Verification',
          subtitle: 'Session Revoked · 0 Active Sockets',
          stage: 'CONTAINMENT',
          severity: 'info',
          entityType: 'containment',
          source: 'Sentinel Autonomous Controller',
          target: 'db-customer-aurora-primary',
          confidence: 98,
          evidenceIds: ['E-112', 'E-113'],
          isContained: isContained || simulation.step >= 9,
          isActive: activeNodeId === 'node-contain',
          timestamp: '14:33:10',
          details: 'Autonomous containment verified: Session tokens destroyed, TCP socket terminated, lateral transmission ended.'
        }
      }
    ];
  }, [activeNodeId, isContained, simulation.step]);

  // Edges connecting the sequence
  const initialEdges: Edge[] = useMemo(() => {
    return [
      {
        id: 'e-ip-auth',
        source: 'node-ip',
        target: 'node-auth',
        label: 'T1110 Credential Stuffing',
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }
      },
      {
        id: 'e-auth-acc',
        source: 'node-auth',
        target: 'node-acc',
        label: 'T1078 Valid Account Session',
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
      },
      {
        id: 'e-acc-priv',
        source: 'node-acc',
        target: 'node-priv',
        label: 'T1098 Self-Assigned Role',
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
      },
      {
        id: 'e-priv-recon',
        source: 'node-priv',
        target: 'node-recon',
        label: 'T1046 Discovery Sweep',
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }
      },
      {
        id: 'e-priv-db',
        source: 'node-priv',
        target: 'node-db',
        label: 'Direct SQL Connect',
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
      },
      {
        id: 'e-db-query',
        source: 'node-db',
        target: 'node-query',
        label: 'T1530 Customer Table Read',
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
      },
      {
        id: 'e-db-honey',
        source: 'node-db',
        target: 'node-honey',
        label: 'T1552 Canary Scraped',
        animated: true,
        style: { stroke: '#a855f7', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' }
      },
      {
        id: 'e-query-contain',
        source: 'node-query',
        target: 'node-contain',
        label: 'Session Severed',
        animated: isContained,
        style: { stroke: isContained ? '#10b981' : '#475569', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isContained ? '#10b981' : '#475569' }
      },
      {
        id: 'e-honey-contain',
        source: 'node-honey',
        target: 'node-contain',
        label: 'Attestation Verified',
        animated: isContained,
        style: { stroke: isContained ? '#10b981' : '#475569', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isContained ? '#10b981' : '#475569' }
      }
    ];
  }, [isContained]);

  const isFlagshipIncident = selectedIncidentId === 'INC-2026-0042';

  // Progressively reveal nodes in sequence during the demo
  const visibleNodes = useMemo(() => {
    if (!isFlagshipIncident || showFullGraphOverride) {
      return initialNodes;
    }
    return initialNodes.filter((node) => revealedNodeIds.includes(node.id));
  }, [initialNodes, revealedNodeIds, isFlagshipIncident, showFullGraphOverride]);

  const visibleEdges = useMemo(() => {
    if (!isFlagshipIncident || showFullGraphOverride) {
      return initialEdges;
    }
    const nodeSet = new Set(revealedNodeIds);
    return initialEdges.filter((edge) => nodeSet.has(edge.source) && nodeSet.has(edge.target));
  }, [initialEdges, revealedNodeIds, isFlagshipIncident, showFullGraphOverride]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data as unknown as AttackNodeData);
  };

  return (
    <div className={`relative bg-[#06090e] rounded-lg border border-slate-800/80 overflow-hidden ${className}`}>
      {/* Visual Header / Legend */}
      <div className="absolute top-3 left-3 z-10 bg-[#080d1a]/95 backdrop-blur-md p-3 rounded-lg border border-cyan-500/40 text-xs font-mono shadow-xl max-w-md pointer-events-none">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-slate-100 tracking-wide">AttackDNA™ Centerpiece</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 font-bold uppercase tracking-wider">
            "This is ONE Correlated Attack"
          </span>
        </div>
        <div className="text-[11px] text-cyan-300 font-semibold mb-1">
          source → identity → privilege escalation → discovery → database → deception → containment → verification
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1">
          <span>{visibleNodes.length} / 9 stages correlated</span>
          <span className="text-purple-300 font-bold">14 Telemetry Signals Bound</span>
        </div>
      </div>

      {/* Top Right: Progressive / Full Graph Toggle */}
      {isFlagshipIncident && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setShowFullGraphOverride(!showFullGraphOverride)}
            className="px-2.5 py-1 rounded bg-[#080d1a]/90 backdrop-blur-md border border-slate-700 hover:border-cyan-500 text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            title="Toggle between progressive demo animation and full campaign graph"
          >
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>{showFullGraphOverride ? 'PROGRESSIVE VIEW' : 'SHOW FULL GRAPH'}</span>
          </button>
        </div>
      )}

      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        onNodeClick={interactive ? onNodeClick : undefined}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#1e293b" />
        {interactive && <Controls className="fill-slate-400 text-slate-400" />}
      </ReactFlow>

      {/* Selected Node Evidence Drawer */}
      {selectedNode && (
        <div className="absolute top-12 right-3 w-88 bg-[#0a101f] border border-slate-700/80 rounded-lg p-4 z-30 shadow-2xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Forensic Evidence Drawer
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs font-sans">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                ATT&CK Stage: {selectedNode.stage}
              </div>
              <div className="font-bold text-slate-100 text-sm">{selectedNode.label}</div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">{selectedNode.subtitle}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono">
              <div>
                <span className="text-slate-400">Source: </span>
                <span className="text-slate-200">{selectedNode.source}</span>
              </div>
              <div>
                <span className="text-slate-400">Target: </span>
                <span className="text-slate-200">{selectedNode.target}</span>
              </div>
              <div>
                <span className="text-slate-400">Certainty: </span>
                <span className="text-emerald-400 font-bold">{selectedNode.confidence}%</span>
              </div>
              <div>
                <span className="text-slate-400">Timestamp: </span>
                <span className="text-cyan-300">{selectedNode.timestamp}</span>
              </div>
            </div>

            {selectedNode.details && (
              <div className="p-2.5 bg-slate-950/70 rounded border border-slate-800 text-slate-300 text-xs leading-relaxed">
                {selectedNode.details}
              </div>
            )}

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1">
                Linked Evidence Artifacts
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedNode.evidenceIds.map((eid) => (
                  <EvidenceChip key={eid} id={eid} />
                ))}
              </div>
            </div>

            {selectedNode.isHoneytoken && (
              <div className="p-2.5 rounded bg-purple-950/60 border border-purple-500/50 text-purple-200 text-xs leading-relaxed">
                <strong>Deception Attestation:</strong> Access to this decoy provides unambiguous evidence of adversarial activity, excluding benign user error.
              </div>
            )}

            {selectedNode.isContained && (
              <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs leading-relaxed flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Simulated containment verified: Host communication severed.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
