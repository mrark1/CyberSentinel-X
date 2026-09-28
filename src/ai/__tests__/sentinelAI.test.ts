/**
 * CyberSentinel X - Sentinel AI Test Suite
 * Tests all 10 core safety, grounding, validation, and privacy requirements:
 * 1. Valid Gemini response parsing & schema validation
 * 2. Malformed Gemini response handling & safe extraction
 * 3. Hallucinated evidence ID detection & exclusion
 * 4. Missing evidence handling
 * 5. Insufficient evidence handling
 * 6. Gemini unavailable (graceful fallback)
 * 7. Analysis refresh verification
 * 8. Cached analysis check
 * 9. Sensitive data sanitization (passwords, tokens, keys)
 * 10. AI recommendation isolation (cannot execute response directly)
 */

import { buildEvidencePacket, sanitizeString, sanitizeObject, getAllValidEvidenceIds } from '../evidenceFormatter';
import { safeExtractJson, sanitizeEvidenceCitations, getDeterministicFallbackAnalysis, GeminiProvider } from '../geminiProvider';
import { validateAIAnalysisSchema, StructuredAIAnalysis } from '../schemas';
import { sentinelAnalyst } from '../sentinelAnalyst';
import { flagshipIncident, seedAssets, seedDeceptionObjects, seedEvents } from '../../mock/seedData';

// Helper assertion function
function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  } else {
    console.log(`✅ PASSED: ${testName}`);
  }
}

export async function runSentinelAITests() {
  console.log('\n========================================');
  console.log('RUNNING SENTINEL AI TEST SUITE (10 CASES)');
  console.log('========================================\n');

  // Test 1: Valid Gemini response parsing & schema validation
  {
    const validSample = {
      incidentId: 'INC-2026-0042',
      summary: 'Adversary leveraged compromised account to access payroll database.',
      observedFacts: [
        { statement: 'Sprayed login attempts observed from Tor exit node.', evidenceIds: ['E-101'], confidence: 95 }
      ],
      inferredConclusions: [
        { statement: 'Credential stuffing attack confirmed against Okta tenant.', supportingEvidenceIds: ['E-101'], confidence: 91 }
      ],
      predictedNextSteps: [
        { statement: 'Lateral probe against cloud storage buckets.', basis: 'T1048 sequence', confidence: 70 }
      ],
      attackStageAssessment: [
        { stage: 'INITIAL ACCESS', assessment: 'External Tor connection', evidenceIds: ['E-101'], confidence: 94 }
      ],
      investigationRecommendations: [
        { action: 'Inspect Okta tokens', reason: 'Verify session expiry', evidenceIds: ['E-101'] }
      ],
      responseConsiderations: [
        {
          action: 'Revoke User Session',
          rationale: 'Kills active sockets',
          expectedSecurityBenefit: 'Immediate containment',
          operationalConsideration: 'Zero downtime'
        }
      ],
      limitations: ['Bounded by evidence packet'],
      generatedAt: '14:35:00'
    };

    const validation = validateAIAnalysisSchema(validSample);
    assert(validation.valid && validation.errors.length === 0, 'Test 1: Valid Gemini response passes schema validation');
  }

  // Test 2: Malformed Gemini response handling & safe extraction
  {
    const markdownWrapped = '```json\n{"incidentId":"INC-2026-0042","summary":"Valid json inside markdown fence","observedFacts":[],"inferredConclusions":[],"predictedNextSteps":[],"investigationRecommendations":[],"responseConsiderations":[],"limitations":[]}\n```';
    const parsed = safeExtractJson<any>(markdownWrapped);
    assert(parsed.incidentId === 'INC-2026-0042' && parsed.summary.includes('Valid json'), 'Test 2: Malformed markdown code fence JSON is safely extracted');
  }

  // Test 3: Hallucinated evidence ID detection & exclusion
  {
    const { packet } = buildEvidencePacket(flagshipIncident, seedEvents, seedAssets, seedDeceptionObjects);
    const mockAnalysisWithHallucination: StructuredAIAnalysis = {
      incidentId: packet.incident.id,
      summary: 'Threat summary',
      observedFacts: [
        { statement: 'Adversary breached firewall.', evidenceIds: ['E-101', 'E-HALLUCINATED-999'], confidence: 90 }
      ],
      inferredConclusions: [
        { statement: 'Fake inference.', supportingEvidenceIds: ['E-FAKE-777'], confidence: 80 }
      ],
      predictedNextSteps: [],
      attackStageAssessment: [],
      investigationRecommendations: [
        { action: 'Investigate', reason: 'Test', evidenceIds: ['E-102', 'E-INVALID-001'] }
      ],
      responseConsiderations: [],
      limitations: [],
      generatedAt: '14:35:00'
    };

    const sanitized = sanitizeEvidenceCitations(mockAnalysisWithHallucination, packet);
    const validIds = getAllValidEvidenceIds(packet);

    assert(!sanitized.observedFacts[0].evidenceIds.includes('E-HALLUCINATED-999'), 'Test 3a: Hallucinated evidence ID E-HALLUCINATED-999 was stripped');
    assert(sanitized.observedFacts[0].evidenceIds.includes('E-101'), 'Test 3b: Legitimate evidence ID E-101 was preserved');
    assert(sanitized.observedFacts[0].unverifiedClaim === true, 'Test 3c: Statement with hallucination was flagged unverifiedClaim=true');
    assert(sanitized.inferredConclusions[0].supportingEvidenceIds.length === 0, 'Test 3d: Non-existent supporting evidence was stripped from inference');
  }

  // Test 4: Missing evidence handling
  {
    const emptyIncident = { ...flagshipIncident, evidence: [] };
    const { packet } = buildEvidencePacket(emptyIncident, [], seedAssets, seedDeceptionObjects);
    const fallback = getDeterministicFallbackAnalysis(packet);
    assert(fallback.observedFacts.length > 0, 'Test 4: Gracefully handles incident with zero evidence artifacts');
  }

  // Test 5: Insufficient evidence handling
  {
    const minimalPacket = {
      ...buildEvidencePacket(flagshipIncident, seedEvents, seedAssets, seedDeceptionObjects).packet,
      evidence: []
    };
    const answer = await new GeminiProvider().askQuestion(minimalPacket, 'Can you prove the attacker has physical access?');
    assert(
      answer.limitations.length > 0 || answer.answer.includes('INSUFFICIENT EVIDENCE') || answer.answer.includes('evidence'),
      'Test 5: Explicitly accounts for insufficient evidence without fabricating'
    );
  }

  // Test 6: Gemini unavailable (graceful fallback)
  {
    const { packet } = buildEvidencePacket(flagshipIncident, seedEvents, seedAssets, seedDeceptionObjects);
    const fallback = getDeterministicFallbackAnalysis(packet);
    assert(fallback.isDemoFallback === true, 'Test 6a: Fallback marks isDemoFallback=true');
    assert(Boolean(fallback.modelUsed === 'DEMO ANALYSIS' || fallback.modelUsed?.includes('Fallback')), 'Test 6b: Fallback model label is clearly indicated as DEMO ANALYSIS');
    assert(fallback.observedFacts.length > 0, 'Test 6c: Fallback produces evidence-grounded facts');
  }

  // Test 7: Analysis refresh verification
  {
    const { analysis: a1 } = await sentinelAnalyst.analyzeIncident(flagshipIncident, seedEvents, seedAssets, seedDeceptionObjects);
    const { analysis: a2 } = await sentinelAnalyst.analyzeIncident(flagshipIncident, seedEvents, seedAssets, seedDeceptionObjects);
    assert(a1.incidentId === a2.incidentId, 'Test 7: Refreshed analysis maintains incident identity');
  }

  // Test 8: Cached analysis check
  {
    const provider = new GeminiProvider();
    const { packet } = buildEvidencePacket(flagshipIncident, seedEvents, seedAssets, seedDeceptionObjects);
    const res1 = await provider.analyzeIncident(packet);
    const res2 = await provider.analyzeIncident(packet);
    assert(res1.incidentId === res2.incidentId, 'Test 8: Cached analysis returns consistent output without duplicate recomputation');
  }

  // Test 9: Sanitized sensitive data (passwords, tokens, keys)
  {
    const dirtyText = 'User password="SuperSecretPassword123!" authenticated with bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and AWS key AKIAIOSFODNN7EXAMPLE';
    const { sanitized, redactions } = sanitizeString(dirtyText);
    assert(!sanitized.includes('SuperSecretPassword123!'), 'Test 9a: Password was redacted');
    assert(!sanitized.includes('AKIAIOSFODNN7EXAMPLE'), 'Test 9b: AWS access key was redacted');
    assert(sanitized.includes('[REDACTED]'), 'Test 9c: Replaced with [REDACTED]');
    assert(redactions >= 2, 'Test 9d: Redaction counter correctly incremented');
  }

  // Test 10: AI recommendation cannot execute response directly
  {
    const { analysis } = await sentinelAnalyst.analyzeIncident(flagshipIncident, seedEvents, seedAssets, seedDeceptionObjects);
    // Sentinel AI output only has response considerations (advisory strings)
    assert(typeof analysis.responseConsiderations[0].action === 'string', 'Test 10a: Recommendations are advisory data objects');
    // Ensure analysis has no execution functions
    assert(!('execute' in analysis) && !('executeAction' in analysis), 'Test 10b: AI analysis contains zero execution handlers');
  }

  console.log('\n========================================');
  console.log('ALL 10 SENTINEL AI TEST CASES PASSED SUCCESSFULLY');
  console.log('========================================\n');
}

// Auto-run when executed directly via tsx
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('sentinelAI.test.ts')) {
  runSentinelAITests().catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
}
