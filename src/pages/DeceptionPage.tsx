import React, { useState } from 'react';
import {
  Crosshair,
  KeyRound,
  FileCode,
  ShieldAlert,
  Server,
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  X
} from 'lucide-react';
import { useSecurityStore } from '../store/useSecurityStore';
import { DeceptionObject } from '../types/security';

export const DeceptionPage: React.FC = () => {
  const { deceptionObjects, triggerDeceptionManually } = useSecurityStore();
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [showDeployModal, setShowDeployModal] = useState(false);

  // New decoy form state
  const [newDecoyName, setNewDecoyName] = useState('');
  const [newDecoyType, setNewDecoyType] = useState<'honeytoken' | 'canary_file' | 'decoy_credential' | 'decoy_service'>('honeytoken');
  const [newDecoyTarget, setNewDecoyTarget] = useState('db-customer-aurora-primary');

  const filteredDecoys = deceptionObjects.filter((d) => {
    if (selectedTypeFilter !== 'all' && d.type !== selectedTypeFilter) return false;
    return true;
  });

  const handleDeployNewDecoy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecoyName) return;

    const newObj: DeceptionObject = {
      id: `decoy-custom-${Date.now()}`,
      name: newDecoyName,
      type: newDecoyType,
      targetAsset: newDecoyTarget,
      status: 'active',
      triggerCount: 0,
      plantedDate: new Date().toISOString().split('T')[0],
      decoyLocation: `/var/sentinel/traps/${newDecoyName.toLowerCase().replace(/\s+/g, '_')}`,
      confidenceContribution: 25
    };

    useSecurityStore.setState((state) => ({
      deceptionObjects: [newObj, ...state.deceptionObjects]
    }));

    setNewDecoyName('');
    setShowDeployModal(false);
  };

  const getDecoyIcon = (type: string) => {
    switch (type) {
      case 'honeytoken': return <KeyRound className="w-4 h-4 text-purple-400" />;
      case 'canary_file': return <FileCode className="w-4 h-4 text-cyan-400" />;
      case 'decoy_credential': return <Crosshair className="w-4 h-4 text-amber-400" />;
      case 'decoy_service': return <Server className="w-4 h-4 text-blue-400" />;
      default: return <Crosshair className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-purple-400" />
            Adaptive Deception Mesh
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Planted high-fidelity traps (honeytokens, canary files, decoy credentials, decoy services) providing deterministic intrusion proof
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeployModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors shadow-lg shadow-purple-950/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Decoy Trap</span>
          </button>
        </div>
      </div>

      {/* Explanatory Banner: The Deception Confidence Multiplier */}
      <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs font-sans">
            <div className="font-bold text-purple-300 uppercase tracking-wide font-mono">
              High-Fidelity Intent Discriminator
            </div>
            <div className="text-slate-300 mt-0.5 leading-relaxed">
              When an attacker touches a deception object, threat probability jumps from heuristic suspicion to deterministic certainty (+25–35% confidence boost).
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-purple-300 shrink-0">
          <span>Active Traps: <strong className="text-white">{deceptionObjects.length}</strong></span>
          <span className="text-purple-600">|</span>
          <span>Tripped: <strong className="text-red-400">{deceptionObjects.filter((d) => d.status === 'triggered').length}</strong></span>
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-slate-400">Filter Type:</span>
        {['all', 'honeytoken', 'canary_file', 'decoy_credential', 'decoy_service'].map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTypeFilter(t)}
            className={`px-2.5 py-1 rounded border text-xs capitalize transition-colors cursor-pointer ${
              selectedTypeFilter === t
                ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Deception Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDecoys.map((decoy) => {
          const isTriggered = decoy.status === 'triggered';
          return (
            <div
              key={decoy.id}
              className={`p-4 rounded-lg border transition-all text-left flex flex-col justify-between space-y-3 ${
                isTriggered
                  ? 'bg-purple-950/30 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-[#090e1d] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 shrink-0">
                      {getDecoyIcon(decoy.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100 truncate">
                        {decoy.name}
                      </div>
                      <div className="text-[11px] font-mono text-purple-400 uppercase mt-0.5">
                        {decoy.type.replace('_', ' ')} · ID: {decoy.id}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold shrink-0 ${
                    isTriggered
                      ? 'bg-red-950/80 text-red-300 border-red-500/50 animate-pulse'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {decoy.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-1 font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Target Asset:</span>
                    <span className="text-slate-200">{decoy.targetAsset}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Decoy Location:</span>
                    <span className="text-slate-400 truncate max-w-[240px]">{decoy.decoyLocation}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Planted Date:</span>
                    <span className="text-slate-300">{decoy.plantedDate}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Trigger Count:</span>
                    <span className="text-cyan-300 font-bold">{decoy.triggerCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Last Trigger:</span>
                    <span className="text-amber-300">{decoy.lastTriggered || 'Never'}</span>
                  </div>

                  {decoy.associatedIncidentId && (
                    <div className="flex items-center justify-between text-[11px] bg-red-950/30 p-1.5 rounded border border-red-900/40">
                      <span className="text-red-400 font-semibold">Associated Incident:</span>
                      <span className="text-red-300 font-bold">{decoy.associatedIncidentId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SIMULATE TRIGGER Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-purple-300">
                  Confidence Contribution: +{decoy.confidenceContribution}%
                </span>

                <button
                  onClick={() => triggerDeceptionManually(decoy.id)}
                  className="px-3 py-1.5 text-xs font-mono font-bold rounded bg-purple-700 hover:bg-purple-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-950/40"
                  title="Simulate an adversary touching this canary trap"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>SIMULATE TRIGGER</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deploy Decoy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0c1224] border border-purple-800/80 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-sm font-mono font-bold text-purple-300 uppercase">
                Plant New Deception Asset
              </span>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeployNewDecoy} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase mb-1">
                  Decoy Identifier Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Canary_API_Key_AWS_Billing"
                  value={newDecoyName}
                  onChange={(e) => setNewDecoyName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded font-mono text-slate-100 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase mb-1">
                  Decoy Type
                </label>
                <select
                  value={newDecoyType}
                  onChange={(e: any) => setNewDecoyType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded font-mono text-slate-100 focus:border-purple-500 focus:outline-none"
                >
                  <option value="honeytoken">Honeytoken (Fake Credential / DB Key)</option>
                  <option value="canary_file">Canary File (Decoy Excel / Config)</option>
                  <option value="decoy_credential">Decoy Credential (Git Repo Token)</option>
                  <option value="decoy_service">Decoy Service (Honeypot Daemon)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase mb-1">
                  Target Host Asset
                </label>
                <input
                  type="text"
                  required
                  value={newDecoyTarget}
                  onChange={(e) => setNewDecoyTarget(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded font-mono text-slate-100 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold cursor-pointer"
                >
                  Deploy Decoy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
