import React, { useState } from 'react';
import {
  FileCode,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  Server,
  Network,
  Lock,
  Layers
} from 'lucide-react';
import { Evidence } from '../../types/security';
import { flagshipIncident } from '../../mock/seedData';

// Forensic metadata lookup for evidence artifacts
export const EVIDENCE_DETAILS_MAP: Record<string, {
  id: string;
  timestamp: string;
  eventType: string;
  source: string;
  destination: string;
  asset: string;
  integrityHash: string;
  summary: string;
  details: string;
  confidence: number;
}> = {
  'E-101': {
    id: 'E-101',
    timestamp: '14:32:04',
    eventType: 'AUTH_FAILURE',
    source: '185.220.101.44 (Tor Exit Node AS9009)',
    destination: 'idp-okta-sentinel-tenant (10.0.0.5:443)',
    asset: 'idp-okta-sentinel-tenant',
    integrityHash: 'sha256:9a3f2b18c7e90145f8a0d92e1b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c',
    summary: '5 rapid failed authentication attempts detected against admin principals.',
    details: 'Telemetry from edge Okta gateway recorded a horizontal credential spraying attempt originating from a known Tor exit relay targeting privileged accounts.',
    confidence: 91
  },
  'E-102': {
    id: 'E-102',
    timestamp: '14:32:11',
    eventType: 'AUTH_SUCCESS',
    source: '185.220.101.44 (Tor Exit Node AS9009)',
    destination: 'idp-okta-sentinel-tenant (10.0.0.5:443)',
    asset: 's_chen identity principal',
    integrityHash: 'sha256:3b7a1e9c8f0d2b4a6e8f1c3d5a7b9e0f2a4c6e8d1b3f5a7c9e1d3b5a7f9e1c3b',
    summary: 'Successful login from anomalous ArchLinux device fingerprint.',
    details: 'Valid credential submitted for s_chen bypassing single-factor protection. User-Agent string Mozilla/5.0 (X11; Linux x86_64) differs from registered macOS corporate profile.',
    confidence: 94
  },
  'E-103': {
    id: 'E-103',
    timestamp: '14:32:17',
    eventType: 'SESSION_ESTABLISHED',
    source: '185.220.101.44',
    destination: 'internal-bastion-us-east (10.0.1.15)',
    asset: 'internal-bastion-us-east',
    integrityHash: 'sha256:5c8e2a1b9f7d3e5a7c9b1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a',
    summary: 'Anomalous SSH session established via Bastion gateway.',
    details: 'Concurrent active session established from foreign ASN AS9009, colliding with existing corporate session originating from verified branch VPN.',
    confidence: 95
  },
  'E-104': {
    id: 'E-104',
    timestamp: '14:32:31',
    eventType: 'PRIVILEGE_ESCALATION',
    source: 's_chen (m.ross session context)',
    destination: 'api-core-cluster-04 (10.0.2.88)',
    asset: 'api-core-cluster-04',
    integrityHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    summary: 'Unexpected privilege assignment -> ROLE_DATA_RECOVERY_OFFICER.',
    details: 'Self-requested assignment of data recovery officer role granting broad database query access. Local sudo execution executed without change management authorization.',
    confidence: 98
  },
  'E-105': {
    id: 'E-105',
    timestamp: '14:32:46',
    eventType: 'SERVICE_DISCOVERY',
    source: '10.0.1.15 (Bastion)',
    destination: '10.0.4.0/24 (Database Subnet)',
    asset: 'db-customer-aurora-primary',
    integrityHash: 'sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    summary: 'Internal database subnet TCP SYN sweep targeting ports 5432 and 6379.',
    details: 'eBPF probe recorded horizontal port scanning across internal database subnet 10.0.4.0/24 identifying listening PostgreSQL interface.',
    confidence: 88
  },
  'E-106': {
    id: 'E-106',
    timestamp: '14:32:55',
    eventType: 'DB_CONNECT',
    source: '10.0.1.15',
    destination: '10.0.4.12:5432',
    asset: 'db-customer-aurora-primary',
    integrityHash: 'sha256:4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    summary: 'Direct database shell connection opened under elevated temporary DBA role.',
    details: 'pgaudit recorded connection established to PostgreSQL 16.4 cluster using credentials elevated via ROLE_DATA_RECOVERY_OFFICER.',
    confidence: 97
  },
  'E-107': {
    id: 'E-107',
    timestamp: '14:33:02',
    eventType: 'DATABASE_ACCESS',
    source: 'm_ross_dba_temp',
    destination: 'db-customer-aurora-primary',
    asset: 'db-customer-aurora-primary',
    integrityHash: 'sha256:6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f',
    summary: 'Bulk query executed on table pii_customer_vault_records.',
    details: 'SELECT * FROM pii_customer_vault_records LIMIT 50000 executed via raw psql terminal without application layer mediation.',
    confidence: 96
  },
  'E-109': {
    id: 'E-109',
    timestamp: '14:33:18',
    eventType: 'SENSITIVE_QUERY',
    source: 'm_ross_dba_temp',
    destination: 'db-customer-aurora-primary',
    asset: 'pii_customer_vault_records',
    integrityHash: 'sha256:8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    summary: 'Restricted employee payroll and salary records queried.',
    details: 'Anomalous query pattern extracting encrypted customer credentials and vault secrets from database cluster.',
    confidence: 96
  },
  'E-113': {
    id: 'E-113',
    timestamp: '14:33:24',
    eventType: 'HONEYTOKEN_ACCESS',
    source: '185.220.101.44 (via 10.0.1.15)',
    destination: 'db-decoy-payroll-shadow (10.0.4.99)',
    asset: 'db-decoy-payroll-shadow',
    integrityHash: 'sha256:9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
    summary: 'DECEPTION SIGNAL CONFIRMED: Synthetic honeytoken HR-ADMIN-004 accessed.',
    details: 'Canary trap credential PG_SUPERUSER_RECOVERY_KEY was read from shadow table. Zero legitimate operational traffic touches this table, establishing definitive hostile execution.',
    confidence: 99
  },
  'E-114': {
    id: 'E-114',
    timestamp: '14:33:55',
    eventType: 'VERIFICATION_ATTESTATION',
    source: 'Verification Engine (5 Probes)',
    destination: 'Okta IdP, Bastion, Redis, Aurora DB',
    asset: 'Enterprise Defense Boundary',
    integrityHash: 'sha256:0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
    summary: 'Cryptographic Attestation Proof: All 5 automated verification checks passed.',
    details: '0 active TCP sockets on port 5432, session tokens purged from Redis/Okta, privileged IAM role stripped, honeytoken silence verified, telemetry normalized.',
    confidence: 100
  }
};

interface EvidenceDrawerModalProps {
  evidenceId: string | null;
  onClose: () => void;
}

export const EvidenceDrawerModal: React.FC<EvidenceDrawerModalProps> = ({
  evidenceId,
  onClose
}) => {
  if (!evidenceId) return null;

  const data = EVIDENCE_DETAILS_MAP[evidenceId] || {
    id: evidenceId,
    timestamp: '14:33:00',
    eventType: 'FORENSIC_SIGNAL',
    source: 'Synthetic Telemetry Bus',
    destination: 'db-customer-aurora-primary',
    asset: 'Target Infrastructure',
    integrityHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    summary: `Verified forensic evidence artifact ${evidenceId}`,
    details: 'Cryptographically bound to flagship incident INC-2026-0042.',
    confidence: 95
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-drawer-title"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
    >
      <div className="bg-[#0b1122] border-2 border-cyan-500/80 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                FORENSIC EVIDENCE ARTIFACT
              </div>
              <h2 id="evidence-drawer-title" className="text-base font-bold font-mono text-white">
                {data.id}: {data.eventType}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close evidence drawer"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Forensic Metadata Grid */}
        <div className="space-y-3 text-xs font-mono">
          <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-950/90 border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Timestamp</span>
              <span className="text-cyan-300 font-bold">{data.timestamp}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Certainty</span>
              <span className="text-emerald-400 font-bold">{data.confidence}% Attested</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Source Principal/IP</span>
              <span className="text-slate-200 truncate block">{data.source}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Destination / Target</span>
              <span className="text-amber-300 truncate block">{data.destination}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase">Impacted Asset</span>
              <span className="text-purple-300">{data.asset}</span>
            </div>
          </div>

          {/* Cryptographic Hash Integrity Badge */}
          <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CRYPTOGRAPHIC INTEGRITY: ATTESTED</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono break-all leading-tight">
              {data.integrityHash}
            </div>
          </div>

          {/* Summary & Detailed Forensic Context */}
          <div className="space-y-1.5 font-sans">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
              Summary Observation
            </div>
            <div className="p-3 bg-slate-950/60 rounded border border-slate-800/80 text-slate-200 text-xs leading-relaxed">
              {data.summary}
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
              {data.details}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[10px] font-mono text-purple-400">
            DEMO MODE · SYNTHETIC TELEMETRY
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded cursor-pointer transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};

interface EvidenceChipProps {
  id: string;
  onClick?: (id: string) => void;
  className?: string;
}

export const EvidenceChip: React.FC<EvidenceChipProps> = ({ id, onClick, className = '' }) => {
  const [showModal, setShowModal] = useState(false);
  const data = EVIDENCE_DETAILS_MAP[id];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(id);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        title={data ? `${data.id}: ${data.summary} (${data.confidence}% confidence) — Click to open forensic drawer` : `${id} — Click to inspect`}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-800/70 hover:border-cyan-400 text-[10px] font-mono font-bold text-cyan-300 transition-all cursor-pointer shadow-sm ${className}`}
      >
        <span>{id}</span>
        <ExternalLink className="w-2.5 h-2.5 text-cyan-400 opacity-70 group-hover:opacity-100" />
      </button>

      {showModal && (
        <EvidenceDrawerModal evidenceId={id} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};
