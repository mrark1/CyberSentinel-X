import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  GitFork,
  Network,
  Crosshair,
  SlidersHorizontal,
  History,
  FileText,
  Settings,
  ShieldCheck,
  Radio,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSecurityStore } from '../../store/useSecurityStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: () => React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { incidents, deceptionObjects, simulation } = useSecurityStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const activeIncidentsCount = incidents.filter(
    (i) => i.status === 'open' || i.status === 'investigating' || i.status === 'containment_pending'
  ).length;

  const triggeredDeceptionsCount = deceptionObjects.filter((d) => d.status === 'triggered').length;

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard
    },
    {
      name: 'Incidents',
      path: '/incidents',
      icon: ShieldAlert,
      badge: () => (
        <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono font-bold bg-red-950/80 border border-red-500/40 text-red-300 rounded">
          {activeIncidentsCount}
        </span>
      )
    },
    {
      name: 'Attack Graph',
      path: '/attack-graph',
      icon: GitFork,
      badge: () => (
        simulation.isActive ? (
          <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/40 rounded animate-pulse">
            LIVE
          </span>
        ) : null
      )
    },
    {
      name: 'CyberTwin',
      path: '/cyber-twin',
      icon: Network
    },
    {
      name: 'Deception',
      path: '/deception',
      icon: Crosshair,
      badge: () => (
        triggeredDeceptionsCount > 0 ? (
          <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-500/40 rounded">
            {triggeredDeceptionsCount} TRAP
          </span>
        ) : null
      )
    },
    {
      name: 'Simulations',
      path: '/simulations',
      icon: SlidersHorizontal
    },
    {
      name: 'Attack Replay',
      path: '/attack-replay',
      icon: History
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: FileText
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings
    }
  ];

  return (
    <aside
      className={`bg-[#080c16] border-r border-slate-800/80 flex flex-col shrink-0 select-none transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`h-16 flex items-center border-b border-slate-800/80 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
                CyberSentinel <span className="text-cyan-400 font-mono text-sm">X</span>
              </div>
              <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase truncate">
                Autonomous SOC
              </div>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer shrink-0 ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Core Operations
          </div>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            title={isCollapsed ? item.name : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-md transition-all group ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-xs font-medium'
              } ${
                isActive
                  ? 'bg-cyan-950/40 text-cyan-300 border-l-2 border-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-cyan-400" />
            {!isCollapsed && (
              <>
                <span className="truncate">{item.name}</span>
                {item.badge && item.badge()}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Expand Button when collapsed */}
      {isCollapsed && (
        <div className="p-2 border-t border-slate-800/80 flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sandbox Status Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-[#060910]">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              SYNTHETIC SANDBOX
            </span>
            <span className="text-emerald-400 font-bold">ACTIVE</span>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            Evidence-First Defense Mode. Real commands blocked.
          </div>
        </div>
      )}
    </aside>
  );
};
