/**
 * CyberSentinel X - Demo Controller (Zustand)
 * Central orchestrator for the flagship hackathon demonstration scenario.
 * Synchronizes Incident, AttackDNA, CyberTwin, Deception, Sentinel AI, and Replay states.
 */

import { create } from 'zustand';
import {
  CANDIDATE_ACTIONS_DATA,
  DECEPTION_CALLOUT_DATA,
  DEMO_SCENARIO_STEPS,
  FLAGSHIP_INCIDENT_ID,
  VERIFICATION_CHECKS_LIST
} from './demoScenario';
import { DemoPhase, DemoState, DemoStepDefinition } from './demoState';
import { useSecurityStore } from '../store/useSecurityStore';
import { AssetStatus, SecurityEvent } from '../types/security';
import { normalizeEvent } from '../engine';
import { sentinelAnalyst } from '../ai/sentinelAnalyst';

interface DemoStore extends DemoState {
  // Actions
  startDemo: () => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
  nextStep: () => void;
  prevStep: () => void;
  jumpToStep: (stepIndex: number) => void;
  selectResponseAction: (actionId: string) => void;
  approveContainment: () => void;
  dismissDeceptionAlert: () => void;
  dismissResolvedModal: () => void;
  openResolvedModal: () => void;
  openResponseModal: () => void;
  resetDemo: () => void;
}

const INITIAL_DEMO_STATE: DemoState = {
  currentPhase: 'IDLE',
  currentStepIndex: 0,
  isPlaying: false,
  isPaused: false,
  activeNodeId: 'node-ip',
  revealedNodeIds: ['node-ip'],
  threatLevel: 'LOW',
  riskScore: 15,
  confidence: 50,
  statusMessage: 'SOC ONLINE — Ready to start demonstration',
  workflowStage: 'OBSERVE',
  selectedResponseActionId: null,
  isSimulatingResponse: false,
  isContainmentApproved: false,
  verificationStepIndex: -1,
  showDeceptionAlert: false,
  showIncidentResolvedModal: false,
  showResponseDecisionModal: false,
  degradedSubsystems: []
};

let demoTimerId: any = null;
let verificationTimerId: any = null;

function clearAllTimers() {
  if (demoTimerId) {
    clearTimeout(demoTimerId);
    demoTimerId = null;
  }
  if (verificationTimerId) {
    clearInterval(verificationTimerId);
    verificationTimerId = null;
  }
}

export const useDemoStore = create<DemoStore>((set, get) => ({
  ...INITIAL_DEMO_STATE,

  startDemo: () => {
    // Double-click protection: if already actively playing, do not re-invoke
    if (get().isPlaying) return;
    clearAllTimers();
    get().jumpToStep(1);
  },

  pauseDemo: () => {
    clearAllTimers();
    set({ isPlaying: false, isPaused: true });
  },

  resumeDemo: () => {
    set({ isPlaying: true, isPaused: false });
    const currentStep = DEMO_SCENARIO_STEPS[get().currentStepIndex];
    if (currentStep && !currentStep.isOperatorDecisionPoint && currentStep.autoDelayMs > 0) {
      demoTimerId = globalThis.setTimeout(() => {
        get().nextStep();
      }, currentStep.autoDelayMs);
    }
  },

  nextStep: () => {
    const curIdx = get().currentStepIndex;
    if (curIdx < DEMO_SCENARIO_STEPS.length - 1) {
      get().jumpToStep(curIdx + 1);
    }
  },

  prevStep: () => {
    const curIdx = get().currentStepIndex;
    if (curIdx > 0) {
      get().jumpToStep(curIdx - 1);
    }
  },

  jumpToStep: (stepIndex: number) => {
    clearAllTimers();
    const clampedIndex = Math.max(0, Math.min(stepIndex, DEMO_SCENARIO_STEPS.length - 1));
    const stepDef = DEMO_SCENARIO_STEPS[clampedIndex];

    const showDeception = stepDef.phase === 'DECEPTION_TRIGGERED';
    const showResolved = stepDef.phase === 'VERIFIED';
    const showResponse = stepDef.phase === 'ANALYSIS_READY' || stepDef.phase === 'RESPONSE_SIMULATION';

    // 1. Update demo state
    set({
      currentPhase: stepDef.phase,
      currentStepIndex: clampedIndex,
      isPlaying: !stepDef.isOperatorDecisionPoint && stepDef.phase !== 'VERIFIED',
      isPaused: false,
      activeNodeId: stepDef.activeNodeId,
      revealedNodeIds: stepDef.revealedNodeIds,
      threatLevel: stepDef.threatLevel,
      riskScore: stepDef.riskScore,
      confidence: stepDef.confidence,
      statusMessage: stepDef.statusMessage,
      workflowStage: stepDef.workflowStage,
      showDeceptionAlert: showDeception,
      showIncidentResolvedModal: showResolved,
      showResponseDecisionModal: showResponse,
      verificationStepIndex: stepDef.phase === 'VERIFIED' ? 5 : stepDef.phase === 'VERIFYING' ? 0 : -1
    });

    // 2. Synchronize with useSecurityStore
    const secStore = useSecurityStore.getState();

    // A. Update Threat Level
    secStore.threatLevel = stepDef.threatLevel;

    // B. Update Assets
    const updatedAssets = secStore.assets.map((asset) => {
      const newStatus = stepDef.assetUpdates[asset.assetId];
      if (newStatus) {
        const risk =
          newStatus === 'verified'
            ? 10
            : newStatus === 'contained'
            ? 25
            : newStatus === 'compromised'
            ? 95
            : newStatus === 'at_risk'
            ? 70
            : 20;
        return { ...asset, status: newStatus, risk };
      }
      return asset;
    });

    // C. Update Incident
    const isContained = clampedIndex >= 11;
    const isVerified = clampedIndex === 13;
    const isChecking = clampedIndex === 12;

    const updatedIncidents = secStore.incidents.map((inc) => {
      if (inc.id === FLAGSHIP_INCIDENT_ID) {
        return {
          ...inc,
          riskScore: stepDef.riskScore,
          confidence: stepDef.confidence,
          stage:
            stepDef.workflowStage === 'CONTAIN'
              ? ('CONTAINMENT' as const)
              : stepDef.workflowStage === 'VERIFY'
              ? ('VERIFICATION' as const)
              : stepDef.phase === 'DECEPTION_TRIGGERED'
              ? ('DECEPTION TRIGGER' as const)
              : stepDef.phase === 'DATABASE_ACCESS'
              ? ('DATA ACCESS' as const)
              : stepDef.phase === 'PRIVILEGE_ESCALATION'
              ? ('PRIVILEGE ESCALATION' as const)
              : stepDef.phase === 'ACCOUNT_COMPROMISED'
              ? ('ACCOUNT COMPROMISE' as const)
              : ('INITIAL ACCESS' as const),
          status: isVerified
            ? ('resolved' as const)
            : isContained
            ? ('contained' as const)
            : ('investigating' as const),
          containmentStatus: {
            isContained,
            verificationState: isVerified
              ? ('VERIFIED' as const)
              : isChecking
              ? ('CHECKING' as const)
              : ('NOT_VERIFIED' as const),
            containedAt: isContained ? '14:33:48' : undefined,
            verifiedAt: isVerified ? '14:33:55' : undefined,
            executedAction: isContained ? 'Revoke User Session & Invalidate Tokens' : undefined,
            verifierNotes: isVerified ? 'All 5 automated checks verified: 0 active sockets, session dead.' : undefined,
            checks: VERIFICATION_CHECKS_LIST.map((chk, cIdx) => ({
              name: chk.name,
              status: isVerified
                ? ('pass' as const)
                : isChecking && cIdx <= (get().verificationStepIndex || 0)
                ? ('checking' as const)
                : ('pending' as const)
            }))
          }
        };
      }
      return inc;
    });

    // D. Update Deception Objects
    const updatedDeception = secStore.deceptionObjects.map((d) => {
      if (clampedIndex >= 7 && (d.id === 'decoy-001' || d.targetAsset === 'db-decoy-payroll-shadow')) {
        return {
          ...d,
          status: 'triggered' as const,
          triggerCount: 1,
          lastTriggered: '14:33:24'
        };
      }
      return d;
    });

    // E. Emit corresponding timeline telemetry event with deterministic ID
    const newEvent: SecurityEvent = normalizeEvent({
      id: `demo-evt-${clampedIndex}`,
      timestamp: stepDef.timestamp,
      eventType:
        clampedIndex === 2
          ? 'AUTH_FAILURE'
          : clampedIndex === 3
          ? 'AUTH_SUCCESS'
          : clampedIndex === 4
          ? 'PRIVILEGE_ESCALATION'
          : clampedIndex === 5
          ? 'SERVICE_DISCOVERY'
          : clampedIndex === 6
          ? 'DATABASE_ACCESS'
          : clampedIndex === 7
          ? 'HONEYTOKEN_ACCESS'
          : clampedIndex === 11
          ? 'SESSION_REVOKED'
          : clampedIndex === 12 || clampedIndex === 13
          ? 'VERIFICATION_CHECK'
          : 'NETWORK_SWEEP',
      severity: stepDef.threatLevel === 'CRITICAL' ? 'critical' : stepDef.threatLevel === 'HIGH' ? 'high' : 'medium',
      source: clampedIndex >= 11 ? '10.0.0.1' : '185.220.101.44',
      destination: '10.0.4.12',
      actor: clampedIndex >= 11 ? 'Sentinel Autonomous Controller' : 's_chen',
      action: stepDef.title,
      description: stepDef.statusMessage,
      evidenceId: clampedIndex === 12 || clampedIndex === 13 ? 'E-114' : stepDef.evidenceTriggered,
      isSimulated: true
    });

    useSecurityStore.setState({
      assets: updatedAssets,
      incidents: updatedIncidents,
      deceptionObjects: updatedDeception,
      threatLevel: stepDef.threatLevel,
      events: [newEvent, ...secStore.events.filter((e) => e.id !== `demo-evt-${clampedIndex}`).slice(0, 100)],
      simulation: {
        isActive: !isVerified,
        step: clampedIndex,
        phase: isVerified
          ? 'verified'
          : isContained
          ? 'containment_executing'
          : isChecking
          ? 'checking'
          : stepDef.phase === 'DECEPTION_TRIGGERED'
          ? 'honeytoken_tripped'
          : 'running',
        statusMessage: stepDef.statusMessage,
        activeNodeId: stepDef.activeNodeId,
        timerId: null,
        verificationState: isVerified ? 'VERIFIED' : isChecking ? 'CHECKING' : 'NOT_VERIFIED'
      }
    });

    // 3. Handle Automated Transitions vs Operator Decision Points
    if (!stepDef.isOperatorDecisionPoint && stepDef.autoDelayMs > 0 && clampedIndex < DEMO_SCENARIO_STEPS.length - 1) {
      demoTimerId = globalThis.setTimeout(() => {
        get().nextStep();
      }, stepDef.autoDelayMs);
    }
  },

  selectResponseAction: (actionId: string) => {
    set({
      selectedResponseActionId: actionId,
      isSimulatingResponse: true,
      currentPhase: 'RESPONSE_SIMULATION',
      workflowStage: 'SIMULATE',
      showResponseDecisionModal: true,
      statusMessage: 'Counterfactual simulation evaluated for: ' + actionId
    });
  },

  approveContainment: () => {
    // Double-click protection: if already contained or in verification, ignore
    if (get().isContainmentApproved || get().currentPhase === 'CONTAINMENT' || get().currentPhase === 'VERIFYING' || get().currentPhase === 'VERIFIED') {
      return;
    }

    clearAllTimers();
    set({
      isContainmentApproved: true,
      showResponseDecisionModal: false,
      currentPhase: 'CONTAINMENT',
      workflowStage: 'CONTAIN',
      statusMessage: 'SIMULATED CONTAINMENT EXECUTED: Session tokens severed, database sockets closed.'
    });

    // Jump to Step 11: CONTAINMENT
    get().jumpToStep(11);

    // After 2 seconds, enter Step 12: VERIFYING with animated checks
    demoTimerId = globalThis.setTimeout(() => {
      get().jumpToStep(12);

      let chkIdx = 0;
      set({ verificationStepIndex: 0 });

      verificationTimerId = globalThis.setInterval(() => {
        chkIdx += 1;
        if (chkIdx <= 4) {
          set({ verificationStepIndex: chkIdx });
        } else {
          clearInterval(verificationTimerId!);
          verificationTimerId = null;
          // Step 13: VERIFIED
          get().jumpToStep(13);
        }
      }, 700);
    }, 2000);
  },

  dismissDeceptionAlert: () => {
    set({ showDeceptionAlert: false });
  },

  dismissResolvedModal: () => {
    set({ showIncidentResolvedModal: false });
  },

  openResolvedModal: () => {
    set({ showIncidentResolvedModal: true });
  },

  openResponseModal: () => {
    set({ showResponseDecisionModal: true });
  },

  resetDemo: () => {
    clearAllTimers();
    sentinelAnalyst.clearAuditLogs();
    const secStore = useSecurityStore.getState();
    secStore.resetToBaseline();
    set({ ...INITIAL_DEMO_STATE });
  }
}));
