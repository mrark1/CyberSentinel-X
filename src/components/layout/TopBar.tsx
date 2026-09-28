import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Search,
  Bell,
  User,
  Activity,
  ShieldAlert,
  CheckCircle2,
  X,
  Radio,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { useDemoStore } from '../../demo/demoController';
import { ThreatLevelBadge } from '../common/Badges';

export const TopBar: React.FC = () => {
  const {
    threatLevel,
    searchQuery,
    setSearchQuery,
    events,
    incidents
  } = useSecurityStore();

  const {
    currentPhase,
    currentStepIndex,
    isPlaying,
    startDemo,
    pauseDemo,
    resumeDemo,
    resetDemo,
    openResponseModal
  } = useDemoStore();

  const [showNotifications, setShowNotifications] = useState(false);

  const activeIncidentsCount = incidents.filter(
    (i) => i.status === 'open' || i.status === 'investigating' || i.status === 'containment_pending'
  ).length;

  const recentEvents = events.slice(0, 6);

  const isDemoRunning = isPlaying || (currentStepIndex > 0 && currentPhase !== 'VERIFIED');

  return (
    <header className="h-16 bg-[#080d19] border-b border-slate-800/80 px-5 flex items-center justify-between gap-4 z-20 shrink-0 select-none">
      {/* Left: Branding, SOC Status, Threat Level, Active Incidents, Telemetry Rate */}
      <div className="flex items-center gap-3.5">
        {/* SOC STATUS badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-slate-300 font-semibold">SOC:</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>

        {/* Threat Level */}
        <ThreatLevelBadge level={threatLevel} />

        {/* Active Incidents */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-red-950/30 border border-red-900/40 text-red-300">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>ACTIVE:</span>
          <strong className="text-red-400 font-bold tabular-nums">{activeIncidentsCount}</strong>
        </div>

        {/* Live telemetry rate */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-cyan-400/90 bg-cyan-950/20 px-2.5 py-1 rounded border border-cyan-800/30">
          <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>TELEMETRY: <strong className="tabular-nums font-semibold text-cyan-300">142</strong> ev/min</span>
        </div>

        {/* DEMO MODE Badge */}
        <div
          className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/50 border border-purple-600/40 text-purple-300 group relative cursor-help"
          title="DEMO MODE · SYNTHETIC ENVIRONMENT: All telemetry, attack behavior, response actions, and verification checks are simulated."
        >
          <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
          <span className="font-bold">DEMO MODE</span>
          <span className="text-slate-400">· SYNTHETIC ENVIRONMENT</span>
        </div>
      </div>

      {/* Center: Prominent START ATTACK SIMULATION Button & Reset */}
      <div className="flex items-center gap-2">
        <button
          onClick={currentStepIndex === 0 || currentPhase === 'VERIFIED' ? startDemo : isPlaying ? pauseDemo : resumeDemo}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold tracking-wider rounded transition-all shadow-md cursor-pointer ${
            isDemoRunning
              ? 'bg-amber-950/90 border border-amber-500 text-amber-300 ring-2 ring-amber-500/20 animate-pulse'
              : 'bg-red-600 hover:bg-red-500 text-white border border-red-400 shadow-red-950/50 hover:shadow-[0_0_18px_rgba(239,68,68,0.5)]'
          }`}
          title="Executes the synchronized end-to-end hackathon demonstration scenario"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>
            {currentPhase === 'VERIFIED'
              ? 'RESTART DEMO SCENARIO'
              : isDemoRunning
              ? `STEP ${currentStepIndex}/13 RUNNING...`
              : 'START ATTACK SIMULATION'}
          </span>
        </button>

        <button
          onClick={resetDemo}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded transition-colors cursor-pointer"
          title="Reset environment state back to initial baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Right: Search, Notifications, Operator Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets, IPs, CVEs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-44 xl:w-56 pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded focus:border-cyan-500 focus:outline-none text-slate-200 placeholder:text-slate-400 font-mono transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded transition-colors relative cursor-pointer"
            aria-label="View security notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d1322] border border-slate-700/80 rounded-lg shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-mono font-bold text-slate-200">Recent Security Signals</span>
                <span className="text-[10px] font-mono text-cyan-400">Live Telemetry</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentEvents.map((evt) => (
                  <div key={evt.id} className="p-2 rounded bg-slate-900/60 border border-slate-800/60 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span className="text-cyan-400 uppercase font-semibold">{evt.type}</span>
                      <span>{evt.timestamp}</span>
                    </div>
                    <div className="text-slate-200 font-medium leading-snug line-clamp-2">
                      {evt.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Operator Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-medium text-slate-200 leading-tight">Marcus Ross</div>
            <div className="text-[10px] font-mono text-cyan-400/80">SOC Tier-3 Analyst</div>
          </div>
        </div>
      </div>
    </header>
  );
};
