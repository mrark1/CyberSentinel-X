/**
 * CyberSentinel X - Synthetic Telemetry Engine
 * Generates synthetic, safe in-memory telemetry streams for defensive SOC simulations.
 * All events are completely synthetic and executed in-memory.
 */

import { AttackScenarioType, EventSourceType, RawTelemetryEvent } from '../types/security';

const BENIGN_USERS = ['a_patel', 'j_miller', 'm_santos', 'c_zheng', 'l_williams', 'svc_datadog', 'svc_backup'];
const BENIGN_ASSETS = ['api-gateway-us-east', 'k8s-worker-pool-02', 'auth-service-pod-09', 'metrics-collector-01', 'cdn-edge-cf'];

/**
 * Generates a realistic baseline benign security/telemetry event for SOC stream.
 */
export function generateBaselineNoiseEvent(): RawTelemetryEvent {
  const sources: EventSourceType[] = ['AUTH', 'ENDPOINT', 'NETWORK', 'DATABASE', 'CLOUD'];
  const sourceType = sources[Math.floor(Math.random() * sources.length)];
  const user = BENIGN_USERS[Math.floor(Math.random() * BENIGN_USERS.length)];
  const asset = BENIGN_ASSETS[Math.floor(Math.random() * BENIGN_ASSETS.length)];
  const now = new Date().toTimeString().slice(0, 8);

  switch (sourceType) {
    case 'AUTH':
      return {
        sourceType: 'AUTH',
        sourceRaw: 'Okta Identity Cloud',
        timestamp: now,
        payload: {
          user,
          ip: `192.168.1.${Math.floor(Math.random() * 200 + 10)}`,
          action: 'session_refresh',
          status: 'success',
          mfa_method: 'FIDO2_WebAuthn',
          service: 'Sentinel SSO Gateway'
        }
      };

    case 'ENDPOINT':
      return {
        sourceType: 'ENDPOINT',
        sourceRaw: 'CrowdStrike Falcon Agent',
        timestamp: now,
        payload: {
          host: asset,
          user,
          process: '/usr/local/bin/node',
          command: 'node dist/index.js --health-check',
          elevation: false,
          exit_code: 0
        }
      };

    case 'NETWORK':
      return {
        sourceType: 'NETWORK',
        sourceRaw: 'AWS VPC Flow Logs',
        timestamp: now,
        payload: {
          src_ip: '10.0.1.5',
          dst_ip: '10.0.2.20',
          dst_port: 443,
          proto: 'TCP',
          bytes: Math.floor(Math.random() * 15000 + 500),
          action: 'ALLOW'
        }
      };

    case 'DATABASE':
      return {
        sourceType: 'DATABASE',
        sourceRaw: 'PostgreSQL RDS Audit Log',
        timestamp: now,
        payload: {
          db_user: user,
          database: 'app_read_replica',
          query: 'SELECT status FROM job_queue WHERE completed = false LIMIT 10;',
          rows_returned: 10,
          is_sensitive: false,
          client_ip: '10.0.2.14'
        }
      };

    case 'CLOUD':
    default:
      return {
        sourceType: 'CLOUD',
        sourceRaw: 'AWS CloudTrail',
        timestamp: now,
        payload: {
          principal: `arn:aws:iam::account:user/${user}`,
          resource: 'arn:aws:s3:::application-assets-cache',
          action: 'GetObject',
          status: 'success',
          region: 'us-east-1'
        }
      };
  }
}

/**
 * Returns raw telemetry events defining an attack scenario.
 */
export function getScenarioRawEvents(scenario: AttackScenarioType): RawTelemetryEvent[] {
  const baseTime = new Date();

  const timeAt = (secOffset: number) => {
    const d = new Date(baseTime.getTime() + secOffset * 1000);
    return d.toTimeString().slice(0, 8);
  };

  switch (scenario) {
    case 'CREDENTIAL_COMPROMISE':
      return [
        {
          sourceType: 'AUTH',
          sourceRaw: 'Okta System Log',
          timestamp: timeAt(0),
          payload: {
            user: 's_chen',
            ip: '185.220.101.44',
            action: 'failed_login',
            outcome: 'FAILURE',
            reason: 'INVALID_CREDENTIALS',
            attempts: 5,
            asn: 'AS9009 (Tor Exit)',
            service: 'Sentinel SSO Gateway'
          }
        },
        {
          sourceType: 'AUTH',
          sourceRaw: 'Okta System Log',
          timestamp: timeAt(2),
          payload: {
            user: 's_chen',
            ip: '185.220.101.44',
            action: 'successful_login',
            outcome: 'SUCCESS',
            device_fingerprint: 'DEV-UNKNOWN-TOR',
            is_new_device: true,
            service: 'Sentinel SSO Gateway'
          }
        },
        {
          sourceType: 'ENDPOINT',
          sourceRaw: 'Host Auditd (ws-s-chen-mac)',
          timestamp: timeAt(4),
          payload: {
            user: 's_chen',
            host: 'internal-bastion-us-east',
            process: '/usr/bin/sudo',
            command: 'sudo -u m_ross_dba su -',
            elevation: true,
            is_elevated: true
          }
        },
        {
          sourceType: 'NETWORK',
          sourceRaw: 'Core VPC NetFlow',
          timestamp: timeAt(6),
          payload: {
            src_ip: '10.0.1.15',
            dst_ip: '10.0.4.0/24',
            flag: 'SYN_SCAN',
            ports_scanned: [22, 3306, 5432, 6379, 9200],
            target_asset: 'secure-core-vpc'
          }
        },
        {
          sourceType: 'DATABASE',
          sourceRaw: 'Aurora PostgreSQL Audit',
          timestamp: timeAt(8),
          payload: {
            db_user: 'm_ross_dba_temp',
            database: 'db-customer-aurora-primary',
            client_ip: '10.0.1.15',
            query: 'SELECT * FROM salary_records_restricted WHERE region = "GLOBAL";',
            rows_returned: 1420,
            is_sensitive: true
          }
        },
        {
          sourceType: 'DECEPTION',
          sourceRaw: 'CyberSentinel Canary Decoy Engine',
          timestamp: timeAt(10),
          payload: {
            accessor: 'm_ross_dba_temp',
            trap_name: 'db-decoy-payroll-shadow',
            target_asset: 'db-decoy-payroll-shadow',
            src_ip: '185.220.101.44',
            dst_ip: '10.0.4.99',
            access_type: 'canary_access_probe',
            token_id: 'HNY-PAYROLL-9912'
          }
        },
        {
          sourceType: 'AUTH',
          sourceRaw: 'CyberSentinel Autonomous Controller',
          timestamp: timeAt(12),
          payload: {
            user: 's_chen',
            ip: '10.0.0.1',
            action: 'session_revoke',
            status: 'success',
            tokens_invalidated: 3,
            scope: 'ALL_ACTIVE_SESSIONS'
          }
        },
        {
          sourceType: 'ENDPOINT',
          sourceRaw: 'CyberSentinel Verification Engine',
          timestamp: timeAt(14),
          payload: {
            host: 'internal-bastion-us-east',
            action: 'verification_probe',
            status: 'success',
            active_sockets_found: 0,
            target_user: 'm_ross_dba_temp'
          }
        }
      ];

    case 'RANSOMWARE_OUTBREAK':
      return [
        {
          sourceType: 'ENDPOINT',
          sourceRaw: 'CrowdStrike EDR',
          timestamp: timeAt(0),
          payload: {
            user: 'j_doe',
            host: 'finance-wkst-08',
            process: 'powershell.exe',
            command: 'powershell.exe -enc aWV4IChOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQp',
            elevation: false
          }
        },
        {
          sourceType: 'ENDPOINT',
          sourceRaw: 'Host Auditd',
          timestamp: timeAt(2),
          payload: {
            user: 'j_doe',
            host: 'finance-wkst-08',
            process: 'vssadmin.exe',
            command: 'vssadmin delete shadows /all /quiet',
            elevation: true,
            is_elevated: true
          }
        },
        {
          sourceType: 'NETWORK',
          sourceRaw: 'Internal Firewall IDS',
          timestamp: timeAt(4),
          payload: {
            src_ip: '10.0.2.88',
            dst_ip: '10.0.2.0/24',
            flag: 'SYN_SCAN',
            ports_scanned: [445, 139, 3389],
            target_asset: 'finance-subnet'
          }
        },
        {
          sourceType: 'DECEPTION',
          sourceRaw: 'CyberSentinel Canary File Monitor',
          timestamp: timeAt(6),
          payload: {
            accessor: 'SYSTEM/j_doe',
            trap_name: 'canary-fin-statement-2025.xlsx',
            target_asset: 'share-nas-finance-01',
            src_ip: '10.0.2.88',
            access_type: 'canary_file_modified',
            token_id: 'CANARY-FIN-008'
          }
        },
        {
          sourceType: 'ENDPOINT',
          sourceRaw: 'CyberSentinel Autonomous Controller',
          timestamp: timeAt(8),
          payload: {
            host: 'finance-wkst-08',
            action: 'isolate_endpoint',
            status: 'success',
            isolation_rule: 'DROP_ALL_EXCEPT_SOC_MANAGEMENT'
          }
        }
      ];

    case 'CLOUD_SUPPLY_CHAIN':
      return [
        {
          sourceType: 'CLOUD',
          sourceRaw: 'GitHub Action Audit',
          timestamp: timeAt(0),
          payload: {
            principal: 'gh-runner-ci-prod-04',
            action: 'TokenExfiltration',
            resource: 'GITHUB_SECRETS',
            ip: '198.51.100.99'
          }
        },
        {
          sourceType: 'CLOUD',
          sourceRaw: 'AWS CloudTrail',
          timestamp: timeAt(2),
          payload: {
            principal: 'arn:aws:iam::112233445566:role/DeployPipelineRole',
            action: 'AssumeRole',
            resource: 'arn:aws:iam::112233445566:role/SecuritySuperAdmin',
            source_ip: '198.51.100.99'
          }
        },
        {
          sourceType: 'CLOUD',
          sourceRaw: 'AWS CloudTrail',
          timestamp: timeAt(4),
          payload: {
            principal: 'arn:aws:iam::112233445566:role/SecuritySuperAdmin',
            action: 'ListBuckets',
            resource: 'arn:aws:s3:::*',
            status: 'success'
          }
        },
        {
          sourceType: 'DECEPTION',
          sourceRaw: 'CyberSentinel Cloud Decoy',
          timestamp: timeAt(6),
          payload: {
            accessor: 'SecuritySuperAdmin',
            trap_name: 's3-decoy-customer-pii-backup',
            target_asset: 'arn:aws:s3:::sentinel-canary-pii-db',
            src_ip: '198.51.100.99',
            access_type: 'canary_s3_read',
            token_id: 'HNY-AWS-CANARY-01'
          }
        },
        {
          sourceType: 'CLOUD',
          sourceRaw: 'CyberSentinel Autonomous Controller',
          timestamp: timeAt(8),
          payload: {
            principal: 'SecuritySuperAdmin',
            action: 'AttachRevocationPolicy',
            status: 'success',
            resource: 'arn:aws:iam::112233445566:policy/DenyAllTemporaryCredentials'
          }
        }
      ];
  }
}
