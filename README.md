# 🛡️ CyberSentinel X

> **Evidence-First Autonomous Cyber Defense, Attack Intelligence & Digital Twin Platform**

CyberSentinel X is an evidence-first cybersecurity operations and defense platform engineered to solve the chronic alert fragmentation problem in modern Security Operations Centers (SOCs). Rather than presenting isolated security alerts in disconnected tables, CyberSentinel X transforms raw multi-source telemetry into an interconnected causal attack graph, visualizes blast radiuses across an enterprise digital twin, evaluates response actions via counterfactual simulation before execution, and mandates multi-point post-containment verification before an incident can ever be declared resolved.

### What Makes It Different?

Most security platforms function as passive notification boards or speculative LLM wrappers. CyberSentinel X is architected around strict operational rigor:

* **Deterministic Security Pipeline**: Normalization, correlation, risk scoring, and deception triggers operate on deterministic rule engines—never on ungrounded probabilistic model output.
* **AttackDNA™ Graph Intelligence**: Synthesizes disparate telemetry into causal and temporal sequences mapped to MITRE ATT&CK techniques.
* **CyberTwin™ Infrastructure Modeling**: Interactive topology mapping enterprise users, workstations, bastion servers, production databases, and trust relationships.
* **Adaptive Deception Grid**: Breadcrumb canaries and honeytokens that trap adversaries and generate high-fidelity attribution evidence.
* **Evidence-Grounded Sentinel AI**: Powered by Google Gemini (via a secure server-side proxy), enforcing a strict schema that bifurcates facts into `OBSERVED`, `INFERRED`, and `PREDICTED`, while stripping ungrounded citations.
* **Counterfactual Defense Simulator**: Allows operators to test defensive playbooks in simulation to evaluate threat containment vs. business impact before approval.
* **Deterministic Verification Engine**: Containment is never assumed. An incident is only marked `CONTAINED` after passing a 5-point automated verification checklist.
* **Granular Attack Replay**: Step-by-step forensic scrubber to replay multi-stage intrusions from initial access to remediation.

```text
OBSERVE → DETECT → CORRELATE → UNDERSTAND → PREDICT → SIMULATE → CONTAIN → VERIFY
```

---

## 1. Why CyberSentinel X?

### The Alert Fragmentation Crisis

Modern security teams drown in alert noise. A single sophisticated intrusion generates a storm of disconnected log lines across different monitoring systems:

```text
[14:22:01] Auth Gateway:      Failed login (User: sarah.chen, IP: 198.51.100.23)
[14:23:45] SSO Portal:        Successful login from anomalous geo-location
[14:25:12] IAM Audit:         Privilege escalation via sudo credential cache
[14:27:04] Endpoint Sensor:   Network discovery probe (arp -a, ping sweep)
[14:28:30] Database Proxy:    Production database connection established
[14:29:15] DLP Monitor:       High-volume data query on payroll table
```

In traditional SOC workflows, tier-1 analysts view these as separate tickets. The cognitive burden falls on the analyst to stitch together disparate alerts across distinct dashboards, deduce whether they represent a coordinated attack campaign, guess the attacker's next move, and hastily execute containment actions without knowing if critical business systems will go offline.

CyberSentinel X replaces manual correlation with an automated, explainable defense pipeline:

```text
Raw Telemetry
      ↓
Normalization & Schema Mapping
      ↓
Deterministic Detection
      ↓
Correlation & AttackDNA Graph
      ↓
Unified Attack Story & Blast Radius
      ↓
Counterfactual Defense Simulation
      ↓
Human-Approved Simulated Containment
      ↓
Post-Containment Verification
```

---

## 2. Key Features

### AttackDNA™
AttackDNA correlates discrete security events into a unified, directed acyclic graph (DAG) representing the attacker's causal and temporal progression. Each node in the graph represents a verified event or asset compromise, categorized by MITRE ATT&CK tactics (e.g., Initial Access, Privilege Escalation, Discovery, Lateral Movement, Collection). Operators see the exact path the adversary took rather than isolated log lines.

### CyberTwin™
A digital twin visualization of the enterprise environment representing synthetic users, endpoints, servers, databases, cloud resources, and network trust boundaries. As an attack progresses, CyberTwin dynamically highlights compromised nodes, exposed credentials, active pivot routes, and projected blast radiuses across the synthetic topology.

### Adaptive Deception
An integrated canary and honeytoken mesh deployed across the infrastructure. When an attacker queries fake administrative credentials, probes decoy database tables, or accesses deceptive AWS access keys, the deception engine intercepts the interaction, flags the activity as zero-false-positive ground truth, and automatically injects high-priority evidence directly into the active incident.

### Sentinel AI (Evidence-Grounded Intelligence)
Sentinel AI is an advisory analyst powered by Gemini (with a resilient deterministic fallback). It synthesizes complex incident data into structured insights categorized into three distinct operational layers:
* **OBSERVED**: Claims directly grounded in verified evidence IDs (e.g., log entries, packet captures, process IDs).
* **INFERRED**: Analytical deductions derived from observed data patterns, complete with confidence scores.
* **PREDICTED**: Anticipated next steps and potential attacker targets based on known tactic sequences.

> **Safety Guarantee**: Sentinel AI is strictly advisory. It cannot alter system state, bypass operator confirmation, or trigger containment actions autonomously.

### Counterfactual Defense Simulator
Before executing defensive actions, operators can simulate different response strategies (e.g., *Isolate Host Only*, *Revoke Credentials & Kill Sessions*, or *Full Network Quarantine & Credential Roll*). The simulator computes:
* **Containment Efficacy**: Projected percentage reduction in adversary momentum and blast radius.
* **Operational Friction**: Quantified business impact (e.g., downtime for legitimate users, interrupted batch jobs).
* **Secondary Risk**: Unintended consequences, such as locking out incident response team accounts.

### Verification Engine
A critical flaw in incident response is "premature declaration of containment"—assuming an attack has stopped when the attacker still possesses backdoors or active tokens. The CyberSentinel X Verification Engine runs automated, deterministic post-response checks to verify that:
1. Target account sessions are terminated.
2. Compromised API tokens are revoked.
3. Network egress blocks are enforced.
4. Host isolation iptables rules are active.
5. No subsequent lateral telemetry is detected from the isolated host.

### Attack Replay
A full-fidelity temporal scrubber allowing security analysts, auditors, and incident commanders to step backward and forward through the timeline of the attack. Replay demonstrates exactly when alerts were generated, when deception traps were tripped, and how the risk score evolved over time.

---

## 3. Flagship Demo Scenario: INC-2026-0042

CyberSentinel X includes an end-to-end synthetic flagship attack scenario demonstrating the full lifecycle of an identity compromise escalating into privileged database access.

### The Attack Chain:

```text
[T+00m] External Reconnaissance (Tor Exit Node 198.51.100.23)
   ↓
[T+02m] Credential Spraying & Authentication Failure (okta-sso)
   ↓
[T+04m] Anomalous Successful MFA-Bypass Login (User: sarah.chen)
   ↓
[T+06m] Privilege Escalation via Sudo Exploit on Bastion Host
   ↓
[T+08m] Internal Network Discovery & Port Scanning
   ↓
[T+10m] Production Payroll Database Access (db-payroll-prod)
   ↓
[T+12m] Honeytoken Canary Triggered (Fake AWS Root Key accessed)
   ↓
[T+13m] AttackDNA Correlates 7 Events into INC-2026-0042
   ↓
[T+14m] Sentinel AI Generates Structured Evidence Briefing
   ↓
[T+15m] Operator Evaluates Counterfactual Response Options
   ↓
[T+16m] Operator Approves Simulated Response: Revoke User & Quarantine Host
   ↓
[T+17m] Automated Verification Engine Runs 5/5 Checks
   ↓
[T+18m] STATUS: CONTAINMENT VERIFIED (Zero Residual Risk)
```

> **Note**: All actors, IPs, credentials, endpoints, and database tables in this scenario are **100% synthetic**. No real enterprise systems or live networks are accessed or modified.

---

## 4. Architecture

CyberSentinel X is built with a clean separation of concerns between client-side state, deterministic security computation, and server-side advisory AI.

```mermaid
graph TD
    subgraph UI ["User Interface (React 19 + Vite + Tailwind CSS)"]
        Dashboard[Dashboard & SOC View]
        AttackGraph[AttackDNA Graph Visualization]
        CyberTwinView[CyberTwin Digital Twin Map]
        DeceptionView[Adaptive Deception Mesh]
        SimView[Counterfactual Simulator]
        ReplayView[Forensic Attack Replay]
        AIConsole[Sentinel AI Analyst Drawer]
    end

    subgraph Store ["Central State Management"]
        ZustandStore[useSecurityStore (Zustand)]
        DemoStore[useDemoStore (Controller)]
    end

    subgraph Engines ["Deterministic Security Engines"]
        TelemEng[Telemetry Ingestion Engine]
        NormEng[Normalization Engine]
        DetectEng[Detection Engine]
        CorrelEng[Correlation Engine]
        DnaEng[AttackDNA Graph Engine]
        RiskEng[Dynamic Risk Scoring Engine]
        SimEng[Response & Simulation Engine]
        VerifyEng[Containment Verification Engine]
    end

    subgraph AI ["Evidence & Intelligence Layer"]
        EvidFormatter[Evidence Packet Builder & Sanitizer]
        ProxyRoute["Server-Side Proxy (/api/ai/*)"]
        GeminiSDK["Google Gemini API (gemini-3.8-flash)"]
        DeterministicAI["Deterministic Fallback Engine"]
        SchemaValidator["Strict JSON Schema & Citation Filter"]
    end

    UI --> ZustandStore
    DemoStore --> ZustandStore
    ZustandStore --> Engines
    Engines --> ZustandStore

    ZustandStore --> EvidFormatter
    EvidFormatter --> ProxyRoute
    ProxyRoute --> GeminiSDK
    ProxyRoute -.->|Quota/Network Error| DeterministicAI
    GeminiSDK --> SchemaValidator
    SchemaValidator --> UI
    DeterministicAI --> UI
```

### Architectural Dataflow

1. **Ingestion & Normalization**: Raw telemetry from authentication logs, endpoint sensors, and network monitors passes through the Normalization Engine into typed `NormalizedSecurityEvent` records.
2. **Deterministic Correlation**: The Correlation and AttackDNA Engines link events based on actor identities, source IP addresses, shared session hashes, and temporal proximity.
3. **Evidence Extraction**: The Evidence Formatter extracts verified event IDs, sanitizes all tokens, credentials, and PII, and bundles them into an immutable `EvidencePacket`.
4. **Advisory Intelligence**: The `EvidencePacket` is dispatched to the backend proxy (`server.ts`). Gemini performs high-level synthesis, constrained by a strict JSON schema. If the Gemini API is unreachable or rate-limited (HTTP 429), the proxy seamlessly switches to the Deterministic Evidence Fallback.
5. **Human Decision Loop**: The operator evaluates response strategies inside the Counterfactual Defense Simulator.
6. **Execution & Verification**: Upon operator approval, simulated response actions are applied, and the Verification Engine executes deterministic test scripts to confirm threat eradication.

---

## 5. Security Pipeline

The end-to-end security pipeline processes security telemetry across twelve discrete phases:

```text
Telemetry → Normalization → Detection → Correlation → AttackDNA → Risk Calculation
   ↓
Verification ← Containment ← Counterfactual Response ← AI Analysis ← Deception ← CyberTwin Impact
```

| # | Pipeline Stage | Implementation Details |
|---|---|---|
| **1** | **Telemetry Ingestion** | Ingests authentication logs, process executions, network socket flows, and deception tripwires. |
| **2** | **Normalization** | Maps proprietary log formats to standard event structures (`timestamp`, `source`, `actor`, `target`, `technique`). |
| **3** | **Detection** | Applies deterministic detection rules (e.g., brute force spikes, privilege escalations, unapproved database connections). |
| **4** | **Correlation** | Associates related alerts across temporal windows, common asset nodes, and shared user sessions. |
| **5** | **AttackDNA Construction** | Constructs directed causal graphs linking events by MITRE ATT&CK kill-chain phases. |
| **6** | **Risk Calculation** | Dynamically calculates incident risk score ($0–100$) based on asset criticality, event severity, and attack confidence. |
| **7** | **CyberTwin Impact** | Propagates infection states and calculates real-time blast radiuses across the digital twin topology. |
| **8** | **Adaptive Deception** | Validates canary access attempts; triggers zero-false-positive alerts upon honeytoken interaction. |
| **9** | **AI Analysis** | Builds sanitized evidence packets, queries Gemini via server proxy, validates output schema, and strips unverified citations. |
| **10**| **Counterfactual Response** | Models containment scenarios against business impact and security efficacy metrics. |
| **11**| **Simulated Containment**| Applies selected response actions (account lockout, session termination, host network isolation). |
| **12**| **Post-Action Verification**| Deterministically audits active connections, token caches, and iptables rules to prove containment success. |

---

## 6. Sentinel AI: Architecture & Grounding

Sentinel AI demonstrates how large language models can be safely integrated into mission-critical security workflows without risking hallucinations or unauthorized actions.

### Key Implementation Principles

1. **Server-Side API Proxy**: AI requests are routed through `/server.ts` rather than executing directly on the client. API keys are never exposed in browser bundles.
2. **Evidence-Grounded Prompting**: The model is provided only with an explicit `EvidencePacket` containing verified events, observed entities, and known deception artifacts. It is explicitly instructed: *"If a claim cannot be verified using the provided evidence IDs, do not fabricate an assertion."*
3. **Automated Privacy Sanitization**: Before any data packet leaves the platform, sensitive patterns (passwords, session cookies, JWTs, AWS credentials, private keys) are scrubbed and replaced with `[REDACTED]`.
4. **Strict Schema Validation**: Responses must conform to the `StructuredAIAnalysis` schema. If a response is malformed, the system performs an automated correction retry; if that fails, it serves the validated deterministic analysis.
5. **Hallucinated Citation Stripping**: All evidence IDs cited by the model are validated against the actual incident evidence catalog. Any hallucinated citation (e.g., `E-FAKE-999`) is excised, and the statement is flagged as an unverified claim.
6. **Immutable Audit Logging**: Every query, prompt, response, model version, and fallback event is stored in an immutable audit ledger for compliance and forensic review.
7. **Operator Q&A & Executive Briefing**: Provides natural-language Q&A grounded strictly in the incident evidence, as well as one-click executive summaries for leadership.

### What Sentinel AI Does NOT Do

* ❌ **Does NOT execute containment actions**: The model cannot call APIs to disable accounts or firewall ports.
* ❌ **Does NOT mutate security state**: Security state is maintained strictly by deterministic engines and human operators.
* ❌ **Does NOT establish security truth**: Attack detection and correlation operate deterministically; AI is strictly an advisory lens.

---

## 7. AI Fallback & Hackathon Resilience

In hackathon environments and production SOC deployments, external AI APIs may become unavailable due to upstream outages, network latency, or strict API quota limits (such as Google Gemini free-tier `429 RESOURCE_EXHAUSTED` rate limits).

### The Deterministic Fallback Engine

CyberSentinel X guarantees **100% demo resilience**. If the Gemini API returns a rate-limit error, network failure, or invalid payload, the platform automatically switches to its internal Deterministic Fallback Engine:

* The server catches quota and connection errors gracefully and returns an HTTP 200 payload flagged with `isDemoFallback: true` and labeled `SENTINEL AI — DEMO ANALYSIS`.
* Fallback insights are dynamically compiled from the verified synthetic telemetry and deterministic rule outputs already present in the active incident.
* **The fallback is never misrepresented as live Gemini generation.** The UI displays a clear badge indicating that deterministic advisory mode is active.
* The application never crashes, shows blank screens, or produces unhandled exceptions when AI quotas are reached.

---

## 8. Safety & Responsible AI Model

CyberSentinel X is an educational and defensive research prototype designed to demonstrate next-generation SOC architectures.

### Safety Guarantees

* **Purely Synthetic Telemetry**: All telemetry, user accounts, server hostnames, IP addresses, and database schemas are simulated mock data.
* **Simulated Defense Actions**: Response actions (e.g., host isolation, credential revocation) mutate local application state only. No real operating system configurations, cloud APIs, or active network interfaces are touched.
* **No Offensive Capabilities**: The platform contains no exploit payloads, scanning modules, cracking utilities, or offensive tools. It is strictly an analysis, correlation, and response verification system.
* **No Real Credentials**: All credentials depicted in demonstrations and tests (e.g., `AKIAIOSFODNN7EXAMPLE`, dummy password hashes) are well-known RFC/documentation dummy values.

---

## 9. Technology Stack

CyberSentinel X is built using a modern full-stack TypeScript architecture:

### Frontend
* **React 19** (`react`, `react-dom`): Functional components, custom hooks, and concurrent rendering.
* **Vite 8** (`vite`, `@vitejs/plugin-react`): Lightning-fast build tooling and HMR dev server.
* **React Router v7** (`react-router-dom`): Client-side application routing.
* **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/vite`): Atomic styling and responsive design.
* **@xyflow/react** (`@xyflow/react` v12): Interactive graph visualization for AttackDNA and CyberTwin topologies.
* **Lucide React** (`lucide-react`): Consistent SOC iconography.
* **Motion** (`motion` v12): Smooth UI transitions and simulation animations.
* **Recharts** (`recharts` v3): Incident metrics and risk trend visualizations.

### Backend & Middleware
* **Node.js + Express 4** (`express`, `@types/express`): Server-side security API proxy and static asset server.
* **TSX** (`tsx`): TypeScript execution environment for modern ESM server operation.
* **Dotenv** (`dotenv`): Environment variable management.

### State Management
* **Zustand 5** (`zustand`): High-performance centralized state stores for security telemetry and demo simulation.

### Artificial Intelligence & LLM
* **@google/genai SDK** (`@google/genai` v2.4): Modern Google GenAI TypeScript SDK interacting with `gemini-3.8-flash`.

### Testing & Validation
* **TypeScript** (`typescript` v7): Strict type verification across all modules.
* **Custom Deterministic Test Runners**: In-repo verification suites for AI grounding, schema validation, and scenario determinism.

---

## 10. Project Structure

```text
.
├── .env.example                # Template for environment configuration
├── .gitignore                  # Git ignore rules
├── index.html                  # Main application HTML entry point
├── metadata.json               # Applet capability metadata
├── package.json                # Project dependencies and script definitions
├── server.ts                   # Express server, Vite middleware & Gemini proxy
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite bundler configuration
└── src/
    ├── App.tsx                 # Root application component & layout router
    ├── main.tsx                # Client-side React DOM entry point
    ├── index.css               # Global Tailwind CSS stylesheet
    ├── ai/                     # Sentinel AI & Gemini integration
    │   ├── __tests__/          # Sentinel AI test suite (10 test cases)
    │   │   └── sentinelAI.test.ts
    │   ├── evidenceFormatter.ts # Sanitization & evidence packet builder
    │   ├── geminiProvider.ts   # Gemini API client & fallback handler
    │   ├── index.ts            # AI module exports
    │   ├── promptBuilder.ts    # Grounded prompt construction templates
    │   ├── schemas.ts          # Structured JSON schemas & runtime validators
    │   └── sentinelAnalyst.ts  # Sentinel AI service orchestrator & audit logger
    ├── components/             # Reusable UI component modules
    │   ├── attackGraph/        # AttackDNA graph nodes, edges & legend
    │   ├── common/             # Badges, cards, modal dialogs, status tags
    │   ├── cyberTwin/          # Digital twin node cards, filters & layout
    │   ├── layout/             # Navigation sidebar, topbar & alerts drawer
    │   ├── sentinelAI/         # AI analysis drawer, Q&A panel, audit modal
    │   └── simulation/         # Counterfactual defense comparison panels
    ├── demo/                   # Deterministic hackathon demo engine
    │   ├── __tests__/          # Demo reliability & determinism test suite
    │   │   └── demoScenario.test.ts
    │   ├── components/         # Demo scrubber bar, quick jump & status pill
    │   ├── demoController.ts   # Demo playback controller (Zustand)
    │   ├── demoScenario.ts     # 14-step flagship scenario definition
    │   ├── demoState.ts        # State machine definitions for simulation
    │   └── index.ts            # Demo module exports
    ├── engine/                 # Core deterministic security pipeline
    │   ├── attackDNAEngine.ts  # Causal graph generation algorithm
    │   ├── correlationEngine.ts # Multi-source event correlation rules
    │   ├── detectionEngine.ts  # Rule-based signature & anomaly detector
    │   ├── index.ts            # Pipeline exports
    │   ├── normalizationEngine.ts # Log parser & schema standardizer
    │   ├── responseEngine.ts   # Counterfactual playbook impact evaluator
    │   ├── riskEngine.ts       # Mathematical risk & confidence calculator
    │   ├── telemetryEngine.ts  # Synthetic telemetry stream generator
    │   └── verificationEngine.ts # Post-containment verification validator
    ├── mock/                   # Synthetic seed data
    │   └── seedData.ts         # Synthetic assets, users, events & traps
    ├── pages/                  # Top-level view routes
    │   ├── AttackGraphPage.tsx # AttackDNA visualization page
    │   ├── AttackReplayPage.tsx# Timeline scrubber & forensic playback
    │   ├── CyberTwinPage.tsx   # Enterprise digital twin topology map
    │   ├── DashboardPage.tsx   # Primary SOC command dashboard
    │   ├── DeceptionPage.tsx   # Honeytoken & canary management console
    │   ├── IncidentDetailPage.tsx # Drill-down view for specific incident
    │   ├── IncidentsPage.tsx   # Incident queue & severity filter
    │   ├── ReportsPage.tsx     # Executive briefing & PDF/text report export
    │   ├── SettingsPage.tsx    # Telemetry configuration & API settings
    │   └── SimulationsPage.tsx # Counterfactual defense playbook sandbox
    ├── store/                  # Central state store
    │   └── useSecurityStore.ts # Central Zustand store for enterprise state
    └── types/                  # TypeScript interface definitions
        └── security.ts         # Unified security, event & incident types
```

---

## 11. Installation & Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher (or compatible package manager)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/cybersentinel-x.git
cd cybersentinel-x
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your Google Gemini API key:
```ini
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
```
> **Security Note**: Never commit your `.env` file or real API keys to version control. The application is configured to run fully in deterministic demo mode even if no key is provided.

### Step 4: Run the Development Server
```bash
npm run dev
```

The application will start on `http://localhost:3000`.

---

## 12. Environment Variables

| Variable | Required | Description | Default |
|---|---|---|---|
| `GEMINI_API_KEY` | Optional | API key for Google Gemini (`gemini-3.8-flash`). If omitted or rate-limited, the system falls back seamlessly to deterministic demo analysis. | None |
| `PORT` | Optional | Port on which the Express server and Vite middleware listen. | `3000` |
| `APP_URL` | Optional | Canonical URL where the applet is hosted (auto-populated in cloud environments). | None |
| `NODE_ENV` | Optional | Environment mode (`development` or `production`). | `development` |

---

## 13. Available Commands

All scripts defined in `package.json`:

```bash
# Start full-stack development server (Express + Vite middleware)
npm run dev

# Run TypeScript type-checking across all source files
npm run lint

# Execute type and integrity checks
npm test

# Build production assets for deployment
npm run build

# Start production Node.js server from built dist bundle
npm start

# Preview production build locally via Vite
npm run preview

# Clean build artifacts and distribution directories
npm run clean
```

### Running Test Suites Directly

```bash
# Run the 10-point Sentinel AI grounding & safety test suite
npx tsx src/ai/__tests__/sentinelAI.test.ts

# Run the 14-step demo determinism & reliability test suite
npx tsx src/demo/__tests__/demoScenario.test.ts
```

---

## 14. How to Run the Flagship Demo

To experience the full capability of CyberSentinel X in under 3 minutes:

1. **Launch the Platform**: Start the server via `npm run dev` and navigate to `http://localhost:3000`.
2. **Access the SOC Dashboard**: The main dashboard displays current telemetry, active alerts, and synthetic infrastructure health.
3. **Verify Demo Mode**: Notice the **DEMO CONTROLLER** bar anchored at the top of the interface.
4. **Trigger Attack Simulation**: Click **Start Attack Simulation** (or use the step selector to advance step-by-step).
5. **Watch the Attack Unfold**:
   * Observe authentication failure followed by the anomalous login.
   * Watch the risk score escalate from $10 \to 45 \to 85$.
6. **Inspect AttackDNA**: Switch to the **Attack Graph** tab to see causal links forming between the external attacker IP, compromised Okta account, bastion host, and database.
7. **Examine CyberTwin**: Open the **CyberTwin** page to see the affected nodes pulsing red with active blast radius indicators.
8. **Catch the Canary**: At Step 7, observe the deception trigger alerting on access to the honeytoken table.
9. **Engage Sentinel AI**: Open the **Sentinel AI Drawer** to view evidence-grounded facts, inferred attacker intent, and predicted lateral moves.
10. **Test Operator Q&A**: Ask a question like *"What evidence links user sarah.chen to the database access?"* and observe the citation-grounded response.
11. **Run Counterfactual Defense**: In the **Simulations** panel, compare response options (*Host Isolation* vs. *Session Revocation* vs. *Dual Quarantine*).
12. **Approve Containment**: Click **Approve Containment**.
13. **Observe Automated Verification**: Watch the 5-point verification checklist execute deterministically:
    * ✅ User session tokens invalidated
    * ✅ Active database sockets terminated
    * ✅ Host network egress blocked
    * ✅ Honeytoken decommissioned
    * ✅ Telemetry silence confirmed (zero egress)
14. **Confirm Resolution**: The incident status transitions to **RESOLVED - CONTAINMENT VERIFIED**.
15. **Forensic Replay**: Switch to the **Attack Replay** tab to scrub backward through the incident timeline.
16. **Generate Incident Report**: Navigate to **Reports** to review the auto-generated executive summary.
17. **Reset State**: Click **Reset Demo** in the top bar to restore the platform to a clean baseline.

---

## 15. Testing & Verification

The codebase includes two dedicated test suites validating core architectural promises:

### 1. Sentinel AI Test Suite (`src/ai/__tests__/sentinelAI.test.ts`)
Validates all ten safety, grounding, validation, and privacy requirements:
1. **Schema Validation**: Confirms valid Gemini JSON responses pass strict runtime validation.
2. **Safe JSON Extraction**: Verifies extraction of JSON wrapped in markdown code fences.
3. **Hallucination Filtering**: Injects invalid evidence IDs (e.g., `E-HALLUCINATED-999`) and proves they are excised while flagging unverified claims.
4. **Empty Evidence Handling**: Ensures graceful degradation when incidents contain zero evidence artifacts.
5. **Insufficient Evidence Handling**: Asserts that Q&A explicitly states when evidence is lacking rather than fabricating facts.
6. **AI Fallback Resilience**: Confirms automatic switch to deterministic fallback when Gemini is offline.
7. **Identity Integrity**: Verifies refreshed analyses maintain incident identity and consistency.
8. **Cache Consistency**: Tests deterministic caching of analysis outputs.
9. **Sensitive Data Redaction**: Passes mock passwords, Bearer tokens, and AWS access keys to prove they are scrubbed to `[REDACTED]`.
10. **Execution Sandboxing**: Validates that AI output models contain zero operational execution handlers.

### 2. Demo Determinism Test Suite (`src/demo/__tests__/demoScenario.test.ts`)
Validates that the hackathon demonstration is deterministic and reproducible:
1. **Step Progression**: Verifies all 14 state transitions (`IDLE` $\to$ `VERIFIED`).
2. **Score Determinism**: Asserts risk scores and confidence percentages match predefined thresholds at each step.
3. **Reproducibility**: Executes consecutive demo runs and asserts identical state, node reveals, and evidence bindings.
4. **Clean Reset Guarantee**: Validates that resetting clears active timers, state mutations, and AI audit logs back to baseline.
5. **Double-Click Protection**: Ensures rapid duplicate approval clicks cannot trigger double containment execution.

---

## 16. Demo Data Architecture

All data in CyberSentinel X is synthetic enterprise data crafted to simulate a real-world corporate technology footprint:

* **Synthetic Users**: `sarah.chen` (Lead Data Engineer), `marcus.vance` (DevOps Engineer), `admin-svc-backup` (Service Account).
* **Synthetic Assets**:
  * `okta-sso` (Cloud Identity Provider)
  * `wkstation-sec-04` (Engineer Workstation)
  * `srv-bastion-01` (Linux Jump Host)
  * `db-payroll-prod` (PCI/PII Production Database)
  * `s3-corp-backups` (Cloud Storage Bucket)
* **Synthetic Network Entities**:
  * External Adversary IP: `198.51.100.23` (Tor Exit Node)
  * Internal Subnets: `10.0.1.0/24` (Workstations), `10.0.4.0/24` (Production Database Tier)
* **Synthetic Evidence Catalog**:
  * `E-101`: Failed authentication logs (12 attempts in 40 seconds)
  * `E-102`: Anomalous geofence login from unknown ASN
  * `E-103`: Sudo cache privilege escalation audit log
  * `E-104`: Egress port sweep telemetry
  * `E-105`: PostgreSQL elevated session connection record
  * `E-106`: Canary table SELECT query on `canary_admin_credentials`
  * `E-107`: Threat intelligence feed match on adversary IP address

---

## 17. AI Safety & Evidence Classification Model

CyberSentinel X enforces a strict epistemic taxonomy across all generated insights:

| Layer | Epistemic Status | Operational Rule | Example Statement |
|---|---|---|---|
| **OBSERVED** | Hard Telemetry Fact | Must cite valid, existing evidence IDs. | *"12 failed logins detected from IP 198.51.100.23 between 14:20:10 and 14:20:50 (Evidence: E-101)."* |
| **INFERRED** | Analytical Deduction | Must explain causal link and include confidence score. | *"Adversary utilized credential stuffing to compromise user sarah.chen (Confidence: 91%)."* |
| **PREDICTED** | Future Risk Projection | Must be explicitly labeled as forecast; never presented as fact. | *"Adversary likely to probe cloud storage buckets within 15 minutes based on MITRE T1048."* |
| **RESPONSE** | Advisory Playbook | Requires human operator review and counterfactual simulation. | *"Recommended action: Revoke active Okta tokens and isolate srv-bastion-01."* |
| **VERIFICATION** | Post-Action Verification | Deterministic binary audit; cannot be overridden by AI. | *"5 of 5 checks passed. Host network isolated. Containment verified."* |

---

## 18. Response Safety Workflow

Autonomous response without human oversight can cause catastrophic operational outages. CyberSentinel X enforces a strict human-in-the-loop safety protocol:

```text
Gemini Advisory Recommendation
              ↓
Human Operator Review & Selection
              ↓
Counterfactual Impact Simulation (Containment Efficacy vs. Business Downtime)
              ↓
Explicit Operator Cryptographic/Click Approval
              ↓
Simulated Containment Execution
              ↓
Automated 5-Point Verification Engine
              ↓
Incident Resolution
```

* **No Autonomous Containment**: Gemini cannot initiate or execute containment actions.
* **Double-Action Guards**: All destructive response simulations require explicit confirmation.
* **Deterministic Verification Gate**: An incident cannot transition to `RESOLVED` until the Verification Engine confirms that all attack criteria have been silenced.

---

## 19. Current Implementation Status

### ✅ Implemented & Active
* Full-stack TypeScript architecture (Node.js/Express server + Vite React SPA).
* Ingestion, normalization, detection, correlation, and risk engines.
* Interactive AttackDNA graph visualization with `@xyflow/react`.
* Dynamic CyberTwin infrastructure topology with real-time infection state rendering.
* Adaptive deception mesh with canary triggers and high-fidelity evidence emission.
* Counterfactual defense simulation comparing response options against operational impact.
* Deterministic 5-point post-containment verification engine.
* Complete 14-step forensic attack replay engine.
* Server-side Gemini API proxy using the `@google/genai` SDK (`gemini-3.8-flash`).
* PII/credential sanitization, schema validation, and hallucinated citation filtering.
* Deterministic AI fallback ensuring 100% demo resilience during rate limits or outages.
* Comprehensive test suites for AI safety and demo determinism.

### 🟡 Demo / Synthetic
* Telemetry stream is generated from synthetic enterprise data models.
* Containment actions (account suspension, host firewall rules) mutate application state in-memory rather than issuing real AWS/Active Directory/iptables commands.
* Canary tokens and decoys exist within the synthetic sandbox.

### 🔮 Future / Production Roadmap
* Production SIEM connectors (Splunk, Elastic, Microsoft Sentinel).
* Cloud identity integration (Okta, Azure Entra ID, Google Workspace OAuth).
* Live cloud infrastructure telemetry (AWS CloudTrail, GCP Cloud Audit Logs, Azure Activity Logs).
* EDR sensor agent ingestion (CrowdStrike Falcon, SentinelOne, Wazuh).
* Real-world SOAR orchestration playbooks (Palo Alto XSOAR, Tines, Torq).
* Multi-tenant graph persistence backed by Neo4j or Amazon Neptune.

---

## 20. Limitations

* **Synthetic Environment**: The current implementation operates on high-fidelity synthetic telemetry rather than live enterprise production feeds.
* **Simulated Actions**: Containment actions are simulated within the digital twin state model and do not execute live operating system commands.
* **Advisory AI Quota Dependency**: Gemini API calls rely on Google GenAI availability. While the deterministic fallback completely prevents demo disruption, live dynamic text generation requires an active API key with available quota.
* **Single Scenario Focus**: The primary interactive demo focuses on the flagship identity-to-database intrusion path (`INC-2026-0042`).

---

## 21. Hackathon Value & Innovation

CyberSentinel X introduces three distinct architectural breakthroughs for modern cybersecurity operations:

1. **Closing the Loop Between AI and Verification**: Standard AI security demos stop at generating a textual summary of an alert. CyberSentinel X takes the analysis further: it feeds AI advice into a counterfactual simulation engine, requires human operator authorization, and runs deterministic post-containment verification scripts before certifying resolution.
2. **Dual-Lens Visualization (AttackDNA + CyberTwin)**: Rather than choosing between an abstract attack graph and an infrastructure diagram, CyberSentinel X synchronizes both. Operators see how the attacker's conceptual kill chain (AttackDNA) maps directly to physical servers, cloud databases, and blast radiuses (CyberTwin).
3. **Resilient Production Engineering**: Designed with the pragmatic understanding that LLM APIs can experience rate limits and network degradation. By combining server-side proxying, automated citation scrubbing, strict schema validation, and a deterministic evidence fallback, the platform remains fully functional under any operational circumstance.

---

## 22. Roadmap

### Phase 1: Now (Hackathon Prototype)
* Completed synthetic SOC command center.
* Deterministic correlation, AttackDNA, and CyberTwin engines.
* Gemini integration with strict evidence grounding and privacy sanitization.
* Counterfactual defense simulation and automated containment verification.
* 100% test coverage across AI safety and demo determinism.

### Phase 2: Next (Telemetry Adapters)
* Ingestion plugins for standard syslog, CEF, and Zeek network logs.
* Webhook ingestion for AWS GuardDuty and GitHub Audit Logs.
* Export capabilities for MITRE ATT&CK Navigator JSON layers.
* Multi-analyst collaborative annotations via WebSockets.

### Phase 3: Future (Enterprise Autonomous Defense)
* Bi-directional SOAR connectors for automated firewall and IAM policy updates.
* Distributed graph database backend (Neo4j) for billion-event enterprise correlation.
* Self-improving deception grid that dynamically places canaries along predicted lateral movement paths.

---

## 23. Contributing

We welcome contributions to CyberSentinel X! When contributing, please adhere to our architectural principles:

1. **Sandboxed Defense**: Ensure all new security actions and scenarios remain strictly sandboxed and safe.
2. **Preserve Grounding**: Any new AI features must maintain strict evidence grounding and citation validation.
3. **Separate AI from State Mutation**: Never allow AI model outputs to directly mutate security state or execute containment actions without human-in-the-loop approval.
4. **Type Safety**: Maintain strict TypeScript compliance across all modules.
5. **No Secrets**: Never commit real API keys, credentials, or private certificates.
6. **Add Tests**: Accompany new engines or safety features with automated tests in `__tests__/`.

---

## 24. License

License: Not yet specified.

---

*Built with operational rigor for the next generation of evidence-first cyber defense.*
