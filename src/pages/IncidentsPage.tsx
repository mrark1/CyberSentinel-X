import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Database,
  Server
} from 'lucide-react';
import { useSecurityStore } from '../store/useSecurityStore';
import { SeverityBadge, StatusBadge } from '../components/common/Badges';
import { IncidentStatus, SeverityLevel } from '../types/security';

export const IncidentsPage: React.FC = () => {
  const { incidents, setSelectedIncidentId } = useSecurityStore();
  const navigate = useNavigate();

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [techniqueFilter, setTechniqueFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Collect all unique techniques across incidents
  const allTechniques = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => i.techniques.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [incidents]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
      if (techniqueFilter !== 'all' && !inc.techniques.includes(techniqueFilter)) return false;
      if (searchFilter) {
        const query = searchFilter.toLowerCase();
        const matchesId = inc.id.toLowerCase().includes(query);
        const matchesTitle = inc.title.toLowerCase().includes(query);
        const matchesAsset = inc.affectedAssets.some((a) => a.toLowerCase().includes(query));
        const matchesActor = inc.affectedUsers.some((u) => u.toLowerCase().includes(query));
        if (!matchesId && !matchesTitle && !matchesAsset && !matchesActor) return false;
      }
      return true;
    });
  }, [incidents, severityFilter, statusFilter, techniqueFilter, searchFilter]);

  const handleRowClick = (id: string) => {
    setSelectedIncidentId(id);
    navigate(`/incidents/${id}`);
  };

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Security Incident Register
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Correlated multi-stage attack campaigns requiring investigation and response
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong className="text-cyan-300 tabular-nums">{filteredIncidents.length}</strong> of{' '}
          <strong className="text-slate-200 tabular-nums">{incidents.length}</strong> campaigns
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#090e1c] border border-slate-800/80 rounded-lg p-3.5 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by ID, title, affected asset, or actor..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded focus:border-cyan-500 focus:outline-none text-slate-200 placeholder:text-slate-400 font-mono"
          />
        </div>

        {/* Severity Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Status Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Technique Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400">Technique:</span>
          <select
            value={techniqueFilter}
            onChange={(e) => setTechniqueFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All ATT&CK</option>
            {allTechniques.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>

        {(severityFilter !== 'all' || statusFilter !== 'all' || techniqueFilter !== 'all' || searchFilter) && (
          <button
            onClick={() => {
              setSeverityFilter('all');
              setStatusFilter('all');
              setTechniqueFilter('all');
              setSearchFilter('');
            }}
            className="px-2.5 py-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Incidents Table */}
      <div className="bg-[#090e1d] border border-slate-800 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#060912] border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-3 px-4 font-semibold">Incident ID</th>
                <th className="py-3 px-4 font-semibold">Title & Context</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Risk Score</th>
                <th className="py-3 px-4 font-semibold text-right">Certainty</th>
                <th className="py-3 px-4 font-semibold">Affected Infrastructure</th>
                <th className="py-3 px-4 font-semibold">MITRE ATT&CK</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500 font-mono text-xs">
                    No incidents match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => handleRowClick(inc.id)}
                    className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {inc.id}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {inc.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                        Stage: <span className="text-slate-300">{inc.stage}</span> · First: {inc.firstSeen.split('T')[1]?.slice(0, 5)} · Last: {inc.lastSeen.split('T')[1]?.slice(0, 5)}
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SeverityBadge severity={inc.severity} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={inc.status} />
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                      <span className={inc.riskScore >= 80 ? 'text-red-400' : inc.riskScore >= 60 ? 'text-amber-400' : 'text-slate-300'}>
                        {inc.riskScore}/100
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-cyan-300 tabular-nums">
                      {inc.confidence}%
                    </td>

                    {/* Affected Assets */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {inc.affectedAssets.slice(0, 3).map((ast) => (
                          <span
                            key={ast}
                            className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700/80 text-slate-300 rounded"
                          >
                            {ast}
                          </span>
                        ))}
                        {inc.affectedAssets.length > 3 && (
                          <span className="text-[10px] font-mono text-slate-500 self-center">
                            +{inc.affectedAssets.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Techniques */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {inc.techniques.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-800 text-cyan-400 rounded"
                          >
                            {t}
                          </span>
                        ))}
                        {inc.techniques.length > 2 && (
                          <span className="text-[10px] font-mono text-slate-500 self-center">
                            +{inc.techniques.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Link */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-xs font-semibold">
                        <span>Investigate</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
