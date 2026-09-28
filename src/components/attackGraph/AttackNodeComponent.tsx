import React, { memo } from 'react';
import { Handle, Position, Node, NodeProps } from '@xyflow/react';
import {
  Globe,
  KeyRound,
  UserX,
  ShieldAlert,
  Database,
  Crosshair,
  CheckCircle,
  FileCode,
  Radio,
  FileText
} from 'lucide-react';
import { AttackStage, SeverityLevel } from '../../types/security';
import { EvidenceChip } from '../common/EvidenceModal';

export interface AttackNodeData extends Record<string, unknown> {
  label: string;
  stage: AttackStage;
  subtitle: string;
  severity: SeverityLevel;
  entityType: 'ip' | 'auth' | 'account' | 'privilege' | 'asset' | 'database' | 'deception' | 'containment';
  source: string;
  target: string;
  confidence: number;
  evidenceIds: string[];
  isHoneytoken?: boolean;
  isActive?: boolean;
  isContained?: boolean;
  timestamp: string;
  details?: string;
}

export type CustomAttackNode = Node<AttackNodeData, 'attackNode'>;

export const AttackNodeComponent = memo((props: NodeProps<CustomAttackNode>) => {
  const nodeData = props.data;

  const getIcon = () => {
    switch (nodeData.entityType) {
      case 'ip':
        return <Globe className="w-4 h-4 text-amber-400" />;
      case 'auth':
        return <KeyRound className="w-4 h-4 text-red-400" />;
      case 'account':
        return <UserX className="w-4 h-4 text-red-400" />;
      case 'privilege':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'asset':
      case 'database':
        return <Database className="w-4 h-4 text-red-400" />;
      case 'deception':
        return <Crosshair className="w-4 h-4 text-purple-400" />;
      case 'containment':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <Radio className="w-4 h-4 text-cyan-400" />;
    }
  };

  const borderClass = nodeData.isHoneytoken
    ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-purple-950/40'
    : nodeData.isContained
    ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-950/40'
    : nodeData.isActive
    ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/50 bg-cyan-950/40'
    : nodeData.severity === 'critical'
    ? 'border-red-500/80 bg-red-950/20 hover:border-red-400'
    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700';

  return (
    <div
      className={`min-w-[260px] max-w-[300px] rounded-lg border p-3.5 transition-all text-left shadow-lg backdrop-blur-sm cursor-pointer ${borderClass}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-2.5 !h-2.5" />

      {/* Header: Stage and Severity */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
          {nodeData.stage}
        </span>
        <div className="flex items-center gap-1.5">
          {nodeData.isHoneytoken && (
            <span className="text-[9px] font-mono bg-purple-900/80 text-purple-300 border border-purple-500/40 px-1 rounded uppercase font-bold">
              Honeytoken
            </span>
          )}
          {nodeData.isContained && (
            <span className="text-[9px] font-mono bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 px-1 rounded uppercase font-bold">
              Contained
            </span>
          )}
          {nodeData.isActive && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          )}
        </div>
      </div>

      {/* Title & Icon */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="p-1.5 rounded bg-slate-800/80 border border-slate-700/60 shrink-0">
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-100 leading-snug truncate">
            {nodeData.label}
          </div>
          <div className="text-[11px] font-mono text-cyan-300 truncate mt-0.5">
            {nodeData.subtitle}
          </div>
        </div>
      </div>

      {/* Source -> Target & Confidence */}
      <div className="grid grid-cols-2 gap-2 py-1.5 border-t border-slate-800/80 text-[10px] font-mono">
        <div>
          <span className="text-slate-400">Src: </span>
          <span className="text-slate-200 truncate">{nodeData.source}</span>
        </div>
        <div>
          <span className="text-slate-400">Dst: </span>
          <span className="text-slate-200 truncate">{nodeData.target}</span>
        </div>
      </div>

      {/* Footer: Evidence IDs & Timestamp */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60 text-[10px] font-mono text-slate-400 gap-1">
        <div className="flex items-center gap-1 flex-wrap min-w-0">
          <FileCode className="w-3 h-3 text-cyan-400 shrink-0" />
          {nodeData.evidenceIds && nodeData.evidenceIds.length > 0 ? (
            nodeData.evidenceIds.map((eid) => (
              <EvidenceChip key={eid} id={eid} />
            ))
          ) : (
            <span className="text-slate-500">N/A</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-emerald-400 font-semibold">{nodeData.confidence}%</span>
          <span>{nodeData.timestamp}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-2.5 !h-2.5" />
    </div>
  );
});
AttackNodeComponent.displayName = 'AttackNodeComponent';
