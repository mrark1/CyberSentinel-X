/**
 * CyberSentinel X - Prompt Builder
 * Crafts rigorous, evidence-grounded system and task prompts for Sentinel AI.
 * Enforces strict boundary between OBSERVED, INFERRED, and PREDICTED information.
 */

import { EvidencePacket } from './schemas';

export const SENTINEL_AI_SYSTEM_PROMPT = `You are Sentinel AI, an evidence-first cybersecurity analyst operating within the CyberSentinel X SOC platform.

CORE PRINCIPLE:
You are an analyst layer that explains verified evidence. You do NOT detect attacks, do NOT calculate authoritative risk scores, do NOT execute containment, and do NOT verify containment. Those functions belong to deterministic engines.

CATEGORICAL DISTINCTION:
1. OBSERVED: Statements that are directly and incontrovertibly supported by supplied security evidence items. Every OBSERVED statement MUST cite valid evidence IDs (e.g., ["E-101", "E-102"]).
2. INFERRED: Explanations and hypotheses derived by reasoning from observed facts. Must indicate confidence (0-100) and supporting evidence IDs.
3. PREDICTED: Potential future adversary techniques or targets. MUST NEVER be represented as confirmed events. Must state basis.

ABSOLUTE NEGATIVE CONSTRAINTS:
- NEVER invent IPs, usernames, asset hostnames, timestamps, attack stages, evidence IDs, commands, credentials, or security events.
- If evidence is insufficient for any point, state: "INSUFFICIENT EVIDENCE".
- NEVER cite an evidence ID that does not exist in the provided packet.
- NEVER claim that a containment action succeeded unless the verification evidence explicitly states it succeeded (status = "pass" or verificationState = "VERIFIED").
- NEVER execute actions or instruct real infrastructure attacks. Your role is analysis and explanation.

OUTPUT FORMAT:
You MUST respond with valid JSON strictly conforming to the requested schema. No conversational preamble, no markdown code fence ticks if json output is requested directly.`;

/**
 * Builds user prompt for full incident analysis.
 */
export function buildIncidentAnalysisPrompt(packet: EvidencePacket): string {
  return `Perform an evidence-grounded security analysis of incident ${packet.incident.id} based exclusively on the verified EvidencePacket below:

${JSON.stringify(packet, null, 2)}

Provide your response as a JSON object matching this schema:
{
  "incidentId": "${packet.incident.id}",
  "summary": "Short concise threat assessment summarizing what happened and why it matters",
  "observedFacts": [
    {
      "statement": "Factual description supported directly by evidence",
      "evidenceIds": ["E-101", "E-102"],
      "confidence": 95
    }
  ],
  "inferredConclusions": [
    {
      "statement": "Analytic deduction derived from observed facts",
      "supportingEvidenceIds": ["E-102"],
      "confidence": 90
    }
  ],
  "predictedNextSteps": [
    {
      "statement": "Hypothetical next adversary action",
      "basis": "Causal progression rationale",
      "confidence": 70
    }
  ],
  "attackStageAssessment": [
    {
      "stage": "INITIAL ACCESS",
      "assessment": "Summary of stage progress",
      "evidenceIds": ["E-101"],
      "confidence": 92
    }
  ],
  "investigationRecommendations": [
    {
      "action": "Concrete forensic investigation step",
      "reason": "Why this step is critical based on evidence",
      "evidenceIds": ["E-104"]
    }
  ],
  "responseConsiderations": [
    {
      "action": "Revoke User Session & Invalidate Tokens",
      "rationale": "Neutralize active token without host downtime",
      "expectedSecurityBenefit": "Immediate severing of database channel",
      "operationalConsideration": "Zero downtime for unaffected services"
    }
  ],
  "limitations": [
    "Analysis bounded strictly to telemetry within EvidencePacket v${packet.evidenceVersion}"
  ],
  "generatedAt": "${new Date().toTimeString().slice(0, 8)}"
}`;
}

/**
 * Builds user prompt for answering an operator question.
 */
export function buildOperatorQuestionPrompt(packet: EvidencePacket, question: string): string {
  return `Answer the operator's security question based EXCLUSIVELY on the verified EvidencePacket below.

QUESTION: "${question}"

EVIDENCE PACKET:
${JSON.stringify(packet, null, 2)}

Rules:
1. Ground every claim in evidence IDs.
2. If evidence does not provide the answer, say "INSUFFICIENT EVIDENCE".
3. Return JSON with format:
{
  "question": "${question}",
  "answer": "Direct, professional cybersecurity explanation grounded in evidence.",
  "evidenceIds": ["E-101"],
  "confidence": 92,
  "limitations": ["Observation limited to available logs"],
  "generatedAt": "${new Date().toTimeString().slice(0, 8)}"
}`;
}

/**
 * Builds user prompt for generating an Executive Summary report.
 */
export function buildExecutiveSummaryPrompt(packet: EvidencePacket): string {
  return `Generate an executive cybersecurity summary report for executive leadership regarding incident ${packet.incident.id}.

EVIDENCE PACKET:
${JSON.stringify(packet, null, 2)}

Return JSON with format:
{
  "incidentId": "${packet.incident.id}",
  "incidentOverview": "Concise non-jargon executive summary of the threat.",
  "businessImpact": "Assessment of customer data risk and potential regulatory exposure.",
  "affectedAssets": ${JSON.stringify(packet.incident.affectedUsers.concat(packet.affectedAssets.map((a) => a.hostname)))},
  "securityImpact": "Blast radius containment and credentials exposed.",
  "responseStatus": "${packet.verificationState.isContained ? 'CONTAINED' : 'PENDING CONTAINMENT'}",
  "verificationStatus": "${packet.verificationState.verificationState}",
  "remainingRisk": ${packet.incident.riskScore},
  "limitations": ["Executive briefing based on synthetic SOC snapshot"],
  "generatedAt": "${new Date().toTimeString().slice(0, 8)}"
}`;
}

/**
 * Builds correction prompt when model output failed schema validation.
 */
export function buildCorrectionPrompt(originalOutput: string, errors: string[]): string {
  return `Your previous JSON response was invalid according to the schema:
Validation Errors:
${errors.map((e) => `- ${e}`).join('\n')}

Previous output:
${originalOutput}

Please correct the format and output ONLY valid JSON without any markdown or conversational wrapper.`;
}
