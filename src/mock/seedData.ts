/**
 * CyberSentinel X - Enterprise Synthetic Security Seed Data
 * Sandboxed, Evidence-First Security Operations Dataset
 */

import {
  Asset,
  DeceptionObject,
  Incident,
  ReplayEvent,
  SecurityEvent,
  SystemSettings
} from '../types/security';

export const initialSettings: SystemSettings = {
  detectionSensitivity: 'balanced',
  aiConfidenceThreshold: 78,
  responseApprovalMode: 'human_in_the_loop',
  deceptionMode: 'active_mesh',
  demoSpeedMs: 1400,
  telemetryStreamEnabled: true,
  demoModeActive: true
};

export const seedUsers = [
  { id: 'usr-001', name: 'Samantha Chen', role: 'DevOps Lead', email: 's.chen@sentinel.corp', clearance: 'Level 4' },
  { id: 'usr-002', name: 'Alejandro Vargas', role: 'Senior Financial Analyst', email: 'a.vargas@sentinel.corp', clearance: 'Level 3' },
  { id: 'usr-003', name: 'Marcus Ross', role: 'Database Administrator', email: 'm.ross@sentinel.corp', clearance: 'Level 5 (Admin)' },
  { id: 'usr-004', name: 'Kavita Patel', role: 'Cloud Infrastructure Architect', email: 'k.patel@sentinel.corp', clearance: 'Level 5' },
  { id: 'usr-005', name: 'Service Account: Sync', role: 'Automated Data Pipeline', email: 'svc_finance_sync@sentinel.corp', clearance: 'Service Principal' }
];

export const seedAssets: Asset[] = [
  {
    assetId: 'ast-ext-01',
    hostname: 'external-tor-exit',
    ip: '185.220.101.44',
    type: 'endpoint',
    criticality: 'low',
    owner: 'Unknown (Adversary Infrastructure)',
    zone: 'internet',
    risk: 98,
    status: 'compromised',
    lastActive: 'Just now'
  },
  {
    assetId: 'ast-zn-01',
    hostname: 'zone-perimeter-ingress',
    ip: '198.51.100.1',
    type: 'network_zone',
    criticality: 'high',
    owner: 'Network Security',
    zone: 'perimeter',
    risk: 65,
    status: 'normal',
    services: ['palo-alto-ngfw', 'bgp-inspection'],
    lastActive: 'Continuous'
  },
  {
    assetId: 'ast-srv-01',
    hostname: 'app-gateway-prod-01',
    ip: '10.0.1.15',
    type: 'server',
    criticality: 'critical',
    owner: 'Platform Engineering',
    zone: 'dmz',
    risk: 45,
    status: 'normal',
    os: 'Ubuntu 24.04 LTS',
    services: ['nginx/1.26', 'envoy-proxy', 'node-auth'],
    lastActive: 'Just now'
  },
  {
    assetId: 'ast-id-01',
    hostname: 'idp-okta-sentinel-tenant',
    ip: '10.0.0.5',
    type: 'identity',
    criticality: 'critical',
    owner: 'Identity & Access Management',
    zone: 'dmz',
    risk: 88,
    status: 'at_risk',
    services: ['oauth2', 'saml-2.0', 'webauthn-mfa-provider'],
    lastActive: 'Just now',
    activeThreats: ['Credential guessing bypassed for m.ross@sentinel.corp']
  },
  {
    assetId: 'ast-srv-02',
    hostname: 'api-core-cluster-04',
    ip: '10.0.2.88',
    type: 'server',
    criticality: 'critical',
    owner: 'Platform Engineering',
    zone: 'internal',
    risk: 76,
    status: 'at_risk',
    os: 'Ubuntu 24.04 LTS',
    services: ['golang-api', 'grpc-daemon', 'consul-agent'],
    lastActive: '1 min ago',
    activeThreats: ['Privilege escalation requested via session token']
  },
  {
    assetId: 'ast-ep-01',
    hostname: 'wkstn-mross-mac09',
    ip: '10.0.8.44',
    type: 'endpoint',
    criticality: 'high',
    owner: 'Marcus Ross (DBA)',
    zone: 'internal',
    risk: 84,
    status: 'at_risk',
    os: 'macOS Sequoia 15.1',
    services: ['sentinel-agent-v4', 'tunnel-tls', 'pgadmin4'],
    lastActive: 'Just now',
    activeThreats: ['Session identity hijacked from external IP']
  },
  {
    assetId: 'ast-db-01',
    hostname: 'db-customer-aurora-primary',
    ip: '10.0.4.12',
    type: 'database',
    criticality: 'critical',
    owner: 'Data Tier Team',
    zone: 'database',
    risk: 94,
    status: 'compromised',
    os: 'PostgreSQL 16.4 Enterprise',
    services: ['postgresql:5432', 'pg_stat_statements', 'ssl-tls-enforced'],
    lastActive: '30s ago',
    activeThreats: ['INC-2026-0042 Unsanctioned elevated role query']
  },
  {
    assetId: 'ast-db-decoy',
    hostname: 'db-decoy-payroll-shadow',
    ip: '10.0.4.99',
    type: 'database',
    criticality: 'low',
    owner: 'Deception Mesh Automated',
    zone: 'database',
    risk: 99,
    status: 'compromised',
    os: 'Deception Trap Instance (Decoy)',
    services: ['fake-postgres:5432', 'telemetry-beacon'],
    lastActive: 'Just now',
    activeThreats: ['Honeytoken PG_SUPERUSER_RECOVERY_KEY triggered']
  },
  {
    assetId: 'ast-db-02',
    hostname: 'db-analytics-warehouse-replica',
    ip: '10.0.4.55',
    type: 'database',
    criticality: 'high',
    owner: 'BI Analytics',
    zone: 'secure_core',
    risk: 28,
    status: 'normal',
    os: 'PostgreSQL 16.2',
    services: ['postgresql:5432', 'metabase-connector'],
    lastActive: '4 mins ago'
  },
  {
    assetId: 'ast-cld-01',
    hostname: 'aws-iam-role-core-prod',
    ip: '172.31.0.1',
    type: 'cloud_resource',
    criticality: 'critical',
    owner: 'Cloud Infrastructure',
    zone: 'cloud_vpc',
    risk: 58,
    status: 'normal',
    os: 'AWS IAM Policy Controller',
    services: ['kms:Decrypt', 's3:ListBucket', 'rds:Connect'],
    lastActive: '2 mins ago'
  },
  {
    assetId: 'ast-cld-02',
    hostname: 's3-confidential-finance-vault',
    ip: '172.31.14.99',
    type: 'cloud_resource',
    criticality: 'critical',
    owner: 'Finance & Compliance',
    zone: 'cloud_vpc',
    risk: 34,
    status: 'normal',
    os: 'AWS S3 Glacier Flexible',
    services: ['sse-kms', 'bucket-versioning', 'mfa-delete'],
    lastActive: '18 mins ago'
  },
  {
    assetId: 'ast-app-01',
    hostname: 'app-payments-gateway',
    ip: '10.0.3.10',
    type: 'application',
    criticality: 'critical',
    owner: 'Fintech Engineering',
    zone: 'internal',
    risk: 40,
    status: 'normal',
    os: 'Containerized (Alpine 3.20)',
    services: ['pci-dss-enclave', 'tokenization-svc:8443'],
    lastActive: '1 min ago'
  },
  {
    assetId: 'ast-ep-02',
    hostname: 'wkstn-schen-fedora2',
    ip: '10.0.8.19',
    type: 'endpoint',
    criticality: 'medium',
    owner: 'Samantha Chen (DevOps)',
    zone: 'internal',
    risk: 15,
    status: 'normal',
    os: 'Fedora 40 Workstation',
    services: ['sentinel-agent-v4', 'docker-engine'],
    lastActive: '12 mins ago'
  },
  {
    assetId: 'ast-ep-03',
    hostname: 'wkstn-avargas-win11',
    ip: '10.0.8.61',
    type: 'endpoint',
    criticality: 'medium',
    owner: 'Alejandro Vargas (Finance)',
    zone: 'internal',
    risk: 22,
    status: 'normal',
    os: 'Windows 11 Pro Enterprise',
    services: ['sentinel-agent-v4', 'crowdstrike-sensor', 'excel365'],
    lastActive: '5 mins ago'
  },
  {
    assetId: 'ast-zn-02',
    hostname: 'zone-internal-app-tier',
    ip: '10.0.2.0/23',
    type: 'network_zone',
    criticality: 'critical',
    owner: 'Network Security',
    zone: 'internal',
    risk: 60,
    status: 'normal',
    services: ['cilium-ebpf', 'zero-trust-mesh'],
    lastActive: 'Continuous'
  }
];

export const seedDeceptionObjects: DeceptionObject[] = [
  {
    id: 'decoy-001',
    name: 'Honeytoken: PG_SUPERUSER_RECOVERY_KEY',
    type: 'honeytoken',
    targetAsset: 'db-customer-aurora-primary',
    status: 'triggered',
    triggerCount: 1,
    lastTriggered: '14:32:48',
    associatedIncidentId: 'INC-2026-0042',
    decoyLocation: '/etc/sentinel/db_creds/recovery_shadow.key',
    plantedDate: '2026-08-15',
    confidenceContribution: 28
  },
  {
    id: 'decoy-002',
    name: 'Canary File: 2026_Q3_executive_equity_allocations.xlsx',
    type: 'canary_file',
    targetAsset: 's3-confidential-finance-vault',
    status: 'active',
    triggerCount: 0,
    plantedDate: '2026-09-01',
    decoyLocation: 's3://sentinel-finance-vault/restricted/executive_equity_allocations.xlsx',
    confidenceContribution: 25
  },
  {
    id: 'decoy-003',
    name: 'Decoy Credential: svc_aws_billing_superadmin',
    type: 'decoy_credential',
    targetAsset: 'aws-iam-role-core-prod',
    status: 'active',
    triggerCount: 0,
    plantedDate: '2026-09-10',
    decoyLocation: 'Git repo config: devops-infra/.env.example.backup',
    confidenceContribution: 30
  },
  {
    id: 'decoy-004',
    name: 'Decoy Service: shadow-admin-portal-dev.corp',
    type: 'decoy_service',
    targetAsset: 'app-gateway-prod-01',
    status: 'active',
    triggerCount: 0,
    plantedDate: '2026-08-20',
    decoyLocation: 'Port 8443 on DMZ secondary interface',
    confidenceContribution: 35
  }
];

export const seedEvents: SecurityEvent[] = [
  {
    id: 'evt-001',
    timestamp: '14:32:04',
    type: 'AUTH_FAILURE',
    severity: 'medium',
    source: '185.220.101.44',
    sourceIp: '185.220.101.44',
    destinationIp: '10.0.1.15',
    actor: 'admin',
    userId: 'usr-003',
    assetId: 'gateway-01',
    action: 'login_failed',
    status: 'failure',
    description: 'Failed password verification for account admin from Tor exit node.',
    evidenceRefId: 'E-101'
  },
  {
    id: 'evt-002',
    timestamp: '14:32:11',
    type: 'AUTH_FAILURE',
    severity: 'medium',
    source: '185.220.101.44',
    sourceIp: '185.220.101.44',
    destinationIp: '10.0.1.15',
    actor: 'm.ross@sentinel.corp',
    userId: 'usr-003',
    assetId: 'gateway-01',
    action: 'login_failed',
    status: 'failure',
    description: 'Multiple failed password attempts against DBA account m.ross.',
    evidenceRefId: 'E-102'
  },
  {
    id: 'evt-003',
    timestamp: '14:32:17',
    type: 'AUTH_SUCCESS',
    severity: 'high',
    source: '185.220.101.44',
    sourceIp: '185.220.101.44',
    destinationIp: '10.0.1.15',
    actor: 'm.ross@sentinel.corp',
    userId: 'usr-003',
    assetId: 'vpn-gateway',
    action: 'login_success',
    status: 'success',
    description: 'Successful authentication for m.ross from unregistered Arch Linux device in ASN AS9009.',
    evidenceRefId: 'E-103'
  },
  {
    id: 'evt-004',
    timestamp: '14:32:31',
    type: 'PRIVILEGE_ESCALATION',
    severity: 'high',
    source: '185.220.101.44',
    sourceIp: '185.220.101.44',
    destinationIp: '10.0.0.5',
    actor: 'm.ross@sentinel.corp',
    userId: 'usr-003',
    assetId: 'idp-okta-sentinel-tenant',
    action: 'role_escalation',
    status: 'success',
    description: 'Self-requested assignment of ROLE_DATA_RECOVERY_OFFICER bypassing step-up MFA.',
    evidenceRefId: 'E-104'
  },
  {
    id: 'evt-005',
    timestamp: '14:32:39',
    type: 'NETWORK_SWEEP',
    severity: 'medium',
    source: '10.0.1.15',
    sourceIp: '10.0.1.15',
    destinationIp: '10.0.4.12',
    actor: 'session_mross_ext',
    assetId: 'api-core-cluster-04',
    action: 'port_scan',
    status: 'detected',
    description: 'TCP SYN sweep across database subnet 10.0.4.0/24 targeting ports 5432 and 6379.',
    evidenceRefId: 'E-105'
  },
  {
    id: 'evt-006',
    timestamp: '14:32:45',
    type: 'DB_CONNECT',
    severity: 'high',
    source: '10.0.1.15',
    sourceIp: '10.0.1.15',
    destinationIp: '10.0.4.12',
    actor: 'm_ross_dba_temp',
    assetId: 'db-customer-aurora-primary',
    action: 'database_connect',
    status: 'success',
    description: 'Connected to primary database cluster cust_aurora_master with elevated recovery role.',
    evidenceRefId: 'E-106'
  },
  {
    id: 'evt-007',
    timestamp: '14:32:51',
    type: 'SENSITIVE_QUERY',
    severity: 'critical',
    source: '10.0.1.15',
    sourceIp: '10.0.1.15',
    destinationIp: '10.0.4.12',
    actor: 'm_ross_dba_temp',
    assetId: 'db-customer-aurora-primary',
    action: 'bulk_query',
    status: 'detected',
    description: 'Bulk query executed on table pii_customer_vault_records without application signature.',
    evidenceRefId: 'E-107'
  },
  {
    id: 'evt-008',
    timestamp: '14:32:58',
    type: 'HONEYTOKEN_TRIGGER',
    severity: 'critical',
    source: '10.0.1.15',
    sourceIp: '10.0.1.15',
    destinationIp: '10.0.4.99',
    actor: 'm_ross_dba_temp',
    assetId: 'db-decoy-payroll-shadow',
    action: 'trap_accessed',
    status: 'detected',
    description: 'Canary token PG_SUPERUSER_RECOVERY_KEY was accessed and submitted to trap cluster.',
    evidenceRefId: 'E-109'
  },
  {
    id: 'evt-009',
    timestamp: '14:33:04',
    type: 'SESSION_REVOKED',
    severity: 'info',
    source: '10.0.0.1',
    sourceIp: '10.0.0.1',
    destinationIp: '10.0.4.12',
    actor: 'Sentinel Autonomous Policy',
    assetId: 'db-customer-aurora-primary',
    action: 'containment_action',
    status: 'success',
    description: 'Revoked Okta user session, severed PostgreSQL connection pool, null-routed adversary IP.',
    evidenceRefId: 'E-112'
  },
  {
    id: 'evt-010',
    timestamp: '14:33:10',
    type: 'VERIFY_PROBE',
    severity: 'info',
    source: '10.0.0.1',
    sourceIp: '10.0.0.1',
    destinationIp: '10.0.4.12',
    actor: 'Verification Engine',
    assetId: 'db-customer-aurora-primary',
    action: 'verification_probe',
    status: 'success',
    description: 'Verification confirms 0 active sockets and session token permanently invalidated.',
    evidenceRefId: 'E-113'
  }
];

// Flagship Incident INC-2026-0042
export const flagshipIncident: Incident = {
  id: 'INC-2026-0042',
  title: 'Credential compromise leading to privileged database access',
  severity: 'critical',
  status: 'investigating',
  riskScore: 94,
  firstSeen: '14:32:04',
  lastSeen: '14:33:10',
  affectedAssets: ['idp-okta-sentinel-tenant', 'api-core-cluster-04', 'db-customer-aurora-primary', 'db-decoy-payroll-shadow', 'wkstn-mross-mac09'],
  affectedUsers: ['m.ross@sentinel.corp'],
  techniques: ['T1110.001', 'T1078.004', 'T1098', 'T1046', 'T1078', 'T1530', 'T1552'],
  confidence: 96,
  stage: 'DATA ACCESS',
  evidenceCount: 8,
  summary: 'Adversary leveraged credential guessing to compromise DBA account "m.ross", escalated roles without step-up MFA, performed internal discovery, connected to primary customer database, and triggered high-fidelity honeytoken.',
  evidence: [
    {
      id: 'E-101',
      timestamp: '14:32:04',
      type: 'log',
      source: 'IdP Gateway (Okta)',
      title: 'Repeated Authentication Failures',
      description: 'Multiple failed password attempts against administrator account from external IP 185.220.101.44 (Tor Exit Node).',
      confidence: 91,
      verified: true
    },
    {
      id: 'E-102',
      timestamp: '14:32:11',
      type: 'log',
      source: 'IdP Gateway (Okta)',
      title: 'Targeted Password Guessing on DBA',
      description: '3 consecutive login failures against m.ross@sentinel.corp within 7 seconds from identical external source.',
      confidence: 94,
      verified: true
    },
    {
      id: 'E-103',
      timestamp: '14:32:17',
      type: 'behavioral_anomaly',
      source: 'Sentinel Behavior Engine',
      title: 'Anomalous Device & Foreign ASN Access',
      description: 'Successful login on unmanaged Arch Linux user-agent from foreign ASN AS9009, colliding with active macOS session.',
      confidence: 95,
      verified: true
    },
    {
      id: 'E-104',
      timestamp: '14:32:31',
      type: 'log',
      source: 'IAM Audit Trail',
      title: 'Unsanctioned Role Escalation',
      description: 'Self-requested assignment of ROLE_DATA_RECOVERY_OFFICER, bypassing corporate step-up MFA requirements.',
      confidence: 98,
      verified: true
    },
    {
      id: 'E-105',
      timestamp: '14:32:39',
      type: 'packet',
      source: 'Cilium eBPF Probe',
      title: 'Internal Subnet Discovery Sweep',
      description: 'Internal TCP scan directed at database tier (10.0.4.0/24) identifying port 5432 on customer Aurora primary.',
      confidence: 88,
      verified: true
    },
    {
      id: 'E-106',
      timestamp: '14:32:45',
      type: 'log',
      source: 'PostgreSQL pgaudit',
      title: 'Direct Database Shell Connection',
      description: 'Database shell session opened using escalated credentials without correlating Jira change-ticket.',
      confidence: 97,
      verified: true
    },
    {
      id: 'E-107',
      timestamp: '14:32:51',
      type: 'log',
      source: 'PostgreSQL Query Inspector',
      title: 'Bulk Customer Record Query',
      description: 'SELECT * FROM pii_customer_vault_records LIMIT 50000 executed via raw psql terminal.',
      confidence: 96,
      verified: true
    },
    {
      id: 'E-109',
      timestamp: '14:33:18',
      type: 'log',
      source: 'Database DLP Monitor',
      title: 'Restricted Customer Vault Query',
      description: 'Anomalous query pattern extracting encrypted customer credentials and vault secrets from database cluster.',
      confidence: 96,
      verified: true
    },
    {
      id: 'E-113',
      timestamp: '14:33:24',
      type: 'token_trigger',
      source: 'Adaptive Deception Mesh',
      title: 'Synthetic Honeytoken Accessed (HR-ADMIN-004)',
      description: 'DECEPTION SIGNAL CONFIRMED: Actor accessed and submitted fake credential PG_SUPERUSER_RECOVERY_KEY from canary shadow table db-decoy-payroll-shadow.',
      confidence: 99,
      verified: true
    },
    {
      id: 'E-114',
      timestamp: '14:33:55',
      type: 'hash_match',
      source: 'Verification Engine',
      title: 'Containment Attestation Cryptographic Proof',
      description: 'Cryptographic confirmation: 0 active socket connections, Okta/Redis token revocation verified, and lateral paths fully neutralized.',
      confidence: 100,
      verified: true
    }
  ],
  timeline: [
    {
      id: 'tl-1',
      timestamp: '14:32:04',
      title: 'Multiple Failed Authentication Attempts',
      stage: 'INITIAL ACCESS',
      severity: 'medium',
      description: 'Rapid password attempts against DBA account from Tor exit node.',
      evidenceRefId: 'E-101'
    },
    {
      id: 'tl-2',
      timestamp: '14:32:17',
      title: 'Successful Authentication from Anomalous Device',
      stage: 'ACCOUNT COMPROMISE',
      severity: 'high',
      description: 'Credential accepted; foreign device fingerprint AS9009 established.',
      evidenceRefId: 'E-103'
    },
    {
      id: 'tl-3',
      timestamp: '14:32:31',
      title: 'Privilege Escalation Detected',
      stage: 'PRIVILEGE ESCALATION',
      severity: 'high',
      description: 'Escalated to ROLE_DATA_RECOVERY_OFFICER.',
      evidenceRefId: 'E-104'
    },
    {
      id: 'tl-4',
      timestamp: '14:32:39',
      title: 'Internal Service Discovery',
      stage: 'DISCOVERY',
      severity: 'medium',
      description: 'Port sweep of internal database subnet 10.0.4.0/24.',
      evidenceRefId: 'E-105'
    },
    {
      id: 'tl-5',
      timestamp: '14:32:45',
      title: 'Database Access Observed',
      stage: 'LATERAL MOVEMENT',
      severity: 'high',
      description: 'Direct connection to primary customer Aurora cluster.',
      evidenceRefId: 'E-106'
    },
    {
      id: 'tl-6',
      timestamp: '14:32:51',
      title: 'Sensitive Record Query Executed',
      stage: 'DATA ACCESS',
      severity: 'critical',
      description: 'Query executed against sensitive customer PII records table.',
      evidenceRefId: 'E-107'
    },
    {
      id: 'tl-7',
      timestamp: '14:32:58',
      title: 'Honeytoken Access Triggered',
      stage: 'DECEPTION TRIGGER',
      severity: 'critical',
      description: 'Trap credential accessed, conclusively proving malicious non-accidental intent.',
      evidenceRefId: 'E-109'
    },
    {
      id: 'tl-8',
      timestamp: '14:33:04',
      title: 'Simulated Containment Executed',
      stage: 'CONTAINMENT',
      severity: 'info',
      description: 'Executed counterfactual containment: Terminated active DB sessions and invalidated tokens.',
      contained: true
    },
    {
      id: 'tl-9',
      timestamp: '14:33:10',
      title: 'Verification Confirms Session Inactive',
      stage: 'VERIFICATION',
      severity: 'info',
      description: 'Verification engine confirmed 0 active sockets and no exfiltration in progress.',
      contained: true
    }
  ],
  aiAnalysis: {
    assessment: 'Based on evidence E-102 and E-109, the correlation engine confirms a targeted identity compromise progressing from credential stuffing through privilege escalation to direct database query. The subsequent access to canary token PG_SUPERUSER_RECOVERY_KEY conclusively establishes adversarial execution rather than administrator error.',
    confidence: 96,
    evidenceIds: ['E-102', 'E-104', 'E-106', 'E-107', 'E-109', 'E-113'],
    observedFacts: [
      'Based on evidence E-101 and E-102, 3 failed authentication attempts preceded successful login from Tor exit IP 185.220.101.44.',
      'Based on evidence E-103, device fingerprint mismatch: ArchLinux user-agent differs from legitimate macOS profile.',
      'Based on evidence E-104, role escalation occurred at 14:32:31 granting ROLE_DATA_RECOVERY_OFFICER.',
      'Based on evidence E-107, direct SQL query executed on pii_customer_vault_records.',
      'Based on evidence E-109, honeytoken PG_SUPERUSER_RECOVERY_KEY was accessed and submitted at 14:32:58.'
    ],
    inferredConclusions: [
      'Attacker obtained valid credentials via password spraying or prior third-party leak.',
      'The adversary possesses knowledge of enterprise database schema conventions.',
      'Honeytoken access proves the adversary searched internal credential caches for broader lateral spread.'
    ],
    predictedNextSteps: [
      'Attacker will attempt staging extracted records to an external cloud bucket or DNS exfil channel.',
      'Secondary attempts to pivot from database server to AWS IAM metadata endpoint (169.254.169.254).'
    ],
    recommendedInvestigation: [
      '1. Inspect privileged account session for m.ross@sentinel.corp across Okta and VPN gateways.',
      '2. Validate database access logs on db-customer-aurora-primary for unauthorized query patterns.',
      '3. Check lateral movement indicators across internal subnet 10.0.4.0/24.'
    ],
    recommendedDefensiveActions: [
      'Revoke user session immediately and terminate active PostgreSQL database connections.'
    ],
    lastUpdated: '14:33:15'
  },
  responseOptions: [
    {
      id: 'act-01',
      title: 'Revoke User Session & Invalidate Tokens',
      actionType: 'revoke_session',
      description: 'Immediately terminates all active Okta sessions, OAuth refresh tokens, and active PostgreSQL connections associated with m.ross@sentinel.corp.',
      securityBenefit: 'VERY HIGH',
      operationalImpact: 'LOW',
      affectedAssets: ['idp-okta-sentinel-tenant', 'db-customer-aurora-primary'],
      confidence: 96,
      estimatedRecovery: 'Immediate (< 2 minutes)',
      verificationChecks: [
        'Session invalidated in Okta IdP and Redis session cache',
        'Database connection closed on port 5432',
        'Privileged token inactive',
        'Honeytoken access stopped',
        'No new correlated events'
      ],
      scores: {
        securityScore: 94,
        businessContinuity: 95,
        recoveryComplexity: 10
      }
    },
    {
      id: 'act-02',
      title: 'Disable Account & Lock Directory Principal',
      actionType: 'disable_account',
      description: 'Suspends the user identity in Okta IAM directory and revokes all group memberships and database privileges indefinitely pending security review.',
      securityBenefit: 'VERY HIGH',
      operationalImpact: 'MEDIUM',
      affectedAssets: ['idp-okta-sentinel-tenant', 'api-core-cluster-04', 'db-customer-aurora-primary'],
      confidence: 94,
      estimatedRecovery: '15 - 30 minutes',
      verificationChecks: [
        'Directory principal set to SUSPENDED',
        'All active sessions terminated',
        'Kerberos TGT ticket revoked'
      ],
      scores: {
        securityScore: 96,
        businessContinuity: 78,
        recoveryComplexity: 35
      }
    },
    {
      id: 'act-03',
      title: 'Isolate Gateway Server & Block Source IP',
      actionType: 'isolate_endpoint',
      description: 'Places app-gateway-prod-01 in network quarantine via eBPF security policies, allowing only SOC telemetry egress.',
      securityBenefit: 'HIGH',
      operationalImpact: 'HIGH',
      affectedAssets: ['app-gateway-prod-01', 'api-core-cluster-04'],
      confidence: 89,
      estimatedRecovery: '45 - 60 minutes',
      verificationChecks: [
        'Egress network drop policy enforced',
        'Internal cluster routes nullified'
      ],
      scores: {
        securityScore: 92,
        businessContinuity: 45,
        recoveryComplexity: 65
      }
    },
    {
      id: 'act-04',
      title: 'Block Adversary IP Across Border NGFW',
      actionType: 'block_source',
      description: 'Broadcasts dynamic ACL block for 185.220.101.44 across perimeter firewalls and Cloudflare Edge rules.',
      securityBenefit: 'MEDIUM',
      operationalImpact: 'LOW',
      affectedAssets: ['zone-perimeter-ingress'],
      confidence: 94,
      estimatedRecovery: 'Immediate',
      verificationChecks: [
        'Border ACL rule verified active',
        'Inbound SYN packets dropped'
      ],
      scores: {
        securityScore: 75,
        businessContinuity: 98,
        recoveryComplexity: 5
      }
    },
    {
      id: 'act-05',
      title: 'Quarantine Database Client Process',
      actionType: 'quarantine_process',
      description: 'Sends SIGSTOP/SIGKILL to rogue database client process PID 41920 on proxy gateway and dumps memory for forensics.',
      securityBenefit: 'HIGH',
      operationalImpact: 'LOW',
      affectedAssets: ['api-core-cluster-04'],
      confidence: 95,
      estimatedRecovery: '5 minutes',
      verificationChecks: [
        'PID removed from process table',
        'Core dump integrity validated'
      ],
      scores: {
        securityScore: 88,
        businessContinuity: 92,
        recoveryComplexity: 20
      }
    }
  ],
  containmentStatus: {
    isContained: false,
    verificationState: 'NOT_VERIFIED',
    checks: [
      { name: 'Session invalidated', status: 'pending' },
      { name: 'Database connection closed', status: 'pending' },
      { name: 'Privileged token inactive', status: 'pending' },
      { name: 'Honeytoken access stopped', status: 'pending' },
      { name: 'No new correlated events', status: 'pending' }
    ]
  }
};

export const additionalIncidents: Incident[] = [
  {
    id: 'INC-2026-0039',
    title: 'Anomalous Cloud S3 Object Enumeration via Stolen API Key',
    severity: 'high',
    status: 'contained',
    riskScore: 78,
    firstSeen: '21:10:00',
    lastSeen: '02:40:00',
    affectedAssets: ['aws-iam-role-core-prod', 's3-confidential-finance-vault'],
    affectedUsers: ['svc_finance_sync@sentinel.corp'],
    techniques: ['T1530', 'T1087.004'],
    confidence: 88,
    stage: 'DISCOVERY',
    evidenceCount: 4,
    summary: 'Automated crawler accessed S3 bucket objects at 400 req/sec from uncatalogued IP block.',
    evidence: [],
    timeline: [],
    aiAnalysis: {
      assessment: 'Based on evidence E-201, leaked temporary session credentials from developer workstation.',
      confidence: 88,
      evidenceIds: ['E-201'],
      observedFacts: ['High volume S3 GetObject calls from external IP.'],
      inferredConclusions: ['Credentials compromised from developer machine backup.'],
      predictedNextSteps: ['Exfiltration of encrypted database snapshots.'],
      recommendedInvestigation: ['Check git commit histories.'],
      recommendedDefensiveActions: ['Rotate IAM access keys immediately.'],
      lastUpdated: '02:45:00'
    },
    responseOptions: []
  },
  {
    id: 'INC-2026-0040',
    title: 'Privilege Escalation Attempt on Production Web Gateway',
    severity: 'high',
    status: 'investigating',
    riskScore: 71,
    firstSeen: '03:15:00',
    lastSeen: '04:30:00',
    affectedAssets: ['app-gateway-prod-01'],
    affectedUsers: ['s.chen@sentinel.corp'],
    techniques: ['T1068', 'T1548.003'],
    confidence: 82,
    stage: 'PRIVILEGE ESCALATION',
    evidenceCount: 3,
    summary: 'Container escape attempt detected through vulnerable kernel cgroup exploitation.',
    evidence: [],
    timeline: [],
    aiAnalysis: {
      assessment: 'Based on evidence E-301, exploit attempted against kernel CVE-2024-21626 in staging container.',
      confidence: 82,
      evidenceIds: ['E-301'],
      observedFacts: ['Unexpected process namespace transition detected by eBPF probe.'],
      inferredConclusions: ['Adversary has low-privilege execution within pod.'],
      predictedNextSteps: ['Host node takeover and kube-system credential theft.'],
      recommendedInvestigation: ['Inspect container runtime audit logs.'],
      recommendedDefensiveActions: ['Recreate pod in sandboxed gVisor runtime.'],
      lastUpdated: '04:35:00'
    },
    responseOptions: []
  },
  {
    id: 'INC-2026-0038',
    title: 'Suspicious Macro Execution on Financial Analyst Workstation',
    severity: 'medium',
    status: 'contained',
    riskScore: 54,
    firstSeen: '16:04:00',
    lastSeen: '16:20:00',
    affectedAssets: ['wkstn-avargas-win11'],
    affectedUsers: ['a.vargas@sentinel.corp'],
    techniques: ['T1204.002', 'T1059.001'],
    confidence: 91,
    stage: 'DATA ACCESS',
    evidenceCount: 2,
    summary: 'Obfuscated PowerShell script invoked via malicious invoice spreadsheet, intercepted by EDR.',
    evidence: [],
    timeline: [],
    aiAnalysis: {
      assessment: 'Based on evidence E-401, phishing payload delivered via email attachment; contained pre-execution.',
      confidence: 91,
      evidenceIds: ['E-401'],
      observedFacts: ['Excel spawned hidden powershell.exe with Base64 payload.'],
      inferredConclusions: ['Targeted spear-phishing campaign against accounting team.'],
      predictedNextSteps: ['Local credential harvest using Mimikatz.'],
      recommendedInvestigation: ['Extract inbound email sender headers.'],
      recommendedDefensiveActions: ['Workstation isolated and re-imaged.'],
      lastUpdated: '16:30:00'
    },
    responseOptions: []
  },
  {
    id: 'INC-2026-0037',
    title: 'Honeytoken Decoy AWS Credential Query from Foreign Hosting ASN',
    severity: 'critical',
    status: 'contained',
    riskScore: 92,
    firstSeen: '11:22:00',
    lastSeen: '11:45:00',
    affectedAssets: ['aws-iam-role-core-prod', 'zone-perimeter-ingress'],
    affectedUsers: ['svc_aws_billing_superadmin'],
    techniques: ['T1552', 'T1078.004'],
    confidence: 99,
    stage: 'DECEPTION TRIGGER',
    evidenceCount: 5,
    summary: 'Planted canary AWS credential dec-003 was queried from external VPS in Netherlands.',
    evidence: [],
    timeline: [],
    aiAnalysis: {
      assessment: 'Based on evidence E-501, definitive malicious activity triggered through active deception trap.',
      confidence: 99,
      evidenceIds: ['E-501'],
      observedFacts: ['Canary AWS secret key used in GetCallerIdentity request.'],
      inferredConclusions: ['Source code repository or public leak exposed decoy token.'],
      predictedNextSteps: ['Adversary attempting compute cluster spin-up.'],
      recommendedInvestigation: ['Trace repository clone logs for who accessed the backup file.'],
      recommendedDefensiveActions: ['Block offending ASN AS44477 at perimeter.'],
      lastUpdated: '12:00:00'
    },
    responseOptions: []
  },
  {
    id: 'INC-2026-0036',
    title: 'DNS Tunneling Beacon Detected from DMZ Web Cluster',
    severity: 'medium',
    status: 'triaged',
    riskScore: 61,
    firstSeen: '19:30:00',
    lastSeen: '08:10:00',
    affectedAssets: ['app-gateway-prod-01', 'zone-perimeter-ingress'],
    affectedUsers: ['Platform Engineering'],
    techniques: ['T1071.004', 'T1572'],
    confidence: 76,
    stage: 'LATERAL MOVEMENT',
    evidenceCount: 3,
    summary: 'Periodic high-entropy TXT lookups against dynamic domain c2-sync.ns-router.biz.',
    evidence: [],
    timeline: [],
    aiAnalysis: {
      assessment: 'Based on evidence E-601, low-bandwidth C2 channel attempting heartbeat persistence.',
      confidence: 76,
      evidenceIds: ['E-601'],
      observedFacts: ['Entropy of queried subdomains exceeds 4.8 bits/char.'],
      inferredConclusions: ['Command and control beacon establishing slow exfil link.'],
      predictedNextSteps: ['Exfiltration of cached application tokens.'],
      recommendedInvestigation: ['Capture full PCAP on web gateway DNS interface.'],
      recommendedDefensiveActions: ['Sinkhole destination domain at recursive resolvers.'],
      lastUpdated: '08:30:00'
    },
    responseOptions: []
  },
  {
    id: 'INC-2026-0035',
    title: 'Lateral Kerberos Pass-the-Ticket Probing on Windows Subnet',
    severity: 'low',
    status: 'resolved',
    riskScore: 35,
    firstSeen: '14:10:00',
    lastSeen: '15:00:00',
    affectedAssets: ['wkstn-avargas-win11'],
    affectedUsers: ['a.vargas@sentinel.corp'],
    techniques: ['T1550.002'],
    confidence: 74,
    stage: 'LATERAL MOVEMENT',
    evidenceCount: 2,
    summary: 'Routine administrative scan generated Kerberos ticket request anomaly; reviewed and resolved as benign baseline update.',
    evidence: [],
    timeline: [],
    aiAnalysis: {
      assessment: 'Based on evidence E-701, benign automated system management script run by internal IT.',
      confidence: 74,
      evidenceIds: ['E-701'],
      observedFacts: ['Ticket request matched scheduled Lansweeper IT inventory run.'],
      inferredConclusions: ['False positive caused by misconfigured inventory service.'],
      predictedNextSteps: ['None.'],
      recommendedInvestigation: ['Update detection exclusion rules.'],
      recommendedDefensiveActions: ['Whitelisted Lansweeper service account.'],
      lastUpdated: '15:10:00'
    },
    responseOptions: []
  },
  {
    id: 'INC-2026-0034',
    title: 'Distributed Port Sweep against VPN Concentrator Ingress',
    severity: 'low',
    status: 'resolved',
    riskScore: 28,
    firstSeen: '08:00:00',
    lastSeen: '09:30:00',
    affectedAssets: ['zone-perimeter-ingress'],
    affectedUsers: ['Network Security'],
    techniques: ['T1046'],
    confidence: 89,
    stage: 'INITIAL ACCESS',
    evidenceCount: 1,
    summary: 'Broad internet background noise scan against UDP 500/4500 blocked automatically by perimeter edge firewalls.',
    evidence: [],
    timeline: [],
    aiAnalysis: {
      assessment: 'Based on evidence E-801, indiscriminate external internet scanning (Shodan/Censys background noise).',
      confidence: 89,
      evidenceIds: ['E-801'],
      observedFacts: ['Scan targeted entire IP block with single SYN packet per port.'],
      inferredConclusions: ['No specific enterprise targeting indicated.'],
      predictedNextSteps: ['None expected against perimeter.'],
      recommendedInvestigation: ['Verify rate-limiting rules on perimeter ingress.'],
      recommendedDefensiveActions: ['Automated block applied by edge firewall.'],
      lastUpdated: '09:40:00'
    },
    responseOptions: []
  }
];

export const allSeedIncidents: Incident[] = [flagshipIncident, ...additionalIncidents];

// 10 defined stages for START ATTACK SIMULATION
export const simulationStages = [
  {
    stageNumber: 1,
    label: 'Stage 1',
    description: 'Monitoring suspicious authentication activity...',
    nodeId: 'node-ip',
    threatLevel: 'LOW' as const,
    riskScore: 35,
    confidence: 65,
    assetUpdates: { 'ast-ext-01': 'at_risk' as const },
    verificationState: 'NOT_VERIFIED' as const
  },
  {
    stageNumber: 2,
    label: 'Stage 2',
    description: 'Multiple failed authentication attempts detected.',
    nodeId: 'node-auth',
    threatLevel: 'ELEVATED' as const,
    riskScore: 50,
    confidence: 75,
    assetUpdates: { 'ast-id-01': 'at_risk' as const },
    verificationState: 'NOT_VERIFIED' as const
  },
  {
    stageNumber: 3,
    label: 'Stage 3',
    description: 'Successful authentication from anomalous device.',
    nodeId: 'node-acc',
    threatLevel: 'HIGH' as const,
    riskScore: 68,
    confidence: 84,
    assetUpdates: { 'ast-id-01': 'compromised' as const, 'ast-ep-01': 'at_risk' as const },
    verificationState: 'NOT_VERIFIED' as const
  },
  {
    stageNumber: 4,
    label: 'Stage 4',
    description: 'Privilege escalation detected.',
    nodeId: 'node-priv',
    threatLevel: 'HIGH' as const,
    riskScore: 82,
    confidence: 90,
    assetUpdates: { 'ast-srv-02': 'at_risk' as const },
    verificationState: 'NOT_VERIFIED' as const
  },
  {
    stageNumber: 5,
    label: 'Stage 5',
    description: 'Sensitive database access observed.',
    nodeId: 'node-db',
    threatLevel: 'CRITICAL' as const,
    riskScore: 90,
    confidence: 94,
    assetUpdates: { 'ast-db-01': 'compromised' as const },
    verificationState: 'NOT_VERIFIED' as const
  },
  {
    stageNumber: 6,
    label: 'Stage 6',
    description: 'Canary/honeytoken triggered.',
    nodeId: 'node-honey',
    threatLevel: 'CRITICAL' as const,
    riskScore: 96,
    confidence: 96,
    assetUpdates: { 'ast-db-decoy': 'compromised' as const },
    verificationState: 'NOT_VERIFIED' as const
  },
  {
    stageNumber: 7,
    label: 'Stage 7',
    description: 'AttackDNA correlation complete.',
    nodeId: 'node-honey',
    threatLevel: 'CRITICAL' as const,
    riskScore: 96,
    confidence: 96,
    assetUpdates: {},
    verificationState: 'NOT_VERIFIED' as const
  },
  {
    stageNumber: 8,
    label: 'Stage 8',
    description: 'Counterfactual response analysis complete.',
    nodeId: 'node-contain',
    threatLevel: 'HIGH' as const,
    riskScore: 60,
    confidence: 96,
    assetUpdates: {},
    verificationState: 'CHECKING' as const
  },
  {
    stageNumber: 9,
    label: 'Stage 9',
    description: 'Simulated containment executed.',
    nodeId: 'node-contain',
    threatLevel: 'ELEVATED' as const,
    riskScore: 25,
    confidence: 96,
    assetUpdates: { 'ast-db-01': 'contained' as const, 'ast-id-01': 'contained' as const },
    verificationState: 'CHECKING' as const
  },
  {
    stageNumber: 10,
    label: 'Stage 10',
    description: 'Verification checks complete.',
    nodeId: 'node-contain',
    threatLevel: 'LOW' as const,
    riskScore: 10,
    confidence: 98,
    assetUpdates: { 'ast-db-01': 'verified' as const, 'ast-id-01': 'verified' as const, 'ast-srv-02': 'normal' as const },
    verificationState: 'VERIFIED' as const
  }
];

export const replayEventsSequence: ReplayEvent[] = [
  {
    step: 1,
    timestamp: '14:32:04',
    title: 'Monitoring Suspicious Authentication Activity',
    eventType: 'AUTH_FAILURE',
    activeNodeId: 'node-ip',
    activeEdgeId: 'e-ip-auth',
    affectedAsset: 'external-tor-exit',
    description: 'Tor exit node 185.220.101.44 attempts credential stuffing against sentinel perimeter.',
    evidenceTriggered: 'E-101',
    systemState: {
      riskScore: 35,
      threatLevel: 'LOW',
      confidence: 65,
      contained: false,
      verificationState: 'NOT_VERIFIED'
    }
  },
  {
    step: 2,
    timestamp: '14:32:11',
    title: 'Multiple Failed Authentication Attempts',
    eventType: 'AUTH_FAILURE',
    activeNodeId: 'node-auth',
    activeEdgeId: 'e-ip-auth',
    affectedAsset: 'idp-okta-sentinel-tenant',
    description: 'Multiple failed password attempts detected for m.ross@sentinel.corp.',
    evidenceTriggered: 'E-102',
    systemState: {
      riskScore: 50,
      threatLevel: 'ELEVATED',
      confidence: 75,
      contained: false,
      verificationState: 'NOT_VERIFIED'
    }
  },
  {
    step: 3,
    timestamp: '14:32:17',
    title: 'Successful Authentication from Anomalous Device',
    eventType: 'AUTH_SUCCESS',
    activeNodeId: 'node-acc',
    activeEdgeId: 'e-auth-acc',
    affectedAsset: 'idp-okta-sentinel-tenant',
    description: 'Valid credential accepted; telemetry immediately flags unregistered Arch Linux fingerprint in ASN AS9009.',
    evidenceTriggered: 'E-103',
    systemState: {
      riskScore: 68,
      threatLevel: 'HIGH',
      confidence: 84,
      contained: false,
      verificationState: 'NOT_VERIFIED'
    }
  },
  {
    step: 4,
    timestamp: '14:32:31',
    title: 'Privilege Escalation Detected',
    eventType: 'PRIVILEGE_ESCALATION',
    activeNodeId: 'node-priv',
    activeEdgeId: 'e-acc-priv',
    affectedAsset: 'api-core-cluster-04',
    description: 'Actor requests self-assignment of ROLE_DATA_RECOVERY_OFFICER, bypassing MFA.',
    evidenceTriggered: 'E-104',
    systemState: {
      riskScore: 82,
      threatLevel: 'HIGH',
      confidence: 90,
      contained: false,
      verificationState: 'NOT_VERIFIED'
    }
  },
  {
    step: 5,
    timestamp: '14:32:45',
    title: 'Sensitive Database Access Observed',
    eventType: 'DB_CONNECT',
    activeNodeId: 'node-db',
    activeEdgeId: 'e-priv-asset',
    affectedAsset: 'db-customer-aurora-primary',
    description: 'Direct connection established to production db-customer-aurora-primary; bulk table read queried.',
    evidenceTriggered: 'E-106',
    systemState: {
      riskScore: 90,
      threatLevel: 'CRITICAL',
      confidence: 94,
      contained: false,
      verificationState: 'NOT_VERIFIED'
    }
  },
  {
    step: 6,
    timestamp: '14:32:58',
    title: 'Canary/Honeytoken Triggered',
    eventType: 'HONEYTOKEN_TRIGGER',
    activeNodeId: 'node-honey',
    activeEdgeId: 'e-db-honey',
    affectedAsset: 'db-decoy-payroll-shadow',
    description: 'TRAP TRIGGERED: Injected honeytoken PG_SUPERUSER_RECOVERY_KEY accessed, boosting certainty to 96%.',
    evidenceTriggered: 'E-109',
    systemState: {
      riskScore: 96,
      threatLevel: 'CRITICAL',
      confidence: 96,
      contained: false,
      verificationState: 'NOT_VERIFIED'
    }
  },
  {
    step: 7,
    timestamp: '14:33:01',
    title: 'AttackDNA Correlation Complete',
    eventType: 'CORRELATION_COMPLETE',
    activeNodeId: 'node-honey',
    activeEdgeId: 'e-db-honey',
    affectedAsset: 'db-customer-aurora-primary',
    description: 'Full temporal and causal graph constructed connecting external IP through auth to decoy trigger.',
    evidenceTriggered: 'E-109',
    systemState: {
      riskScore: 96,
      threatLevel: 'CRITICAL',
      confidence: 96,
      contained: false,
      verificationState: 'NOT_VERIFIED'
    }
  },
  {
    step: 8,
    timestamp: '14:33:03',
    title: 'Counterfactual Response Analysis Complete',
    eventType: 'SIMULATION_ANALYSIS',
    activeNodeId: 'node-contain',
    activeEdgeId: 'e-asset-contain',
    affectedAsset: 'idp-okta-sentinel-tenant',
    description: 'Defensive simulator evaluated 5 responses; selected "Revoke Session" for 94% security benefit and 0 business downtime.',
    systemState: {
      riskScore: 60,
      threatLevel: 'HIGH',
      confidence: 96,
      contained: false,
      verificationState: 'CHECKING'
    }
  },
  {
    step: 9,
    timestamp: '14:33:05',
    title: 'Simulated Containment Executed',
    eventType: 'CONTAINMENT_EXECUTION',
    activeNodeId: 'node-contain',
    activeEdgeId: 'e-asset-contain',
    affectedAsset: 'db-customer-aurora-primary',
    description: 'Sentinel autonomous policy severed database pool socket and revoked Okta session tokens.',
    systemState: {
      riskScore: 25,
      threatLevel: 'ELEVATED',
      confidence: 96,
      contained: true,
      verificationState: 'CHECKING'
    }
  },
  {
    step: 10,
    timestamp: '14:33:10',
    title: 'Verification Checks Complete',
    eventType: 'VERIFICATION_CONFIRMED',
    activeNodeId: 'node-contain',
    activeEdgeId: 'e-honey-contain',
    affectedAsset: 'db-customer-aurora-primary',
    description: '5/5 automated attestation checks passed: 0 active sockets, session dead, lateral spread arrested. "CONTAINMENT VERIFIED".',
    evidenceTriggered: 'E-113',
    systemState: {
      riskScore: 10,
      threatLevel: 'LOW',
      confidence: 98,
      contained: true,
      verificationState: 'VERIFIED'
    }
  }
];
