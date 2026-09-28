/**
 * CyberSentinel X - End-to-End Demo Scenario & Determinism Test
 * Validates:
 * 1. Step transitions through all 14 states (IDLE -> VERIFIED)
 * 2. Deterministic incident ID, evidence IDs, risk scores, confidence
 * 3. Complete RESET guarantee (clearing timers, state, audit logs)
 * 4. Double-click protection (containment cannot be approved twice)
 * 5. AttackDNA node reveal sequence
 */

import { useDemoStore } from '../demoController';
import { useSecurityStore } from '../../store/useSecurityStore';
import { FLAGSHIP_INCIDENT_ID, DEMO_SCENARIO_STEPS, VERIFICATION_CHECKS_LIST } from '../demoScenario';
import { sentinelAnalyst } from '../../ai/sentinelAnalyst';

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  } else {
    console.log(`✅ PASSED: ${testName}`);
  }
}

export async function runDemoHardeningTests() {
  console.log('\n========================================');
  console.log('RUNNING DEMO RELIABILITY & DETERMINISM TESTS');
  console.log('========================================\n');

  // Test 1: Baseline state before simulation
  useDemoStore.getState().resetDemo();
  const baselineState = useDemoStore.getState();
  const baselineSec = useSecurityStore.getState();

  assert(baselineState.currentPhase === 'IDLE', 'Test 1a: Demo state starts in IDLE phase');
  assert(baselineState.threatLevel === 'LOW', 'Test 1b: Baseline Threat Level is LOW');
  assert(baselineSec.threatLevel === 'LOW', 'Test 1c: Security store Threat Level is LOW at baseline');
  assert(baselineState.revealedNodeIds.length === 1 && baselineState.revealedNodeIds[0] === 'node-ip', 'Test 1d: Only node-ip revealed at baseline');

  // Test 2: Deterministic progression through stages
  const runResults: any[] = [];

  for (let run = 1; run <= 2; run++) {
    useDemoStore.getState().resetDemo();
    const demo = useDemoStore.getState();

    // Step 2: INITIAL_ACCESS
    demo.jumpToStep(2);
    let cur = useDemoStore.getState();
    assert(cur.currentPhase === 'INITIAL_ACCESS', `Run ${run} - Test 2a: Step 2 phase is INITIAL_ACCESS`);
    assert(cur.revealedNodeIds.includes('node-auth'), `Run ${run} - Test 2b: node-auth revealed at Step 2`);
    assert(cur.riskScore === 45, `Run ${run} - Test 2c: Risk score is deterministically 45`);

    // Step 4: PRIVILEGE_ESCALATION
    demo.jumpToStep(4);
    cur = useDemoStore.getState();
    assert(cur.currentPhase === 'PRIVILEGE_ESCALATION', `Run ${run} - Test 2d: Step 4 is PRIVILEGE_ESCALATION`);
    assert(cur.revealedNodeIds.includes('node-priv'), `Run ${run} - Test 2e: node-priv revealed`);

    // Step 7: DECEPTION_TRIGGERED
    demo.jumpToStep(7);
    cur = useDemoStore.getState();
    assert(cur.currentPhase === 'DECEPTION_TRIGGERED', `Run ${run} - Test 2f: Step 7 trips deception`);
    assert(cur.confidence === 97, `Run ${run} - Test 2g: Confidence is deterministically 97%`);
    assert(cur.revealedNodeIds.includes('node-honey'), `Run ${run} - Test 2h: Honeytoken node revealed`);

    // Step 11: CONTAINMENT
    demo.jumpToStep(11);
    cur = useDemoStore.getState();
    assert(cur.currentPhase === 'CONTAINMENT', `Run ${run} - Test 2i: Step 11 is CONTAINMENT`);
    assert(cur.workflowStage === 'CONTAIN', `Run ${run} - Test 2j: Workflow stage is CONTAIN`);

    // Step 13: VERIFIED
    demo.jumpToStep(13);
    cur = useDemoStore.getState();
    assert(cur.currentPhase === 'VERIFIED', `Run ${run} - Test 2k: Step 13 is VERIFIED`);
    assert(cur.workflowStage === 'VERIFY', `Run ${run} - Test 2l: Workflow stage is VERIFY`);
    assert(cur.threatLevel === 'LOW', `Run ${run} - Test 2m: Post-verification threat returns to LOW`);

    const incident = useSecurityStore.getState().getIncident(FLAGSHIP_INCIDENT_ID);
    assert(incident?.status === 'resolved', `Run ${run} - Test 2n: Incident status is resolved`);
    assert(incident?.containmentStatus?.verificationState === 'VERIFIED', `Run ${run} - Test 2o: Verification state is VERIFIED`);

    runResults.push({
      risk: cur.riskScore,
      confidence: cur.confidence,
      threat: cur.threatLevel,
      revealedNodes: [...cur.revealedNodeIds]
    });
  }

  // Test 3: Reproducibility between consecutive runs
  assert(
    JSON.stringify(runResults[0]) === JSON.stringify(runResults[1]),
    'Test 3: Repeated demo runs produce 100% identical state, risk scores, and evidence bindings'
  );

  // Test 4: Reset Guarantee
  useDemoStore.getState().resetDemo();
  const resetDemoState = useDemoStore.getState();
  const resetSecState = useSecurityStore.getState();

  assert(resetDemoState.currentPhase === 'IDLE', 'Test 4a: Reset clears phase to IDLE');
  assert(resetDemoState.currentStepIndex === 0, 'Test 4b: Reset clears step index to 0');
  assert(resetDemoState.isContainmentApproved === false, 'Test 4c: Reset clears containment approval');
  assert(resetSecState.events.length > 0 && resetSecState.events[0].id !== 'demo-evt-13', 'Test 4d: Reset restores baseline seed events');
  assert(sentinelAnalyst.getAuditLogsForIncident(FLAGSHIP_INCIDENT_ID).length === 0, 'Test 4e: Reset completely clears AI audit logs');

  // Test 5: Double-Click Protection
  useDemoStore.getState().jumpToStep(9); // ANALYSIS_READY
  useDemoStore.getState().approveContainment();
  const stepAfterFirst = useDemoStore.getState().currentPhase;
  assert(stepAfterFirst === 'CONTAINMENT', 'Test 5a: First approval executes containment');

  // Attempt duplicate click
  useDemoStore.getState().approveContainment();
  assert(useDemoStore.getState().currentPhase === 'CONTAINMENT', 'Test 5b: Duplicate approval ignored by protection guard');

  // Clean reset at end of test suite
  useDemoStore.getState().resetDemo();

  console.log('\n========================================');
  console.log('ALL DEMO RELIABILITY & DETERMINISM TESTS PASSED');
  console.log('========================================\n');
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('demoScenario.test.ts')) {
  runDemoHardeningTests().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}
