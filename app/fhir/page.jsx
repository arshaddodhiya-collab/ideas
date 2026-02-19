"use client";

import { useState } from "react";

const palette = {
  bg: "#0A0F1E",
  surface: "#111827",
  card: "#161F35",
  border: "#1E2D4A",
  accent: "#00D4FF",
  accentGlow: "rgba(0,212,255,0.15)",
  green: "#00E5A0",
  greenGlow: "rgba(0,229,160,0.15)",
  amber: "#FFB547",
  amberGlow: "rgba(255,181,71,0.12)",
  red: "#FF5C7A",
  text: "#E8F0FE",
  muted: "#6B82A8",
  dimmed: "#3A4F6E",
};

const styles = {
  page: {
    background: palette.bg,
    minHeight: "100vh",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    color: palette.text,
    overflowX: "hidden",
  },
  header: {
    borderBottom: `1px solid ${palette.border}`,
    padding: "20px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(10,15,30,0.95)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(12px)",
  },
  badge: (color) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "3px",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    border: `1px solid ${color}`,
    color: color,
    background: `${color}15`,
  }),
  section: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 40px",
  },
  sectionTitle: {
    fontSize: "11px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: palette.muted,
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  sectionTitleLine: {
    flex: 1,
    height: "1px",
    background: palette.border,
  },
  card: {
    background: palette.card,
    border: `1px solid ${palette.border}`,
    borderRadius: "8px",
    padding: "24px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
  },
};

// ── DATA ────────────────────────────────────────────────────────────────────

const problemPoints = [
  { icon: "⚡", label: "Fragmented Adapters", desc: "Every HMIS vendor builds bespoke HL7→FHIR glue code, creating N×M integration matrix." },
  { icon: "🔄", label: "No Standard Mapping", desc: "Inconsistent code-system mappings (SNOMED CT, ICD-10, LOINC) across implementations." },
  { icon: "🚫", label: "NHCX Non-Compliance", desc: "Legacy bundles fail NRCeS profile validation, blocking ABDM ecosystem participation." },
  { icon: "⏱", label: "Slow Adoption", desc: "Months of engineering per hospital integration delays the digital health roadmap." },
];

const useCases = [
  {
    id: "coverage",
    tag: "Use Case 1",
    title: "Coverage Eligibility",
    color: palette.accent,
    fhirResource: "CoverageEligibilityRequest / Response",
    trigger: "Patient OPD registration or IPD admission",
    legacySources: ["ADT HL7 v2 ZBE/ADT^A01", "HMIS patient CSV export", "Insurance DB row dump"],
    fhirOutput: ["Patient", "Coverage", "Organization (payer)", "CoverageEligibilityRequest"],
    snomedCodes: ["185387006 – New patient consultation", "11429006 – Insurance coverage"],
    nhcxProfile: "HCXCoverageEligibilityRequest",
    flow: ["Parse HL7 ADT/CSV", "Resolve patient ABHA", "Lookup insurer OID", "Map benefit plan codes", "Build FHIR bundle", "Validate NRCeS profile", "POST to HCX gateway"],
  },
  {
    id: "claim",
    tag: "Use Case 2",
    title: "Claim & Pre-Auth",
    color: palette.green,
    fhirResource: "Claim / ClaimResponse",
    trigger: "Discharge billing or pre-authorisation request",
    legacySources: ["HL7 v2 DFT^P03 billing", "Lab/Radiology DICOM SR", "Pharmacy dispense CSV"],
    fhirOutput: ["Patient", "Encounter", "Condition (ICD-10)", "Procedure (SNOMED)", "Claim", "SupportingInfo"],
    snomedCodes: ["308335008 – Patient encounter", "71388002 – Procedure", "404684003 – Clinical finding"],
    nhcxProfile: "HCXClaim",
    flow: ["Ingest DFT/ORU msgs", "Map diagnosis ICD→SNOMED", "Attach supporting docs", "Compute claim amount", "Build FHIR bundle", "Sign with HCX cert", "Submit & track ClaimResponse"],
  },
  {
    id: "communication",
    tag: "Use Case 3",
    title: "Communication",
    color: palette.amber,
    fhirResource: "Communication / CommunicationRequest",
    trigger: "Query/response between payer and provider",
    legacySources: ["Email attachments", "PDF letters", "Proprietary portal messages"],
    fhirOutput: ["Communication", "CommunicationRequest", "DocumentReference", "Attachment"],
    snomedCodes: ["386053000 – Evaluation procedure", "229070002 – Consultation request"],
    nhcxProfile: "HCXCommunication",
    flow: ["Capture free-text/PDF", "Extract structured intent", "Reference parent Claim", "Attach binary payloads", "Build FHIR bundle", "Route via HCX protocol", "Update claim workflow state"],
  },
];

const archLayers = [
  {
    layer: "01 — Ingestion",
    color: palette.accent,
    items: [
      { name: "HL7 v2.x Listener", desc: "MLLP server + HL7 parser (HAPI HL7 Java / hl7apy Python)" },
      { name: "Flat File Watcher", desc: "CSV/XML polling with configurable column→field mapping YAMLs" },
      { name: "REST Webhook", desc: "HTTP endpoint for JSON/XML push from legacy APIs & DB dumps" },
    ],
  },
  {
    layer: "02 — Mapping Engine",
    color: palette.green,
    items: [
      { name: "Config-Driven Mapper", desc: "YAML/JSON mapping files – zero custom code for new systems" },
      { name: "SNOMED CT Lookup", desc: "Embedded SNOMED ECL engine + UMLS REST fallback" },
      { name: "Terminology Server", desc: "Local HAPI FHIR Terminology Server for concept translation" },
    ],
  },
  {
    layer: "03 — FHIR Builder",
    color: palette.amber,
    items: [
      { name: "Resource Factory", desc: "Typed FHIR R4 resource builders (Patient, Claim, Coverage…)" },
      { name: "Bundle Assembler", desc: "Constructs transaction bundles with correct entry.request verbs" },
      { name: "Profile Applicator", desc: "Injects NHCX/ABDM profile URLs + required extensions" },
    ],
  },
  {
    layer: "04 — Validation & Output",
    color: palette.red,
    items: [
      { name: "NRCeS Validator", desc: "HAPI FHIR Validator with NRCeS StructureDefinition snapshots" },
      { name: "Error Reporter", desc: "Structured JSON error report with OperationOutcome + fix hints" },
      { name: "HCX Gateway Client", desc: "Signs & POSTs to HCX sandbox/production with retry logic" },
    ],
  },
];

const techStack = [
  { group: "Core Runtime", items: ["Python 3.11 (FastAPI)", "fhir.resources 7.x", "hl7apy 1.3.x"] },
  { group: "Terminology", items: ["HAPI FHIR Terminology Server", "SNOMED CT RF2 subset", "NRCeS profile IG"] },
  { group: "Validation", items: ["fhir-py-validator", "NRCeS StructureDefinitions", "OperationOutcome reporting"] },
  { group: "Configuration", items: ["YAML mapping files", "Jinja2 templates", "JSON Schema validation"] },
  { group: "Deployment", items: ["Docker + docker-compose", "Kubernetes Helm chart", "OpenAPI 3.1 docs"] },
  { group: "Observability", items: ["Prometheus metrics", "Structured JSON logs", "Conversion audit trail"] },
];

const mappingExample = {
  source: `# mapping/hl7_adt_to_coverage.yaml
patient:
  family_name:  PID.5.1
  given_name:   PID.5.2
  dob:          PID.7       # format: YYYYMMDD
  gender:       PID.8       # map: M→male, F→female
  abha_id:      PID.3[id_type=ABHA]

coverage:
  insurer_id:   IN1.4       # OID lookup: payer_registry.yaml
  plan_code:    IN1.35
  subscriber_id: IN1.36
  period_start: IN1.12
  period_end:   IN1.13

snomed_map:
  encounter_type:
    O: "185387006"  # outpatient
    I: "11429006"   # inpatient`,
  output: `// FHIR Bundle (NHCXCoverageEligibilityRequest)
{
  "resourceType": "Bundle",
  "meta": {
    "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Bundle"]
  },
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "identifier": [{ "system": "https://healthid.ndhm.gov.in", "value": "91-1234-5678-9012" }],
        "name": [{ "family": "Sharma", "given": ["Ananya"] }],
        "gender": "female",
        "birthDate": "1990-04-15"
      }
    },
    {
      "resource": {
        "resourceType": "CoverageEligibilityRequest",
        "meta": {
          "profile": ["https://ig.hcxprotocol.io/v0.7/StructureDefinition-HCXCoverageEligibilityRequest.html"]
        },
        "status": "active",
        "purpose": ["benefits"],
        "patient": { "reference": "Patient/ananya-sharma" },
        "insurance": [{ "coverage": { "reference": "Coverage/pmjay-001" } }]
      }
    }
  ]
}`,
};

const roadmap = [
  { phase: "M1–M2", label: "Foundation", color: palette.accent, items: ["HL7 v2.x ingestion pipeline", "Coverage Eligibility mapper", "Basic FHIR R4 builder", "NRCeS profile integration"] },
  { phase: "M3–M4", label: "Claim & Pre-Auth", color: palette.green, items: ["DFT/ORU message parsing", "ICD-10 → SNOMED mapping", "Claim bundle assembler", "HCX gateway client (sandbox)"] },
  { phase: "M5–M6", label: "Communication + Polish", color: palette.amber, items: ["Communication resource flow", "Config-driven YAML mapper UI", "Full NRCeS validator suite", "Docker/Helm OSS release v1.0"] },
];

// ── COMPONENTS ───────────────────────────────────────────────────────────────

function Tag({ children, color }) {
  return <span style={styles.badge(color || palette.muted)}>{children}</span>;
}

function SectionHeader({ title }) {
  return (
    <div style={styles.sectionTitle}>
      <span>{title}</span>
      <div style={styles.sectionTitleLine} />
    </div>
  );
}

function UseCaseCard({ uc, expanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        ...styles.card,
        borderColor: expanded ? uc.color : palette.border,
        boxShadow: expanded ? `0 0 24px ${uc.color}20` : "none",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: expanded ? "20px" : 0 }}>
        <div>
          <div style={{ fontSize: "10px", color: uc.color, letterSpacing: "2px", marginBottom: "6px", textTransform: "uppercase" }}>{uc.tag}</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: palette.text }}>{uc.title}</div>
          <div style={{ fontSize: "12px", color: palette.muted, marginTop: "4px" }}>{uc.fhirResource}</div>
        </div>
        <div style={{ fontSize: "18px", color: palette.muted, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${palette.border}`, paddingTop: "20px" }}>
          <div style={styles.grid2}>
            <div>
              <div style={{ fontSize: "10px", color: palette.muted, letterSpacing: "2px", marginBottom: "10px" }}>LEGACY SOURCES</div>
              {uc.legacySources.map((s, i) => (
                <div key={i} style={{ fontSize: "12px", color: palette.text, padding: "4px 0", borderBottom: `1px solid ${palette.border}` }}>
                  <span style={{ color: uc.color, marginRight: "8px" }}>›</span>{s}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "10px", color: palette.muted, letterSpacing: "2px", marginBottom: "10px" }}>FHIR RESOURCES PRODUCED</div>
              {uc.fhirOutput.map((r, i) => (
                <div key={i} style={{ fontSize: "12px", color: palette.text, padding: "4px 0", borderBottom: `1px solid ${palette.border}` }}>
                  <span style={{ color: uc.color, marginRight: "8px" }}>◆</span>{r}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <div style={{ fontSize: "10px", color: palette.muted, letterSpacing: "2px", marginBottom: "12px" }}>CONVERSION PIPELINE</div>
            <div style={{ display: "flex", gap: "0", overflowX: "auto" }}>
              {uc.flow.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    background: `${uc.color}15`,
                    border: `1px solid ${uc.color}40`,
                    borderRadius: "4px",
                    padding: "6px 12px",
                    fontSize: "11px",
                    color: palette.text,
                    whiteSpace: "nowrap",
                  }}>{step}</div>
                  {i < uc.flow.length - 1 && <span style={{ color: palette.dimmed, padding: "0 4px", fontSize: "14px" }}>→</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "20px", background: `${palette.bg}`, borderRadius: "6px", padding: "12px 16px", border: `1px solid ${palette.border}` }}>
            <div style={{ fontSize: "10px", color: palette.muted, letterSpacing: "2px", marginBottom: "8px" }}>SNOMED CT MAPPINGS</div>
            {uc.snomedCodes.map((c, i) => (
              <div key={i} style={{ fontSize: "12px", color: palette.accent, fontFamily: "monospace" }}>{c}</div>
            ))}
            <div style={{ marginTop: "8px", fontSize: "11px", color: palette.muted }}>Profile: <span style={{ color: uc.color }}>{uc.nhcxProfile}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArchLayerCard({ layer }) {
  return (
    <div style={{ ...styles.card, borderLeft: `3px solid ${layer.color}` }}>
      <div style={{ fontSize: "11px", color: layer.color, letterSpacing: "2px", marginBottom: "16px", textTransform: "uppercase" }}>{layer.layer}</div>
      {layer.items.map((item, i) => (
        <div key={i} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: i < layer.items.length - 1 ? `1px solid ${palette.border}` : "none" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: palette.text, marginBottom: "4px" }}>{item.name}</div>
          <div style={{ fontSize: "11px", color: palette.muted, lineHeight: "1.5" }}>{item.desc}</div>
        </div>
      ))}
    </div>
  );
}

function CodeBlock({ code, lang, color }) {
  return (
    <div style={{
      background: "#080D1A",
      border: `1px solid ${palette.border}`,
      borderTop: `2px solid ${color || palette.accent}`,
      borderRadius: "6px",
      overflow: "hidden",
    }}>
      <div style={{ padding: "8px 16px", borderBottom: `1px solid ${palette.border}`, fontSize: "10px", color: palette.muted, letterSpacing: "1px" }}>
        {lang}
      </div>
      <pre style={{ margin: 0, padding: "16px", fontSize: "11px", color: "#A8C0E8", overflowX: "auto", lineHeight: "1.7", whiteSpace: "pre" }}>
        {code}
      </pre>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeUseCase, setActiveUseCase] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Problem & Use Cases" },
    { id: "architecture", label: "Architecture" },
    { id: "mapping", label: "Mapping Example" },
    { id: "roadmap", label: "Roadmap & Stack" },
  ];

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: palette.accent, letterSpacing: "1px" }}>
            NHCX<span style={{ color: palette.text }}>·FHIR</span>
          </div>
          <Tag color={palette.accent}>FHIR Utility for Providers</Tag>
          <Tag color={palette.green}>OSS Microservice</Tag>
        </div>
        <div style={{ fontSize: "11px", color: palette.muted }}>ABDM · NRCeS · NHCX Protocol v0.7</div>
      </div>

      {/* HERO */}
      <div style={{ background: `linear-gradient(180deg, #0D1628 0%, ${palette.bg} 100%)`, borderBottom: `1px solid ${palette.border}`, padding: "48px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", color: palette.accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
            Problem Statement · Legacy Systems → NHCX-Aligned FHIR
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "800", margin: "0 0 16px", lineHeight: "1.2", maxWidth: "700px" }}>
            Legacy Healthcare Data,<br />
            <span style={{ color: palette.accent }}>NHCX-Ready FHIR Bundles.</span>
          </h1>
          <p style={{ fontSize: "14px", color: palette.muted, lineHeight: "1.8", maxWidth: "680px", margin: "0 0 28px" }}>
            An open-source microservice that ingests HL7 v2.x messages, CSV/XML exports, and proprietary HMIS data — 
            then transforms them into validated, NRCeS-profile-compliant FHIR bundles for Coverage Eligibility, 
            Claim/Pre-Auth, and Communication workflows on the ABDM/NHCX ecosystem.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["Coverage Eligibility", "Claim / Pre-Auth", "Communication", "HL7 v2.x → FHIR R4", "SNOMED CT Mapping", "NRCeS Validated"].map((t, i) => (
              <Tag key={i} color={i < 3 ? [palette.accent, palette.green, palette.amber][i] : palette.dimmed}>{t}</Tag>
            ))}
          </div>
        </div>
      </div>

      {/* NAV TABS */}
      <div style={{ borderBottom: `1px solid ${palette.border}`, background: palette.surface, position: "sticky", top: "61px", zIndex: 90 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", gap: "0" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${palette.accent}` : "2px solid transparent",
              color: activeTab === tab.id ? palette.accent : palette.muted,
              padding: "14px 20px",
              fontSize: "12px",
              letterSpacing: "1px",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "color 0.15s",
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {activeTab === "overview" && (
        <div style={styles.section}>
          {/* Problem */}
          <SectionHeader title="The Problem" />
          <div style={styles.grid2}>
            {problemPoints.map((p, i) => (
              <div key={i} style={{ ...styles.card, display: "flex", gap: "16px" }}>
                <div style={{ fontSize: "24px" }}>{p.icon}</div>
                <div>
                  <div style={{ fontWeight: "700", marginBottom: "4px", fontSize: "13px" }}>{p.label}</div>
                  <div style={{ fontSize: "12px", color: palette.muted, lineHeight: "1.6" }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Use Cases */}
          <div style={{ marginTop: "48px" }}>
            <SectionHeader title="Selected Use Cases" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {useCases.map(uc => (
                <UseCaseCard
                  key={uc.id}
                  uc={uc}
                  expanded={activeUseCase === uc.id}
                  onToggle={() => setActiveUseCase(activeUseCase === uc.id ? null : uc.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ARCHITECTURE ── */}
      {activeTab === "architecture" && (
        <div style={styles.section}>
          <SectionHeader title="Service Architecture" />

          {/* Flow Diagram */}
          <div style={{ ...styles.card, marginBottom: "32px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: palette.muted, letterSpacing: "2px", marginBottom: "24px" }}>DATA FLOW</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", flexWrap: "wrap", rowGap: "12px" }}>
              {[
                { label: "HL7 v2.x\nDevice / ADT", color: palette.muted },
                { label: "CSV / XML\nFlat Files", color: palette.muted },
                { label: "REST / DB\nLegacy APIs", color: palette.muted },
              ].map((src, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: "6px", padding: "10px 16px", fontSize: "11px", color: palette.text, textAlign: "center", whiteSpace: "pre-line", lineHeight: "1.5" }}>{src.label}</div>
                  <div style={{ color: palette.dimmed, padding: "0 8px", fontSize: "18px" }}>→</div>
                </div>
              ))}
              <div style={{ background: `${palette.accent}15`, border: `1px solid ${palette.accent}`, borderRadius: "6px", padding: "14px 24px", fontSize: "13px", fontWeight: "700", color: palette.accent }}>
                NHCX-FHIR<br /><span style={{ fontSize: "10px", fontWeight: "400", color: palette.muted }}>Converter Service</span>
              </div>
              <div style={{ color: palette.dimmed, padding: "0 8px", fontSize: "18px" }}>→</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {["CoverageEligibilityRequest", "Claim Bundle", "Communication"].map((out, i) => (
                  <div key={i} style={{ background: `${[palette.accent, palette.green, palette.amber][i]}15`, border: `1px solid ${[palette.accent, palette.green, palette.amber][i]}40`, borderRadius: "4px", padding: "6px 14px", fontSize: "11px", color: [palette.accent, palette.green, palette.amber][i] }}>{out}</div>
                ))}
              </div>
              <div style={{ cololr: palette.dimmed, padding: "0 8px", fontSize: "18px" }}>→</div>
              <div style={{ background: `${palette.green}15`, border: `1px solid ${palette.green}`, borderRadius: "6px", padding: "14px 24px", fontSize: "12px", fontWeight: "700", color: palette.green, textAlign: "center" }}>
                HCX<br />Gateway<br /><span style={{ fontSize: "10px", fontWeight: "400", color: palette.muted }}>NRCeS Validated</span>
              </div>
            </div>
          </div>

          {/* Architecture Layers */}
          <div style={styles.grid2}>
            {archLayers.map((layer, i) => (
              <ArchLayerCard key={i} layer={layer} />
            ))}
          </div>

          {/* API Surface */}
          <div style={{ marginTop: "32px" }}>
            <SectionHeader title="REST API Surface" />
            <div style={{ ...styles.card }}>
              {[
                { method: "POST", path: "/convert/coverage-eligibility", color: palette.green, desc: "Transform HL7 ADT / CSV → HCXCoverageEligibilityRequest bundle" },
                { method: "POST", path: "/convert/claim", color: palette.green, desc: "Transform DFT billing message / XML → HCXClaim bundle" },
                { method: "POST", path: "/convert/communication", color: palette.green, desc: "Transform free-text / attachment → HCXCommunication bundle" },
                { method: "POST", path: "/validate", color: palette.amber, desc: "Validate any FHIR bundle against NRCeS profile, return OperationOutcome" },
                { method: "GET", path: "/mappings/{system}", color: palette.accent, desc: "Retrieve or inspect active YAML mapping config for a source system" },
                { method: "PUT", path: "/mappings/{system}", color: palette.accent, desc: "Hot-reload updated YAML mapping without service restart" },
              ].map((ep, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "12px 0", borderBottom: i < 5 ? `1px solid ${palette.border}` : "none" }}>
                  <span style={{ ...styles.badge(ep.color), minWidth: "44px", textAlign: "center" }}>{ep.method}</span>
                  <div>
                    <div style={{ fontSize: "13px", color: palette.accent, fontFamily: "monospace" }}>{ep.path}</div>
                    <div style={{ fontSize: "11px", color: palette.muted, marginTop: "3px" }}>{ep.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: MAPPING EXAMPLE ── */}
      {activeTab === "mapping" && (
        <div style={styles.section}>
          <SectionHeader title="Configuration-Driven Mapping" />
          <div style={{ ...styles.card, marginBottom: "24px" }}>
            <p style={{ fontSize: "13px", color: palette.muted, lineHeight: "1.8", margin: 0 }}>
              All field mappings are declared in <strong style={{ color: palette.accent }}>YAML configuration files</strong> — 
              no custom code is required when onboarding a new source system. 
              Mapping files specify XPath/HL7-segment dot-notation paths, terminology translations, 
              and SNOMED CT code assignments. A hot-reload API allows live updates without redeployment.
            </p>
          </div>
          <div style={styles.grid2}>
            <div>
              <div style={{ fontSize: "10px", color: palette.muted, letterSpacing: "2px", marginBottom: "12px" }}>INPUT — HL7 v2.x Mapping Config</div>
              <CodeBlock lang="YAML · hl7_adt_to_coverage.yaml" code={mappingExample.source} color={palette.amber} />
            </div>
            <div>
              <div style={{ fontSize: "10px", color: palette.muted, letterSpacing: "2px", marginBottom: "12px" }}>OUTPUT — NHCX FHIR Bundle (R4)</div>
              <CodeBlock lang="JSON · CoverageEligibilityRequest Bundle" code={mappingExample.output} color={palette.green} />
            </div>
          </div>

          <div style={{ marginTop: "32px" }}>
            <SectionHeader title="Validation Error Reporting" />
            <CodeBlock lang="JSON · OperationOutcome (NRCeS profile validation failure)" color={palette.red} code={`{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "required",
      "diagnostics": "Patient.identifier: ABHA identifier required by NRCeS profile",
      "location": ["Bundle.entry[0].resource.identifier"],
      "details": {
        "text": "Fix: Add identifier with system='https://healthid.ndhm.gov.in'"
      }
    },
    {
      "severity": "warning",
      "code": "code-invalid",
      "diagnostics": "CoverageEligibilityRequest.purpose: code 'auth-requirements' not in HCX value set",
      "location": ["Bundle.entry[2].resource.purpose[0]"],
      "details": {
        "text": "Allowed values: benefits | discovery | validation | auth-requirements"
      }
    }
  ],
  "_meta": {
    "validated_against": "https://nrces.in/ndhm/fhir/r4/StructureDefinition/Bundle",
    "hcx_profile_version": "0.7.1",
    "conversion_id": "conv_20240215_abc123"
  }
}`} />
          </div>
        </div>
      )}

      {/* ── TAB: ROADMAP ── */}
      {activeTab === "roadmap" && (
        <div style={styles.section}>
          <SectionHeader title="Delivery Roadmap" />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
            {roadmap.map((phase, i) => (
              <div key={i} style={{ ...styles.card, display: "flex", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ minWidth: "100px" }}>
                  <div style={{ fontSize: "10px", color: phase.color, letterSpacing: "2px", marginBottom: "4px" }}>{phase.phase}</div>
                  <div style={{ fontWeight: "700", fontSize: "14px" }}>{phase.label}</div>
                </div>
                <div style={{ flex: 1, display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {phase.items.map((item, j) => (
                    <div key={j} style={{ background: `${phase.color}10`, border: `1px solid ${phase.color}30`, borderRadius: "4px", padding: "6px 14px", fontSize: "12px", color: palette.text }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <SectionHeader title="Technology Stack" />
          <div style={styles.grid3}>
            {techStack.map((group, i) => (
              <div key={i} style={styles.card}>
                <div style={{ fontSize: "10px", color: palette.muted, letterSpacing: "2px", marginBottom: "12px", textTransform: "uppercase" }}>{group.group}</div>
                {group.items.map((item, j) => (
                  <div key={j} style={{ fontSize: "12px", color: palette.text, padding: "4px 0", borderBottom: j < group.items.length - 1 ? `1px solid ${palette.border}` : "none", fontFamily: "monospace" }}>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "32px" }}>
            <SectionHeader title="Open Source Strategy" />
            <div style={styles.grid2}>
              {[
                { title: "License & Governance", color: palette.accent, body: "Apache 2.0 license. Hosted on GitHub under a neutral foundation or ABDM contributors org. Versioned alongside HCX protocol releases (v0.7, v0.8...)." },
                { title: "HMIS Integration Mode", color: palette.green, body: "Available as (a) standalone Docker microservice with REST API, (b) embeddable Python library, or (c) HAPI FHIR server plugin — HMIS vendors choose their preferred integration model." },
                { title: "Extensibility", color: palette.amber, body: "New source systems onboarded by adding a YAML mapping file. Community-contributed mappings for common HMIS platforms (eHospital, HMS, Practo) published in the main repo." },
                { title: "NRCeS Profile Sync", color: palette.red, body: "StructureDefinition snapshots bundled with each release. Automated CI checks against latest NRCeS Implementation Guide to flag breaking profile changes." },
              ].map((card, i) => (
                <div key={i} style={{ ...styles.card, borderTop: `2px solid ${card.color}` }}>
                  <div style={{ fontWeight: "700", fontSize: "13px", marginBottom: "8px", color: card.color }}>{card.title}</div>
                  <div style={{ fontSize: "12px", color: palette.muted, lineHeight: "1.7" }}>{card.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${palette.border}`, padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ fontSize: "11px", color: palette.dimmed }}>NHCX-FHIR Converter · Open Source Microservice · FHIR R4 · ABDM / NHCX Protocol v0.7</div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Tag color={palette.accent}>Apache 2.0</Tag>
          <Tag color={palette.green}>NRCeS Compliant</Tag>
        </div>
      </div>
    </div>
  );
}