import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  Handle,
  Position,
  NodeProps,
  MarkerType,
  NodeTypes
} from '@xyflow/react';
import {
  Server,
  Database,
  Laptop,
  Cloud,
  Layers,
  Network,
  User,
  ShieldAlert,
  CheckCircle2,
  X,
  AlertTriangle,
  ExternalLink,
  Globe
} from 'lucide-react';
import { Asset, AssetCriticality, AssetStatus, AssetZone } from '../../types/security';
import { useSecurityStore } from '../../store/useSecurityStore';

export interface CyberTwinNodeData extends Record<string, unknown> {
  asset: Asset;
  onSelect: (asset: Asset) => void;
}

export type CustomCyberTwinNode = Node<CyberTwinNodeData, 'cyberTwinNode'>;

const CyberTwinNodeComponent: React.FC<NodeProps<CustomCyberTwinNode>> = ({ data }) => {
  const nodeData = data;
  const asset = nodeData.asset;

  const getIcon = () => {
    switch (asset.type) {
      case 'server': return <Server className="w-4 h-4 text-cyan-400" />;
      case 'database': return <Database className="w-4 h-4 text-amber-400" />;
      case 'endpoint': return asset.zone === 'internet' ? <Globe className="w-4 h-4 text-red-400" /> : <Laptop className="w-4 h-4 text-blue-400" />;
      case 'cloud_resource': return <Cloud className="w-4 h-4 text-purple-400" />;
      case 'application': return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'identity': return <User className="w-4 h-4 text-red-400" />;
      default: return <Network className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusStyle = (status: AssetStatus) => {
    switch (status) {
      case 'compromised':
        return {
          border: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] bg-red-950/40 ring-1 ring-red-500',
          badge: 'bg-red-950 text-red-300 border border-red-500/50'
        };
      case 'at_risk':
        return {
          border: 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)] bg-amber-950/30',
          badge: 'bg-amber-950 text-amber-300 border border-amber-500/50'
        };
      case 'contained':
        return {
          border: 'border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.3)] bg-emerald-950/30',
          badge: 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
        };
      case 'verified':
        return {
          border: 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] bg-emerald-950/40 ring-1 ring-emerald-400',
          badge: 'bg-emerald-900 text-emerald-200 border border-emerald-400 font-bold'
        };
      case 'normal':
      default:
        return {
          border: 'border-slate-800 bg-[#0a0f1d]/90 hover:border-cyan-500/50',
          badge: 'bg-slate-900 text-slate-400 border border-slate-700'
        };
    }
  };

  const style = getStatusStyle(asset.status);

  return (
    <div
      onClick={() => nodeData.onSelect(asset)}
      className={`min-w-[210px] rounded-lg border p-3 cursor-pointer transition-all ${style.border}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-2 !h-2" />

      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1.5 uppercase">
        <span className="text-cyan-400 font-bold">{asset.zone}</span>
        <span className={asset.risk > 70 ? 'text-red-400 font-bold' : 'text-slate-400'}>
          Risk: {asset.risk}%
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded bg-slate-900 border border-slate-800 shrink-0">
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-100 truncate">{asset.hostname}</div>
          <div className="text-[10px] font-mono text-slate-400">{asset.ip}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-slate-800/80">
        <span className="text-slate-400 truncate max-w-[120px]">{asset.owner}</span>
        <span className={`px-1.5 py-0.2 rounded uppercase font-bold text-[9px] ${style.badge}`}>
          {asset.status.toUpperCase()}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-2 !h-2" />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  cyberTwinNode: CyberTwinNodeComponent as any
};

export const CyberTwinMap: React.FC = () => {
  const { assets } = useSecurityStore();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(assets.find((a) => a.assetId === 'ast-db-01') || assets[0]);

  // Zone coordinates: INTERNET -> PERIMETER -> DMZ -> INTERNAL -> SECURE CORE -> DATABASE
  const nodes: CustomCyberTwinNode[] = useMemo(() => {
    return [
      // 1. INTERNET
      {
        id: 'ast-ext-01',
        type: 'cyberTwinNode',
        position: { x: 380, y: 20 },
        data: {
          asset: assets.find((a) => a.assetId === 'ast-ext-01') || assets[0],
          onSelect: setSelectedAsset
        }
      },
      // 2. PERIMETER
      {
        id: 'ast-zn-01',
        type: 'cyberTwinNode',
        position: { x: 380, y: 170 },
        data: {
          asset: assets.find((a) => a.assetId === 'ast-zn-01') || assets[1],
          onSelect: setSelectedAsset
        }
      },
      // 3. DMZ
      {
        id: 'ast-srv-01',
        type: 'cyberTwinNode',
        position: { x: 180, y: 320 },
        data: {
          asset: assets.find((a) => a.assetId === 'ast-srv-01') || assets[2],
          onSelect: setSelectedAsset
        }
      },
      {
        id: 'ast-id-01',
        type: 'cyberTwinNode',
        position: { x: 580, y: 320 },
        data: {
          asset: assets.find((a) => a.assetId === 'ast-id-01') || assets[3],
          onSelect: setSelectedAsset
        }
      },
      // 4. INTERNAL
      {
        id: 'ast-srv-02',
        type: 'cyberTwinNode',
        position: { x: 180, y: 470 },
        data: {
          asset: assets.find((a) => a.assetId === 'ast-srv-02') || assets[4],
          onSelect: setSelectedAsset
        }
      },
      {
        id: 'ast-ep-01',
        type: 'cyberTwinNode',
        position: { x: 420, y: 470 },
        data: {
          asset: assets.find((a) => a.assetId === 'ast-ep-01') || assets[5],
          onSelect: setSelectedAsset
        }
      },
      {
        id: 'ast-app-01',
        type: 'cyberTwinNode',
        position: { x: 660, y: 470 },
        data: {
          asset: assets.find((a) => a.assetId === 'ast-app-01') || assets[6],
          onSelect: setSelectedAsset
        }
      },
      // 5. SECURE CORE
      {
        id: 'ast-db-02',
        type: 'cyberTwinNode',
        position: { x: 420, y: 620 },
        data: {
          asset: assets.find((a) => a.assetId === 'ast-db-02') || assets[8],
          onSelect: setSelectedAsset
        }
      },
      // 6. DATABASE (Target Core)
      {
        id: 'ast-db-01',
        type: 'cyberTwinNode',
        position: { x: 200, y: 770 },
        data: {
          asset: assets.find((a) => a.assetId === 'ast-db-01') || assets[7],
          onSelect: setSelectedAsset
        }
      },
      {
        id: 'ast-db-decoy',
        type: 'cyberTwinNode',
        position: { x: 560, y: 770 },
        data: {
          asset: assets.find((a) => a.assetId === 'ast-db-decoy') || assets[9],
          onSelect: setSelectedAsset
        }
      }
    ];
  }, [assets]);

  // Edges connecting zones
  const edges: Edge[] = useMemo(() => {
    return [
      { id: 'e-ext-zn', source: 'ast-ext-01', target: 'ast-zn-01', label: 'Inbound Tor Sweep', animated: true, style: { stroke: '#f59e0b' } },
      { id: 'e-zn-srv', source: 'ast-zn-01', target: 'ast-srv-01', label: 'HTTPS Ingress', animated: true, style: { stroke: '#38bdf8' } },
      { id: 'e-zn-id', source: 'ast-zn-01', target: 'ast-id-01', label: 'Auth Pipeline', style: { stroke: '#ef4444' } },
      { id: 'e-id-ep', source: 'ast-id-01', target: 'ast-ep-01', label: 'Session Hijack Token', style: { stroke: '#ef4444' } },
      { id: 'e-srv-api', source: 'ast-srv-01', target: 'ast-srv-02', label: 'Internal Proxy Mesh', animated: true, style: { stroke: '#38bdf8' } },
      { id: 'e-ep-api', source: 'ast-ep-01', target: 'ast-srv-02', label: 'Elevated Bastion SSH', style: { stroke: '#ef4444' } },
      { id: 'e-api-core', source: 'ast-srv-02', target: 'ast-db-02', label: 'Internal Routing', style: { stroke: '#38bdf8' } },
      { id: 'e-api-db', source: 'ast-srv-02', target: 'ast-db-01', label: 'Direct Database:5432', animated: true, style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
      { id: 'e-api-decoy', source: 'ast-srv-02', target: 'ast-db-decoy', label: 'Canary Trap Probe', animated: true, style: { stroke: '#a855f7' } }
    ];
  }, []);

  return (
    <div className="relative h-full w-full bg-[#06090e] rounded-lg border border-slate-800/80 overflow-hidden flex">
      {/* Topology Canvas */}
      <div className="flex-1 h-full relative">
        <div className="absolute top-3 left-3 z-10 bg-[#080d1a]/90 backdrop-blur-md p-2.5 rounded border border-slate-800 text-xs font-mono pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-bold text-slate-200">CyberTwin Zone Architecture</span>
          </div>
          <div className="text-[11px] text-slate-400">
            INTERNET → PERIMETER → DMZ → INTERNAL → SECURE CORE → DATABASE
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={1.5}
        >
          <Background variant={BackgroundVariant.Lines} gap={24} color="#1e293b" />
          <Controls className="fill-slate-400 text-slate-400" />
        </ReactFlow>
      </div>

      {/* Asset Inspection Right Drawer */}
      {selectedAsset && (
        <div className="w-80 bg-[#0a101e] border-l border-slate-800 p-4 shrink-0 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Digital Twin Asset Card
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                selectedAsset.status === 'compromised'
                  ? 'bg-red-950/80 text-red-300 border-red-500/40'
                  : selectedAsset.status === 'at_risk'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  : selectedAsset.status === 'verified'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400'
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}>
                {selectedAsset.status.toUpperCase()}
              </span>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Hostname & IP</div>
              <div className="text-sm font-bold text-slate-100">{selectedAsset.hostname}</div>
              <div className="text-xs font-mono text-cyan-400">{selectedAsset.ip}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Asset ID</div>
                <div className="text-slate-200">{selectedAsset.assetId}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Zone</div>
                <div className="text-cyan-300 uppercase font-bold">{selectedAsset.zone}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Criticality</div>
                <div className="text-amber-400 uppercase font-bold">{selectedAsset.criticality}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Risk Score</div>
                <div className="text-red-400 font-bold">{selectedAsset.risk}/100</div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Assigned Owner</div>
              <div className="text-xs text-slate-200 font-medium">{selectedAsset.owner}</div>
            </div>

            {selectedAsset.services && (
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">
                  Active Services / Ports
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedAsset.services.map((svc) => (
                    <span key={svc} className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 rounded">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedAsset.activeThreats && selectedAsset.activeThreats.length > 0 && (
              <div className="p-2.5 rounded bg-red-950/40 border border-red-500/40 space-y-1">
                <div className="text-[10px] font-mono text-red-400 uppercase font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Active Threat Signals
                </div>
                {selectedAsset.activeThreats.map((thr, i) => (
                  <div key={i} className="text-xs text-red-200 leading-snug">
                    {thr}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-400">
            Last Telemetry Heartbeat: {selectedAsset.lastActive}
          </div>
        </div>
      )}
    </div>
  );
};
