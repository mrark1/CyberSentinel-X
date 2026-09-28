/**
 * CyberSentinel X - Core Security State Store (Zustand)
 * Manages reactive SOC telemetry, incidents, AttackDNA correlation,
 * CyberTwin assets, and autonomous simulation engine.
 */

import { create } from 'zustand';
import {
  allSeedIncidents,
  flagshipIncident,
  initialSettings,
  replayEventsSequence,
  seedAssets,
  seedDeceptionObjects,
  seedEvents,
  simulationStages
} from '../mock/seedData';
import {
  Asset,
  AttackScenarioType,
  DeceptionObject,
  Incident,
  RawTelemetryEvent,
  ReplayEvent,
  SecurityEvent,
  SimulationResult,
  SystemSettings,
  ThreatLevel
} from '../types/security';
import {
  normalizeEvent,
  evaluateSingleEvent,
  correlateFindingsIntoIncidents,
  calculateIncidentRisk,
  calculateOverallThreatLevel,
  executeResponseAction as engineExecuteResponseAction,
  runVerificationChecks as engineRunVerificationChecks,
  getScenarioRawEvents,
  generateBaselineNoiseEvent
} from '../engine';

interface AttackSimulationEngineState {
  isActive: boolean;
  step: number; // 0 to 10
  phase: 'idle' | 'running' | 'honeytoken_tripped' | 'containment_executing' | 'checking' | 'verified';
  statusMessage: string;
  activeNodeId: string;
  timerId: number | null;
  verificationState: 'NOT_VERIFIED' | 'CHECKING' | 'VERIFIED';
}

interface SecurityStore {
  incidents: Incident[];
  selectedIncidentId: string;
  events: SecurityEvent[];
  assets: Asset[];
  deceptionObjects: DeceptionObject[];
  threatLevel: ThreatLevel;
  settings: SystemSettings;
  
  // Flagship Simulation Runner
  simulation: AttackSimulationEngineState;
  
  // Attack Replay Controller
  replayStepIndex: number;
  isReplayPlaying: boolean;
  replayTimerId: number | null;

  // Actions
  setSelectedIncidentId: (id: string) => void;
  getIncident: (id: string) => Incident | undefined;
  startLiveAttackSimulation: () => void;
  stopAttackSimulation: () => void;
  resetToBaseline: () => void;
  executeSimulatedAction: (incidentId: string, actionId: string) => SimulationResult;
  triggerDeceptionManually: (id: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  
  // Replay actions
  setReplayStep: (stepIndex: number) => void;
  nextReplayStep: () => void;
  prevReplayStep: () => void;
  playReplay: () => void;
  pauseReplay: () => void;
  resetReplay: () => void;

  // Pipeline Engine Actions
  ingestRawTelemetry: (raw: RawTelemetryEvent | Partial<SecurityEvent>) => void;
  triggerAttackScenario: (scenario: AttackScenarioType) => void;
  injectBaselineNoise: () => void;

  // Filter helpers
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useSecurityStore = create<SecurityStore>((set, get) => ({
  incidents: JSON.parse(JSON.stringify(allSeedIncidents)),
  selectedIncidentId: 'INC-2026-0042',
  events: [...seedEvents],
  assets: JSON.parse(JSON.stringify(seedAssets)),
  deceptionObjects: JSON.parse(JSON.stringify(seedDeceptionObjects)),
  threatLevel: 'CRITICAL',
  settings: { ...initialSettings },
  searchQuery: '',

  simulation: {
    isActive: false,
    step: 0,
    phase: 'idle',
    statusMessage: 'Ready for simulation',
    activeNodeId: 'node-db',
    timerId: null,
    verificationState: 'NOT_VERIFIED'
  },

  replayStepIndex: 0,
  isReplayPlaying: false,
  replayTimerId: null,

  setSelectedIncidentId: (id: string) => set({ selectedIncidentId: id }),

  setSearchQuery: (q: string) => set({ searchQuery: q }),

  getIncident: (id: string) => {
    return get().incidents.find((i) => i.id === id);
  },

  updateSettings: (newSettings: Partial<SystemSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },

  triggerDeceptionManually: (id: string) => {
    set((state) => {
      const now = new Date().toTimeString().slice(0, 8);
      const updatedDeception = state.deceptionObjects.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            status: 'triggered' as const,
            triggerCount: d.triggerCount + 1,
            lastTriggered: now
          };
        }
        return d;
      });

      const triggeredObj = updatedDeception.find((d) => d.id === id);

      const newEvt: SecurityEvent = {
        id: `evt-decoy-${Date.now()}`,
        timestamp: now,
        type: 'HONEYTOKEN_TRIGGER',
        severity: 'critical',
        source: '185.220.101.44',
        sourceIp: '185.220.101.44',
        destinationIp: '10.0.4.99',
        actor: 'm_ross_dba_temp',
        assetId: triggeredObj?.targetAsset || 'db-decoy-payroll-shadow',
        action: 'canary_access_probe',
        status: 'detected',
        description: `Canary decoy trap tripped: ${triggeredObj?.name || id}. Threat confidence boosted to 96%.`,
        evidenceRefId: 'E-109'
      };

      // Boost flagship incident confidence to 96% and add evidence
      const updatedIncidents = state.incidents.map((inc) => {
        if (inc.id === 'INC-2026-0042') {
          return {
            ...inc,
            confidence: 96,
            riskScore: Math.min(100, inc.riskScore + 6),
            stage: 'DECEPTION TRIGGER' as const
          };
        }
        return inc;
      });

      return {
        deceptionObjects: updatedDeception,
        events: [newEvt, ...state.events],
        incidents: updatedIncidents,
        threatLevel: 'CRITICAL'
      };
    });
  },

  resetToBaseline: () => {
    const { simulation, replayTimerId } = get();
    if (simulation.timerId) clearInterval(simulation.timerId);
    if (replayTimerId) clearInterval(replayTimerId);

    set({
      incidents: JSON.parse(JSON.stringify(allSeedIncidents)),
      events: JSON.parse(JSON.stringify(seedEvents)),
      assets: JSON.parse(JSON.stringify(seedAssets)),
      deceptionObjects: JSON.parse(JSON.stringify(seedDeceptionObjects)),
      threatLevel: 'LOW',
      selectedIncidentId: 'INC-2026-0042',
      searchQuery: '',
      simulation: {
        isActive: false,
        step: 0,
        phase: 'idle',
        statusMessage: 'Baseline environment restored — Threat Level LOW',
        activeNodeId: 'node-ip',
        timerId: null,
        verificationState: 'NOT_VERIFIED'
      },
      replayStepIndex: 0,
      isReplayPlaying: false,
      replayTimerId: null
    });
  },

  startLiveAttackSimulation: () => {
    const { simulation } = get();
    if (simulation.timerId) clearInterval(simulation.timerId);

    // Initial state: Stage 1
    const stage1 = simulationStages[0];
    set((state) => ({
      threatLevel: stage1.threatLevel,
      simulation: {
        isActive: true,
        step: 1,
        phase: 'running',
        statusMessage: `Stage 1: ${stage1.description}`,
        activeNodeId: stage1.nodeId,
        timerId: null,
        verificationState: 'NOT_VERIFIED'
      },
      incidents: state.incidents.map((inc): Incident => {
        if (inc.id === 'INC-2026-0042') {
          return {
            ...inc,
            status: 'investigating',
            riskScore: stage1.riskScore,
            confidence: stage1.confidence,
            stage: 'INITIAL ACCESS',
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
        }
        return inc;
      })
    }));

    const stepInterval = get().settings.demoSpeedMs || 1400;

    const timer = window.setInterval(() => {
      const cur = get().simulation;
      const nextStepNum = cur.step + 1;

      if (nextStepNum > 10) {
        clearInterval(timer);
        return;
      }

      const stageInfo = simulationStages[nextStepNum - 1];

      set((state) => {
        // Update assets state according to stageInfo.assetUpdates
        const updatedAssets = state.assets.map((ast) => {
          const newStatus = (stageInfo.assetUpdates as Record<string, any>)[ast.assetId];
          if (newStatus) {
            return {
              ...ast,
              status: newStatus,
              risk: newStatus === 'verified' ? 10 : newStatus === 'contained' ? 25 : newStatus === 'compromised' ? 95 : 45
            };
          }
          return ast;
        });

        // Trigger decoy at stage 6
        const updatedDeception = state.deceptionObjects.map((d) => {
          if (nextStepNum >= 6 && d.id === 'decoy-001') {
            return {
              ...d,
              status: 'triggered' as const,
              triggerCount: 1,
              lastTriggered: new Date().toTimeString().slice(0, 8)
            };
          }
          return d;
        });

        const isVerified = nextStepNum === 10;
        const isContained = nextStepNum >= 9;
        const isChecking = nextStepNum === 8 || nextStepNum === 9;

        const updatedIncidents: Incident[] = state.incidents.map((inc): Incident => {
          if (inc.id === 'INC-2026-0042') {
            const checkStatus = (isVerified ? 'pass' : isChecking ? 'checking' : 'pending') as 'pass' | 'fail' | 'checking' | 'pending';
            return {
              ...inc,
              riskScore: stageInfo.riskScore,
              confidence: stageInfo.confidence,
              status: isVerified
                ? ('resolved' as const)
                : isContained
                ? ('contained' as const)
                : ('investigating' as const),
              containmentStatus: {
                isContained,
                verificationState: isVerified ? ('VERIFIED' as const) : isChecking ? ('CHECKING' as const) : ('NOT_VERIFIED' as const),
                containedAt: isContained ? '14:33:05' : undefined,
                verifiedAt: isVerified ? '14:33:10' : undefined,
                executedAction: isContained ? 'Revoke User Session & Invalidate Tokens' : undefined,
                verifierNotes: isVerified ? 'All 5 automated checks verified: 0 active sockets, session dead.' : undefined,
                checks: [
                  { name: 'Session invalidated', status: checkStatus },
                  { name: 'Database connection closed', status: checkStatus },
                  { name: 'Privileged token inactive', status: checkStatus },
                  { name: 'Honeytoken access stopped', status: checkStatus },
                  { name: 'No new correlated events', status: checkStatus }
                ]
              }
            };
          }
          return inc;
        });

        // Add live telemetry event matching stage
        const newEvt: SecurityEvent = {
          id: `sim-evt-${nextStepNum}-${Date.now()}`,
          timestamp: new Date().toTimeString().slice(0, 8),
          type: nextStepNum === 2
            ? 'AUTH_FAILURE'
            : nextStepNum === 3
            ? 'AUTH_SUCCESS'
            : nextStepNum === 4
            ? 'PRIVILEGE_ESCALATION'
            : nextStepNum === 5
            ? 'DB_CONNECT'
            : nextStepNum === 6
            ? 'HONEYTOKEN_TRIGGER'
            : nextStepNum === 9
            ? 'SESSION_REVOKED'
            : nextStepNum === 10
            ? 'VERIFY_PROBE'
            : 'NETWORK_SWEEP',
          severity: stageInfo.threatLevel === 'CRITICAL' ? 'critical' : stageInfo.threatLevel === 'HIGH' ? 'high' : 'medium',
          source: nextStepNum >= 9 ? '10.0.0.1' : '185.220.101.44',
          sourceIp: nextStepNum >= 9 ? '10.0.0.1' : '185.220.101.44',
          destinationIp: '10.0.4.12',
          actor: nextStepNum >= 9 ? 'Sentinel Autonomous Controller' : 'm.ross@sentinel.corp',
          assetId: 'db-customer-aurora-primary',
          action: `SIMULATION_STAGE_${nextStepNum}`,
          status: 'detected',
          description: `[STAGE ${nextStepNum}/10] ${stageInfo.description}`,
          evidenceRefId: nextStepNum === 6 ? 'E-109' : nextStepNum === 10 ? 'E-113' : `E-10${nextStepNum}`,
          isSimulated: true
        };

        return {
          threatLevel: stageInfo.threatLevel,
          incidents: updatedIncidents,
          deceptionObjects: updatedDeception,
          assets: updatedAssets,
          events: [newEvt, ...state.events],
          simulation: {
            isActive: !isVerified,
            step: nextStepNum,
            phase: isVerified
              ? 'verified'
              : isContained
              ? 'containment_executing'
              : isChecking
              ? 'checking'
              : nextStepNum === 6
              ? 'honeytoken_tripped'
              : 'running',
            statusMessage: isVerified
              ? '✓ CONTAINMENT VERIFIED — Active socket severed, lateral path eliminated'
              : `Stage ${nextStepNum}: ${stageInfo.description}`,
            activeNodeId: stageInfo.nodeId,
            timerId: isVerified ? null : timer,
            verificationState: isVerified ? 'VERIFIED' : isChecking ? 'CHECKING' : 'NOT_VERIFIED'
          }
        };
      });
    }, stepInterval);

    set((state) => ({
      simulation: { ...state.simulation, timerId: timer }
    }));
  },

  stopAttackSimulation: () => {
    const { simulation } = get();
    if (simulation.timerId) clearInterval(simulation.timerId);
    set((state) => ({
      simulation: {
        ...state.simulation,
        isActive: false,
        timerId: null,
        statusMessage: 'Simulation paused by operator'
      }
    }));
  },

  executeSimulatedAction: (incidentId: string, actionId: string) => {
    const incident = get().getIncident(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const { updatedIncident, result } = engineExecuteResponseAction(incident, actionId);
    const verif = engineRunVerificationChecks(updatedIncident, actionId);

    set((state) => {
      const updatedIncidents = state.incidents.map((inc) => (inc.id === incidentId ? updatedIncident : inc));
      const newThreat = calculateOverallThreatLevel(updatedIncidents);

      // Create containment security event
      const now = new Date().toTimeString().slice(0, 8);
      const containmentEvt = normalizeEvent({
        eventType: 'SESSION_REVOKED',
        sourceType: 'AUTH',
        severity: 'info',
        source: '10.0.0.1',
        destination: incident.affectedAssets[0] || '10.0.4.12',
        actor: 'Sentinel Autonomous Controller',
        action: `containment_${actionId}`,
        status: 'success',
        description: `Autonomous containment applied: ${result.actionId}. Threat reduced by ${result.threatReductionPercent}%.`,
        evidenceId: 'E-111',
        timestamp: now
      });

      return {
        incidents: updatedIncidents,
        threatLevel: newThreat,
        events: [containmentEvt, ...state.events]
      };
    });

    return result;
  },

  // Pipeline Engine Ingestion
  ingestRawTelemetry: (raw: RawTelemetryEvent | Partial<SecurityEvent>) => {
    const norm = normalizeEvent(raw);
    const findings = evaluateSingleEvent(norm, get().events);
    const updatedIncidents = correlateFindingsIntoIncidents(findings, [norm], get().incidents);
    const newThreat = calculateOverallThreatLevel(updatedIncidents);

    set((state) => ({
      events: [norm, ...state.events.slice(0, 150)],
      incidents: updatedIncidents,
      threatLevel: newThreat
    }));
  },

  triggerAttackScenario: (scenario: AttackScenarioType) => {
    const rawEvents = getScenarioRawEvents(scenario);
    if (!rawEvents.length) return;

    let idx = 0;
    const interval = window.setInterval(() => {
      if (idx >= rawEvents.length) {
        clearInterval(interval);
        return;
      }
      get().ingestRawTelemetry(rawEvents[idx]);
      idx += 1;
    }, 1200);
  },

  injectBaselineNoise: () => {
    const raw = generateBaselineNoiseEvent();
    get().ingestRawTelemetry(raw);
  },

  // Attack Replay Controls
  setReplayStep: (stepIndex: number) => {
    const clamped = Math.max(0, Math.min(stepIndex, replayEventsSequence.length - 1));
    const stepData = replayEventsSequence[clamped];
    set({
      replayStepIndex: clamped,
      threatLevel: stepData.systemState.threatLevel
    });
  },

  nextReplayStep: () => {
    const cur = get().replayStepIndex;
    if (cur < replayEventsSequence.length - 1) {
      get().setReplayStep(cur + 1);
    }
  },

  prevReplayStep: () => {
    const cur = get().replayStepIndex;
    if (cur > 0) {
      get().setReplayStep(cur - 1);
    }
  },

  playReplay: () => {
    const { replayTimerId } = get();
    if (replayTimerId) clearInterval(replayTimerId);

    const timer = window.setInterval(() => {
      const current = get().replayStepIndex;
      if (current >= replayEventsSequence.length - 1) {
        clearInterval(timer);
        set({ isReplayPlaying: false, replayTimerId: null });
        return;
      }
      get().setReplayStep(current + 1);
    }, 1800);

    set({ isReplayPlaying: true, replayTimerId: timer });
  },

  pauseReplay: () => {
    const { replayTimerId } = get();
    if (replayTimerId) clearInterval(replayTimerId);
    set({ isReplayPlaying: false, replayTimerId: null });
  },

  resetReplay: () => {
    const { replayTimerId } = get();
    if (replayTimerId) clearInterval(replayTimerId);
    set({ replayStepIndex: 0, isReplayPlaying: false, replayTimerId: null });
  }
}));
