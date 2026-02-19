"use client"

import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   AI MAPPER — STEP 3: LLM + YAML PROFILE MAPPING ENGINE
   Complete deep-dive: architecture, process, tech stack, code patterns
   Aesthetic: surgical precision — warm cream paper + deep ink + electric highlights
   Font: Playfair Display (editorial) + JetBrains Mono (code) + Outfit (body)
═══════════════════════════════════════════════════════════════════════ */

const injectFonts = () => {
  if (document.getElementById("mapper-fonts")) return;
  const l = document.createElement("link");
  l.id = "mapper-fonts";  
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
  document.head.appendChild(l);

  const s = document.createElement("style");
  s.id = "mapper-styles";
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: #0D0D0D; }
    ::-webkit-scrollbar-thumb { background: #E8C547; border-radius: 10px; }
    @keyframes fadeSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes slideRight { from{width:0} to{width:100%} }
    @keyframes dotFlow {
      0%{transform:translateX(0);opacity:1}
      100%{transform:translateX(60px);opacity:0}
    }
    @keyframes glow { 0%,100%{box-shadow:0 0 8px #E8C54730} 50%{box-shadow:0 0 24px #E8C54760} }
    @keyframes typewriter { from{width:0} to{width:100%} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .fsu { animation: fadeSlideUp 0.55s ease both; }
    .fsu1 { animation: fadeSlideUp 0.55s 0.1s ease both; }
    .fsu2 { animation: fadeSlideUp 0.55s 0.2s ease both; }
    .fsu3 { animation: fadeSlideUp 0.55s 0.3s ease both; }
    .fsu4 { animation: fadeSlideUp 0.55s 0.4s ease both; }
    .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(232,197,71,0.15) !important; }
    .tab-btn { transition: all 0.18s ease; }
    .tab-btn:hover { opacity: 1 !important; }
    .step-card { transition: all 0.2s ease; }
    .step-card:hover { border-color: #E8C547 !important; }
    .glow-pulse { animation: glow 2.5s ease-in-out infinite; }
    .flow-dot { animation: dotFlow 1.2s linear infinite; }
  `;
  document.head.appendChild(s);
};

/* ── PALETTE ──────────────────────────────────────────────────── */
const P = {
  bg: "#0A0A0A",
  surface: "#111111",
  card: "#161616",
  cardBorder: "#222222",
  cardBorderBright: "#333333",
  gold: "#E8C547",
  goldDim: "rgba(232,197,71,0.08)",
  goldMid: "rgba(232,197,71,0.18)",
  goldBright: "rgba(232,197,71,0.35)",
  teal: "#2DD4BF",
  tealDim: "rgba(45,212,191,0.08)",
  orange: "#FB923C",
  orangeDim: "rgba(251,146,60,0.08)",
  blue: "#60A5FA",
  blueDim: "rgba(96,165,250,0.08)",
  green: "#4ADE80",
  greenDim: "rgba(74,222,128,0.08)",
  red: "#F87171",
  violet: "#A78BFA",
  violetDim: "rgba(167,139,250,0.08)",
  text: "#F0EDE8",
  textMid: "#8A8070",
  textDim: "#3A3530",
  mono: "'JetBrains Mono', monospace",
  body: "'Outfit', sans-serif",
  display: "'Playfair Display', serif",
};

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */

const PIPELINE_STEPS = [
  {
    num: "01", id: "detect",
    label: "Format Detection",
    sub: "Auto-detect input type",
    color: P.teal,
    icon: "◎",
    desc: "The mapper first auto-detects whether the incoming payload is HL7 v2.x, CSV, XML, or JSON. Uses magic-byte analysis + structural heuristics. No manual configuration needed.",
    tech: ["Spring Boot Service", "Regex Heuristics", "Apache Tika"],
    detail: `Detects: HL7 v2.x (MSH segment), CSV (delimiter sniff), XML (root tag), JSON (structure probe). Outputs: SourceFormatEnum + confidence score.`,
  },
  {
    num: "02", id: "profile",
    label: "Profile Loader",
    sub: "Load YAML mapping config",
    color: P.gold,
    icon: "⬡",
    desc: "Loads the matching YAML mapping profile from database or filesystem based on source system ID. Profiles are versioned and hot-reloadable without service restart.",
    tech: ["Jackson YAML", "Spring Cache", "MySQL mapping_profiles table"],
    detail: "Profiles stored in MySQL. Caffeine L1 cache (TTL 24h). PUT /api/v1/mappings/{system} triggers cache eviction. Zero downtime profile updates.",
  },
  {
    num: "03", id: "llm",
    label: "LLM Suggester",
    sub: "AI fills unknown fields",
    color: P.violet,
    icon: "◈",
    desc: "When the YAML profile has gaps (unknown columns, new HL7 segments), the LLM analyzes field names and sample values and suggests the most likely FHIR mapping with a confidence score.",
    tech: ["OpenAI GPT-4o / Gemini", "Spring WebClient", "Structured JSON Output"],
    detail: "Prompt includes: field name, sample values, FHIR R4 resource schema. Returns: {fhirPath, confidence, reasoning}. Only called for unmapped fields — never full documents.",
  },
  {
    num: "04", id: "transform",
    label: "Field Transformer",
    sub: "Apply rules & transforms",
    color: P.orange,
    icon: "⇄",
    desc: "Applies value transformations: date format normalization, gender code mapping (M→male), OID resolution, string trimming, null handling, and SNOMED CT code lookup.",
    tech: ["MapStruct", "Custom TransformPipeline", "SNOMED ECL Engine"],
    detail: "Transform chain: NullSafeTransform → DateNormalizer → CodeTranslator → SnomedResolver → TypeCaster. Each step is composable and testable in isolation.",
  },
  {
    num: "05", id: "assemble",
    label: "FHIR Assembler",
    sub: "Build typed R4 resources",
    color: P.blue,
    icon: "◆",
    desc: "Uses mapped, transformed values to build typed HAPI FHIR R4 resource objects: Patient, Coverage, Claim, Condition, Procedure. Each builder is independently unit-testable.",
    tech: ["HAPI FHIR R4 7.x", "Resource Factories", "Profile URL injection"],
    detail: "Builds: Patient → Coverage/CoverageEligibilityRequest → Claim → Condition → Procedure → Communication. Injects NHCX profile URLs + required extensions automatically.",
  },
  {
    num: "06", id: "audit",
    label: "Mapping Auditor",
    sub: "Score & log every field",
    color: P.green,
    icon: "✓",
    desc: "Every mapped field is scored and logged: source path, target FHIR path, transform applied, confidence score, whether LLM was used. Full audit trail in MySQL.",
    tech: ["MappingAuditService", "MySQL mapping_audit table", "JSON metrics"],
    detail: "Audit record per field: {source_field, fhir_path, value_before, value_after, confidence, llm_used, transform_chain}. Enables per-hospital mapping quality analytics.",
  },
];

const YAML_EXAMPLE = `# mapping_profiles/hl7_adt_v2_coverage.yaml
# Source: HL7 v2.x ADT^A01 — Target: HCXCoverageEligibilityRequest

profile_id: "HL7_ADT_COVERAGE_V2"
source_system: "HMIS_HL7_ADT"
version: "2.1.0"
fhir_bundle_type: "COVERAGE_ELIGIBILITY"
nhcx_profile: "https://ig.hcxprotocol.io/v0.7/HCXCoverageEligibilityRequest"

# ── PATIENT RESOURCE ─────────────────────────────────────
patient:
  family_name:
    source: "PID.5.1"           # HL7 segment.field.component
    transform: TRIM
  given_name:
    source: "PID.5.2"
    transform: TRIM
  date_of_birth:
    source: "PID.7"
    transform: DATE_YYYYMMDD    # → ISO 8601 (1990-04-15)
  gender:
    source: "PID.8"
    transform: CODE_MAP
    code_map: { M: male, F: female, O: other, U: unknown }
  abha_id:
    source: "PID.3"
    filter: "id_type == ABHA"   # pick right repetition
    fhir_system: "https://healthid.ndhm.gov.in"

# ── COVERAGE RESOURCE ────────────────────────────────────
coverage:
  insurer_oid:
    source: "IN1.4"
    transform: OID_LOOKUP        # resolves to insurer FHIR org ID
  plan_code:
    source: "IN1.35"
  subscriber_id:
    source: "IN1.36"
  period_start:
    source: "IN1.12"
    transform: DATE_YYYYMMDD
  period_end:
    source: "IN1.13"
    transform: DATE_YYYYMMDD

# ── SNOMED MAPPINGS ──────────────────────────────────────
snomed_map:
  encounter_class:
    O: { code: "185387006", display: "New patient consultation" }
    I: { code: "11429006",  display: "Inpatient admission" }
    E: { code: "50849002",  display: "Emergency room admission" }

# ── LLM FALLBACK ─────────────────────────────────────────
llm_fallback:
  enabled: true
  model: "gpt-4o-mini"
  min_confidence: 0.75          # reject suggestions below threshold
  fields_excluded: ["abha_id"]  # never LLM-guess identity fields`;

const LLM_PROMPT = `You are a FHIR R4 field mapping expert specializing in NHCX/ABDM healthcare standards.

INPUT FIELD DETAILS:
- Field name: "pat_dob_str"
- Sample values: ["15/04/1990", "22-11-1985", "1990.04.15"]
- Source system: "LEGACY_HMIS_CSV"
- Source system description: Hospital Management System CSV export

FHIR CONTEXT:
- Target bundle: CoverageEligibilityRequest
- Available FHIR R4 paths for patient date of birth:
  * Patient.birthDate (date, ISO 8601)

INSTRUCTIONS:
1. Identify the most likely FHIR R4 path for this field
2. Identify any data transformation needed
3. Return ONLY valid JSON, no explanation text

RESPONSE FORMAT:
{
  "fhir_path": "Patient.birthDate",
  "transform": "DATE_NORMALIZE",
  "date_formats_detected": ["dd/MM/yyyy", "dd-MM-yyyy", "yyyy.MM.dd"],
  "confidence": 0.97,
  "reasoning": "Field name contains 'dob', sample values are consistent date patterns"
}`;

const LLM_RESPONSE = `{
  "fhir_path": "Patient.birthDate",
  "transform": "DATE_NORMALIZE",
  "date_formats_detected": [
    "dd/MM/yyyy",
    "dd-MM-yyyy",
    "yyyy.MM.dd"
  ],
  "confidence": 0.97,
  "reasoning": "Field name 'pat_dob_str' contains 'dob' abbreviation. All 3 sample values are recognizable date patterns with Indian date formatting conventions.",
  "snomed_applicable": false,
  "validation_note": "Normalize all formats to ISO 8601 (yyyy-MM-dd) per FHIR spec"
}`;

const JAVA_SERVICE = `@Service
@RequiredArgsConstructor
@Slf4j
public class AIMappingService {

    private final MappingProfileRepository profileRepo;
    private final LLMSuggesterClient llmClient;
    private final TransformPipeline transformPipeline;
    private final SnomedLookupService snomedService;
    private final MappingAuditService auditService;

    @Cacheable("mappingProfiles")
    public MappingProfile loadProfile(String sourceSystem) {
        return profileRepo.findBySourceSystemAndActiveTrue(sourceSystem)
            .orElseThrow(() -> new ProfileNotFoundException(sourceSystem));
    }

    public MappedPayload executeMapping(
            ParsedLegacyPayload input,
            MappingProfile profile) {

        Map<String, MappedField> results = new LinkedHashMap<>();

        for (FieldMapping rule : profile.getFieldMappings()) {

            // 1. Extract raw value from parsed input
            String rawValue = input.extract(rule.getSourcePath());

            // 2. If unmapped and LLM fallback enabled → suggest
            if (rawValue == null && profile.isLlmFallbackEnabled()) {
                LLMSuggestion suggestion = llmClient.suggestMapping(
                    rule.getFieldName(),
                    input.getSampleValues(rule.getFieldName()),
                    profile.getFhirBundleType()
                );
                if (suggestion.getConfidence() >= profile.getMinConfidence()) {
                    rule = rule.withLLMSuggestion(suggestion);
                    rawValue = input.extract(rule.getSourcePath());
                }
            }

            // 3. Apply transform chain
            Object transformed = transformPipeline.apply(rawValue, rule.getTransforms());

            // 4. SNOMED CT lookup if code mapping required
            if (rule.requiresSnomedLookup()) {
                transformed = snomedService.resolve(
                    transformed.toString(), rule.getCodeSystem());
            }

            MappedField field = MappedField.builder()
                .fhirPath(rule.getFhirPath())
                .value(transformed)
                .confidence(rule.getConfidence())
                .llmUsed(rule.isLlmAssisted())
                .transformChain(rule.getTransformNames())
                .build();

            results.put(rule.getFhirPath(), field);

            // 5. Audit every field
            auditService.record(input.getConversionId(), rule, field);
        }

        return new MappedPayload(results, profile.getFhirBundleType());
    }
}`;

const TRANSFORM_CODE = `// TransformPipeline.java — composable transform chain
@Component
public class TransformPipeline {

    private final Map<String, FieldTransform> registry = Map.of(
        "TRIM",           value -> value.strip(),
        "UPPERCASE",      value -> value.toUpperCase(),
        "DATE_YYYYMMDD",  value -> LocalDate.parse(value,
                             DateTimeFormatter.ofPattern("yyyyMMdd")).toString(),
        "DATE_NORMALIZE", value -> DateNormalizer.detect(value),
        "CODE_MAP",       (value, codeMap) -> codeMap.getOrDefault(value, value),
        "OID_LOOKUP",     value -> oidRegistry.resolve(value),
        "SNOMED_RESOLVE", value -> snomedService.toCode(value),
        "NULL_SAFE",      value -> value == null ? "" : value
    );

    public Object apply(String rawValue, List<TransformRule> transforms) {
        Object current = rawValue;
        for (TransformRule t : transforms) {
            FieldTransform fn = registry.get(t.getName());
            if (fn != null) current = fn.apply(current, t.getParams());
        }
        return current;
    }
}

// DateNormalizer.java — detects ANY date format
public class DateNormalizer {
    private static final List<DateTimeFormatter> FORMATS = List.of(
        DateTimeFormatter.ofPattern("dd/MM/yyyy"),
        DateTimeFormatter.ofPattern("dd-MM-yyyy"),
        DateTimeFormatter.ofPattern("yyyyMMdd"),
        DateTimeFormatter.ofPattern("yyyy.MM.dd"),
        DateTimeFormatter.ofPattern("MM/dd/yyyy"),
        DateTimeFormatter.ISO_LOCAL_DATE
    );

    public static String detect(String value) {
        for (DateTimeFormatter fmt : FORMATS) {
            try { return LocalDate.parse(value, fmt).toString(); }
            catch (Exception ignored) {}
        }
        throw new TransformException("Unparseable date: " + value);
    }
}`;

const DB_SCHEMA = `-- mapping_profiles: YAML configs per source system
CREATE TABLE mapping_profiles (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_system VARCHAR(100)   NOT NULL,
    profile_id    VARCHAR(200)   NOT NULL UNIQUE,
    version       VARCHAR(20)    NOT NULL,
    yaml_config   MEDIUMTEXT     NOT NULL,   -- full YAML stored here
    active        BOOLEAN        DEFAULT TRUE,
    llm_fallback  BOOLEAN        DEFAULT TRUE,
    min_confidence DECIMAL(3,2)  DEFAULT 0.75,
    created_at    DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_system_version (source_system, version),
    INDEX idx_source_active (source_system, active)
) ENGINE=InnoDB;

-- mapping_audit: per-field trace for every conversion
CREATE TABLE mapping_audit (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversion_id  CHAR(36)       NOT NULL,    -- UUID
    source_field   VARCHAR(200),
    fhir_path      VARCHAR(300),
    value_before   TEXT,
    value_after    TEXT,
    transform_chain VARCHAR(500),
    confidence     DECIMAL(4,3),
    llm_used       BOOLEAN        DEFAULT FALSE,
    llm_model      VARCHAR(100),
    mapped_at      DATETIME(3)    DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_conversion (conversion_id),
    INDEX idx_fhir_path (fhir_path),
    INDEX idx_llm_used (llm_used)
) ENGINE=InnoDB;

-- code_translations: cached terminology lookups
CREATE TABLE code_translations (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_system VARCHAR(100),
    source_code  VARCHAR(200)   NOT NULL,
    target_system VARCHAR(200)  NOT NULL,    -- e.g. http://snomed.info/sct
    target_code  VARCHAR(200)   NOT NULL,
    display      VARCHAR(500),
    verified_at  DATETIME,
    UNIQUE KEY uq_translation (source_code, source_system, target_system)
) ENGINE=InnoDB;`;

const TECH_STACK = [
  {
    category: "Core Mapping Engine",
    color: P.gold,
    items: [
      { name: "Spring Boot 3.3", role: "Service container, DI, REST API", why: "Native HAPI FHIR integration, mature ecosystem" },
      { name: "MapStruct 1.6", role: "Compile-time object mapping", why: "Zero-reflection, type-safe field mapping, 10× faster than ModelMapper" },
      { name: "Jackson YAML", role: "YAML profile deserialization", why: "Same ObjectMapper as JSON, streams large profiles efficiently" },
      { name: "Caffeine Cache", role: "In-memory profile cache (L1)", why: "Sub-millisecond profile reads, configurable TTL + eviction" },
    ]
  },
  {
    category: "LLM Integration",
    color: P.violet,
    items: [
      { name: "OpenAI GPT-4o-mini", role: "Field mapping suggestion LLM", why: "Structured JSON output mode, 99% reliable schema adherence, cheap per-call" },
      { name: "Spring WebClient", role: "Non-blocking HTTP to OpenAI API", why: "Reactive, timeout-controlled, retry-able. Never blocks the main thread." },
      { name: "Google Gemini Flash", role: "Fallback LLM option", why: "Lower cost for high-volume, can be swapped via config flag" },
      { name: "Confidence Threshold", role: "Guard: reject low-confidence AI output", why: "LLM suggestions below 0.75 are discarded, not silently accepted" },
    ]
  },
  {
    category: "Terminology & Codes",
    color: P.teal,
    items: [
      { name: "SNOMED CT RF2 Subset", role: "Clinical concept resolution", why: "Bundled subset for common clinical codes — no external dependency" },
      { name: "SNOMED ECL Engine", role: "Expression Constraint Language queries", why: "Hierarchical SNOMED lookups — find all descendants of a concept" },
      { name: "UMLS REST API", role: "Fallback code translation", why: "ICD-10 → SNOMED when local table has no match" },
      { name: "code_translations MySQL", role: "Cached resolved codes", why: "Once resolved, never hits UMLS again. Self-warming per usage." },
    ]
  },
  {
    category: "Persistence & Observability",
    color: P.blue,
    items: [
      { name: "MySQL 8.0", role: "Profile store + audit trail", why: "Hospital environments run MySQL; InnoDB ACID for audit integrity" },
      { name: "Flyway Migrations", role: "Schema versioning", why: "Reproducible deployments, rollback support, CI/CD compatible" },
      { name: "Micrometer + Prometheus", role: "LLM call rate, confidence scores, cache hits", why: "Grafana dashboards show real-time mapper performance" },
      { name: "MDC Logging", role: "Per-conversion trace IDs in logs", why: "Correlate all log lines for a single conversion_id instantly" },
    ]
  },
];

const CONFIDENCE_TIERS = [
  { range: "0.90 – 1.00", label: "Auto-Accept", color: P.green, desc: "Applied immediately. Logged but no human review.", bg: P.greenDim },
  { range: "0.75 – 0.89", label: "Accept + Flag", color: P.gold, desc: "Applied with audit flag. Reviewable in dashboard.", bg: P.goldDim },
  { range: "0.50 – 0.74", label: "Human Review", color: P.orange, desc: "Suggestion shown in UI. Human must confirm before save.", bg: P.orangeDim },
  { range: "0.00 – 0.49", label: "Reject", color: P.red, desc: "Discarded. Field mapped to null. Error raised in OperationOutcome.", bg: "rgba(248,113,113,0.08)" },
];

const FLOW_NODES = [
  { id: "in", label: "Incoming\nPayload", sub: "HL7 / CSV / XML", color: P.textMid, x: 0 },
  { id: "detect", label: "Format\nDetector", sub: "Apache Tika", color: P.teal, x: 1 },
  { id: "profile", label: "YAML Profile\nLoader", sub: "MySQL + Cache", color: P.gold, x: 2 },
  { id: "llm", label: "LLM Gap\nFiller", sub: "GPT-4o-mini", color: P.violet, x: 3 },
  { id: "transform", label: "Transform\nPipeline", sub: "MapStruct", color: P.orange, x: 4 },
  { id: "snomed", label: "SNOMED\nResolver", sub: "ECL Engine", color: P.teal, x: 5 },
  { id: "assemble", label: "FHIR\nAssembler", sub: "HAPI R4", color: P.blue, x: 6 },
  { id: "audit", label: "Audit\nLogger", sub: "MySQL", color: P.green, x: 7 },
];

/* ══════════════════════════════════════════════════════════════
   COMPONENTS
══════════════════════════════════════════════════════════════ */

function Badge({ children, color }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "3px",
      fontSize: "9px",
      fontWeight: 700,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      background: `${color}15`,
      border: `1px solid ${color}35`,
      color: color,
      fontFamily: P.body,
    }}>{children}</span>
  );
}

function CodePanel({ code, lang, color, maxH }) {
  return (
    <div style={{
      background: "#080808",
      border: `1px solid ${P.cardBorder}`,
      borderLeft: `3px solid ${color || P.gold}`,
      borderRadius: "6px",
      overflow: "hidden",
    }}>
      {lang && (
        <div style={{
          padding: "7px 16px",
          background: "#0D0D0D",
          borderBottom: `1px solid ${P.cardBorder}`,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color || P.gold }} />
          <span style={{ fontSize: "10px", letterSpacing: "1.5px", color: P.textMid, fontFamily: P.mono, textTransform: "uppercase" }}>{lang}</span>
        </div>
      )}
      <pre style={{
        margin: 0,
        padding: "20px",
        fontSize: "11.5px",
        color: "#C8C0B0",
        fontFamily: P.mono,
        lineHeight: "1.8",
        overflowX: "auto",
        overflowY: "auto",
        maxHeight: maxH || "none",
        whiteSpace: "pre",
      }}>{code}</pre>
    </div>
  );
}

function SectionHeader({ eyebrow, title, sub, color }) {
  return (
    <div style={{ marginBottom: "40px" }} className="fsu">
      <div style={{ fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: color || P.gold, marginBottom: "10px", fontFamily: P.body }}>{eyebrow}</div>
      <h2 style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 900, fontFamily: P.display, color: P.text, lineHeight: 1.1, marginBottom: "12px" }}>{title}</h2>
      {sub && <p style={{ fontSize: "15px", color: P.textMid, maxWidth: "600px", lineHeight: 1.7, fontFamily: P.body }}>{sub}</p>}
    </div>
  );
}

function Pill({ children, color }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 12px",
      background: P.surface,
      border: `1px solid ${P.cardBorder}`,
      borderRadius: "20px",
      fontSize: "11px",
      color: P.textMid,
      fontFamily: P.mono,
      margin: "3px",
    }}>{children}</span>
  );
}

function FlowDiagram() {
  const [hover, setHover] = useState(null);
  return (
    <div style={{
      background: P.surface,
      border: `1px solid ${P.cardBorder}`,
      borderRadius: "10px",
      padding: "32px 28px",
      overflowX: "auto",
    }}>
      <div style={{ fontSize: "9px", letterSpacing: "3px", color: P.textMid, marginBottom: "24px", fontFamily: P.body, textTransform: "uppercase" }}>
        AI Mapper Internal Pipeline — 8 Stages
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0", minWidth: "900px" }}>
        {FLOW_NODES.map((node, i) => (
          <div key={node.id} style={{ display: "flex", alignItems: "center", flex: i < FLOW_NODES.length - 1 ? "1" : "0 0 auto" }}>
            <div
              onMouseEnter={() => setHover(node.id)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: hover === node.id ? `${node.color}20` : `${node.color}08`,
                border: `1.5px solid ${hover === node.id ? node.color : `${node.color}40`}`,
                borderRadius: "8px",
                padding: "12px 14px",
                textAlign: "center",
                minWidth: "90px",
                cursor: "pointer",
                transition: "all 0.18s ease",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: node.color, fontFamily: P.body, lineHeight: 1.3, whiteSpace: "pre-line" }}>{node.label}</div>
              <div style={{ fontSize: "9px", color: P.textMid, marginTop: "4px", fontFamily: P.mono }}>{node.sub}</div>
            </div>
            {i < FLOW_NODES.length - 1 && (
              <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${node.color}50, ${FLOW_NODES[i+1].color}50)`, position: "relative", minWidth: "16px" }}>
                <div style={{ position: "absolute", right: "-4px", top: "-4px", color: FLOW_NODES[i+1].color, fontSize: "9px" }}>▶</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineStepCard({ step, expanded, onClick }) {
  return (
    <div
      className="step-card hover-lift"
      onClick={onClick}
      style={{
        background: P.card,
        border: `1px solid ${expanded ? step.color : P.cardBorder}`,
        borderLeft: `3px solid ${step.color}`,
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: expanded ? `0 8px 32px ${step.color}15` : "none",
      }}
    >
      <div style={{ padding: "18px 22px", display: "flex", gap: "16px", alignItems: "center" }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "8px",
          background: `${step.color}12`,
          border: `1px solid ${step.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", color: step.color, flexShrink: 0,
        }}>{step.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "3px" }}>
            <span style={{ fontSize: "9px", color: step.color, letterSpacing: "2px", fontFamily: P.mono }}>STEP {step.num}</span>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: P.text, fontFamily: P.body }}>{step.label}</div>
          <div style={{ fontSize: "12px", color: P.textMid, fontFamily: P.body }}>{step.sub}</div>
        </div>
        <div style={{ color: P.textMid, fontSize: "12px", transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${P.cardBorder}`, padding: "20px 22px", background: `${step.color}04` }}>
          <p style={{ fontSize: "13px", color: P.text, lineHeight: 1.7, fontFamily: P.body, marginBottom: "14px" }}>{step.desc}</p>
          <p style={{ fontSize: "12px", color: P.textMid, lineHeight: 1.6, fontFamily: P.mono, marginBottom: "14px", background: P.surface, padding: "10px 14px", borderRadius: "5px", border: `1px solid ${P.cardBorder}` }}>{step.detail}</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {step.tech.map((t, i) => <Badge key={i} color={step.color}>{t}</Badge>)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTIONS
══════════════════════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "100px 60px 60px", position: "relative", overflow: "hidden" }}>
      {/* bg texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(232,197,71,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "15%", right: "8%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,197,71,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "5%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <div className="fsu" style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
          <Badge color={P.teal}>HealthBridge Platform</Badge>
          <Badge color={P.gold}>Step 3 of 6</Badge>
          <Badge color={P.violet}>LLM + YAML Engine</Badge>
        </div>

        <div className="fsu1">
          <h1 style={{ fontFamily: P.display, fontSize: "clamp(44px,7vw,90px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-2px", color: P.text, marginBottom: "24px" }}>
            The <span style={{ color: P.gold }}>AI Mapper</span><br />
            <span style={{ color: P.textMid, fontSize: "0.6em", fontWeight: 700, letterSpacing: "-0.5px" }}>LLM + YAML Profile Engine</span>
          </h1>
          <p style={{ fontSize: "clamp(15px,1.8vw,18px)", color: P.textMid, maxWidth: "600px", lineHeight: 1.75, fontFamily: P.body, marginBottom: "40px" }}>
            The brain of HealthBridge. It takes any messy legacy healthcare format and{" "}
            <strong style={{ color: P.text }}>intelligently maps it</strong> to the right FHIR R4 structure — using YAML profiles for known fields and an LLM to fill the gaps.
          </p>
        </div>

        {/* 4 hero stats */}
        <div className="fsu2" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "60px" }}>
          {[
            { v: "6-stage", l: "mapping pipeline", c: P.gold },
            { v: "< 80ms", l: "avg mapping time", c: P.teal },
            { v: "0.97", l: "avg AI confidence", c: P.violet },
            { v: "100%", l: "field audit trail", c: P.green },
          ].map((s, i) => (
            <div key={i} style={{ background: P.surface, border: `1px solid ${P.cardBorder}`, borderRadius: "8px", padding: "18px", borderTop: `2px solid ${s.c}` }}>
              <div style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 700, color: s.c, fontFamily: P.display, marginBottom: "4px" }}>{s.v}</div>
              <div style={{ fontSize: "12px", color: P.textMid, fontFamily: P.body }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* One-line architecture */}
        <div className="fsu3" style={{ background: P.surface, border: `1px solid ${P.cardBorder}`, borderRadius: "8px", padding: "16px 22px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: P.textMid, fontFamily: P.mono }}>Mapper = </span>
          {["YAML Profile", "+", "LLM Gap Fill", "+", "Transform Chain", "+", "SNOMED Lookup", "+", "HAPI FHIR Build", "+", "Audit Log"].map((t, i) => (
            <span key={i} style={{
              fontFamily: P.mono,
              fontSize: "12px",
              color: t === "+" ? P.textDim : [P.gold, P.violet, P.orange, P.teal, P.blue, P.green][Math.floor(i / 2)] || P.textMid,
              fontWeight: t === "+" ? 400 : 600,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineSection() {
  const [expanded, setExpanded] = useState("detect");

  return (
    <section style={{ padding: "80px 60px", borderTop: `1px solid ${P.cardBorder}` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader
          eyebrow="Internal Architecture"
          title="6-Stage Mapping Pipeline"
          sub="Each stage is independently testable, configurable, and observable. The pipeline is a Spring @Service chain — not a black box."
          color={P.gold}
        />
        <div className="fsu1" style={{ marginBottom: "36px" }}>
          <FlowDiagram />
        </div>
        <div className="fsu2" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {PIPELINE_STEPS.map(step => (
            <PipelineStepCard
              key={step.id}
              step={step}
              expanded={expanded === step.id}
              onClick={() => setExpanded(expanded === step.id ? null : step.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function YAMLSection() {
  const [activeTab, setActiveTab] = useState("yaml");

  return (
    <section style={{ padding: "80px 60px", borderTop: `1px solid ${P.cardBorder}`, background: P.surface }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader
          eyebrow="Configuration System"
          title="YAML Mapping Profiles"
          sub="Zero-code onboarding. Every source system gets its own YAML file. Update a file, hit the hot-reload endpoint, done. No deployment needed."
          color={P.gold}
        />

        <div className="fsu1" style={{ display: "flex", gap: "4px", marginBottom: "24px", background: P.card, padding: "4px", borderRadius: "8px", width: "fit-content" }}>
          {[
            { id: "yaml", label: "YAML Profile" },
            { id: "java", label: "Java Service" },
            { id: "transform", label: "Transform Code" },
            { id: "db", label: "MySQL Schema" },
          ].map(tab => (
            <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
              background: activeTab === tab.id ? P.goldMid : "transparent",
              border: `1px solid ${activeTab === tab.id ? P.gold : "transparent"}`,
              borderRadius: "6px",
              padding: "8px 16px",
              color: activeTab === tab.id ? P.gold : P.textMid,
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: P.mono,
              letterSpacing: "0.5px",
              opacity: activeTab === tab.id ? 1 : 0.6,
            }}>{tab.label}</button>
          ))}
        </div>

        <div className="fsu2">
          {activeTab === "yaml" && <CodePanel code={YAML_EXAMPLE} lang="mapping_profiles/hl7_adt_v2_coverage.yaml" color={P.gold} maxH="520px" />}
          {activeTab === "java" && <CodePanel code={JAVA_SERVICE} lang="AIMappingService.java — Spring Boot Service" color={P.violet} maxH="520px" />}
          {activeTab === "transform" && <CodePanel code={TRANSFORM_CODE} lang="TransformPipeline.java + DateNormalizer.java" color={P.orange} maxH="520px" />}
          {activeTab === "db" && <CodePanel code={DB_SCHEMA} lang="V2__mapping_tables.sql — Flyway Migration" color={P.blue} maxH="520px" />}
        </div>

        {/* Hot-reload callout */}
        <div className="fsu3" style={{ marginTop: "24px", background: P.goldDim, border: `1px solid ${P.goldBright}`, borderRadius: "8px", padding: "16px 20px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "20px" }}>⚡</span>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: P.gold, marginBottom: "4px", fontFamily: P.body, letterSpacing: "1px" }}>HOT-RELOAD — ZERO DOWNTIME</div>
            <code style={{ fontSize: "12px", color: P.text, fontFamily: P.mono }}>
              PUT /api/v1/mappings/{"{"}{"{sourceSystem}"}{"}"} — Sends new YAML → evicts Caffeine cache → next request loads fresh profile. No restart. Production-safe.
            </code>
          </div>
        </div>
      </div>
    </section>
  );
}

function LLMSection() {
  const [step, setStep] = useState(0);
  const llmSteps = [
    { label: "Unknown field arrives", desc: "Field 'pat_dob_str' not in YAML profile. LLM fallback triggered." },
    { label: "Prompt constructed", desc: "Field name + sample values + FHIR schema sent to GPT-4o-mini." },
    { label: "LLM responds", desc: "Structured JSON response: fhir_path, transform, confidence: 0.97." },
    { label: "Confidence check", desc: "0.97 ≥ 0.75 threshold → suggestion accepted, YAML rule created." },
    { label: "Audit logged", desc: "llm_used=true, model='gpt-4o-mini', confidence=0.97 recorded." },
  ];

  return (
    <section style={{ padding: "80px 60px", borderTop: `1px solid ${P.cardBorder}` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader
          eyebrow="AI Gap Filling"
          title="How the LLM Suggester Works"
          sub="The LLM is NOT mapping your whole document. It's called precisely for fields the YAML profile doesn't know — a targeted, cheap, auditable AI call."
          color={P.violet}
        />

        {/* Step progress */}
        <div className="fsu1" style={{ display: "flex", gap: "0", marginBottom: "32px", overflowX: "auto" }}>
          {llmSteps.map((s, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ display: "flex", alignItems: "center", flexShrink: 0, cursor: "pointer" }}>
              <div style={{
                background: step === i ? P.violetDim : P.surface,
                border: `1.5px solid ${step === i ? P.violet : P.cardBorder}`,
                borderRadius: "8px",
                padding: "10px 16px",
                minWidth: "150px",
                textAlign: "center",
                transition: "all 0.18s",
              }}>
                <div style={{ fontSize: "9px", color: P.violet, letterSpacing: "2px", fontFamily: P.mono, marginBottom: "4px" }}>STEP {i + 1}</div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: step === i ? P.text : P.textMid, fontFamily: P.body }}>{s.label}</div>
              </div>
              {i < llmSteps.length - 1 && (
                <div style={{ width: "24px", height: "1px", background: `${P.violet}30`, position: "relative", flexShrink: 0 }}>
                  <span style={{ position: "absolute", right: "-4px", top: "-5px", color: P.violet, fontSize: "10px" }}>›</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step description */}
        <div className="fsu2" style={{ background: P.violetDim, border: `1px solid ${P.violet}35`, borderRadius: "8px", padding: "14px 20px", marginBottom: "28px" }}>
          <span style={{ fontSize: "13px", color: P.text, fontFamily: P.body }}>{llmSteps[step].desc}</span>
        </div>

        {/* Prompt + Response side by side */}
        <div className="fsu3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "36px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: P.violet, marginBottom: "10px", fontFamily: P.body, fontWeight: 700 }}>→ PROMPT SENT TO GPT-4o-mini</div>
            <CodePanel code={LLM_PROMPT} lang="prompt.txt" color={P.violet} maxH="380px" />
          </div>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: P.green, marginBottom: "10px", fontFamily: P.body, fontWeight: 700 }}>← STRUCTURED JSON RESPONSE</div>
            <CodePanel code={LLM_RESPONSE} lang="response.json" color={P.green} maxH="380px" />
          </div>
        </div>

        {/* Confidence tiers */}
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "3px", color: P.textMid, marginBottom: "16px", fontFamily: P.body, textTransform: "uppercase" }}>Confidence Score → Action Matrix</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
            {CONFIDENCE_TIERS.map((tier, i) => (
              <div key={i} style={{ background: tier.bg, border: `1px solid ${tier.color}35`, borderRadius: "8px", padding: "16px" }}>
                <div style={{ fontSize: "16px", fontWeight: 900, color: tier.color, fontFamily: P.display, marginBottom: "4px" }}>{tier.range}</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: tier.color, marginBottom: "8px", fontFamily: P.body }}>{tier.label}</div>
                <div style={{ fontSize: "11px", color: P.textMid, lineHeight: 1.5, fontFamily: P.body }}>{tier.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TechStackSection() {
  return (
    <section style={{ padding: "80px 60px", borderTop: `1px solid ${P.cardBorder}`, background: P.surface }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader
          eyebrow="Complete Tech Stack"
          title="Every Tool, Every Reason"
          sub="No cargo-culting. Each technology is here for a specific, defensible reason you can explain to a CTO or hackathon jury."
          color={P.teal}
        />
        <div className="fsu1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {TECH_STACK.map((group, gi) => (
            <div key={gi} style={{
              background: P.card,
              border: `1px solid ${P.cardBorder}`,
              borderTop: `2px solid ${group.color}`,
              borderRadius: "10px",
              overflow: "hidden",
            }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${P.cardBorder}`, background: `${group.color}06` }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: group.color, letterSpacing: "2px", fontFamily: P.body, textTransform: "uppercase" }}>{group.category}</span>
              </div>
              {group.items.map((item, ii) => (
                <div key={ii} style={{
                  padding: "12px 20px",
                  borderBottom: ii < group.items.length - 1 ? `1px solid ${P.cardBorder}` : "none",
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "12px",
                  alignItems: "start",
                }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: P.text, fontFamily: P.mono, marginBottom: "2px" }}>{item.name}</div>
                    <div style={{ fontSize: "10px", color: P.textMid, fontFamily: P.body }}>{item.role}</div>
                  </div>
                  <div style={{ fontSize: "11px", color: P.textMid, lineHeight: 1.5, fontFamily: P.body, background: P.surface, padding: "6px 10px", borderRadius: "4px", borderLeft: `2px solid ${group.color}40` }}>
                    {item.why}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SnomedSection() {
  return (
    <section style={{ padding: "80px 60px", borderTop: `1px solid ${P.cardBorder}` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader
          eyebrow="Terminology Engine"
          title="SNOMED CT Resolution Layer"
          sub="Clinical codes can't be guessed. SNOMED CT is embedded as a bundled RF2 subset for common codes, with UMLS API fallback for the long tail."
          color={P.teal}
        />
        <div className="fsu1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* How it works */}
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: P.teal, marginBottom: "14px", fontFamily: P.body, fontWeight: 700 }}>RESOLUTION FLOW</div>
            {[
              { step: "1", label: "Check code_translations MySQL table", sub: "Sub-millisecond. Most codes are already resolved from past use.", color: P.green },
              { step: "2", label: "Query embedded SNOMED RF2 subset", sub: "4MB bundled JAR. Common clinical + insurance codes. No network call.", color: P.teal },
              { step: "3", label: "SNOMED ECL Engine lookup", sub: "Expression Constraint Language — find parent/child concept hierarchy.", color: P.gold },
              { step: "4", label: "UMLS REST API fallback", sub: "Only for completely unknown codes. Result cached back to MySQL.", color: P.orange },
              { step: "✕", label: "No match → OperationOutcome WARNING", sub: "Never silently pass unknown codes. Explicit failure with fix hint.", color: P.red },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${P.cardBorder}` : "none", alignItems: "flex-start" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: `${item.color}15`, border: `1px solid ${item.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: item.color, flexShrink: 0, fontFamily: P.mono }}>{item.step}</div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: P.text, fontFamily: P.body, marginBottom: "2px" }}>{item.label}</div>
                  <div style={{ fontSize: "11px", color: P.textMid, fontFamily: P.body }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Example mappings */}
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: P.teal, marginBottom: "14px", fontFamily: P.body, fontWeight: 700 }}>EXAMPLE SNOMED MAPPINGS</div>
            {[
              { src: "I (Inpatient)", snomed: "11429006", display: "Inpatient admission", sys: "encounter_class" },
              { src: "O (Outpatient)", snomed: "185387006", display: "New patient consultation", sys: "encounter_class" },
              { src: "E (Emergency)", snomed: "50849002", display: "Emergency room admission", sys: "encounter_class" },
              { src: "SURG (Surgery)", snomed: "71388002", display: "Procedure", sys: "procedure_type" },
              { src: "DIA_T2DM", snomed: "44054006", display: "Type 2 diabetes mellitus", sys: "diagnosis_code" },
              { src: "CARD_CONSULT", snomed: "308335008", display: "Patient encounter", sys: "encounter_type" },
            ].map((row, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                padding: "8px 12px",
                background: i % 2 === 0 ? P.surface : "transparent",
                borderRadius: "4px",
                marginBottom: "4px",
              }}>
                <div>
                  <div style={{ fontSize: "10px", color: P.textDim, fontFamily: P.mono }}>{row.sys}</div>
                  <div style={{ fontSize: "12px", color: P.text, fontFamily: P.mono, fontWeight: 600 }}>{row.src}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: P.teal, fontFamily: P.mono }}>{row.snomed}</div>
                  <div style={{ fontSize: "11px", color: P.textMid, fontFamily: P.body }}>{row.display}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AuditSection() {
  return (
    <section style={{ padding: "80px 60px", borderTop: `1px solid ${P.cardBorder}`, background: P.surface }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader
          eyebrow="Observability"
          title="Full Mapping Audit Trail"
          sub="Every single field mapped — source path, target FHIR path, transform applied, confidence score, whether AI was used — logged to MySQL. Nothing is a black box."
          color={P.green}
        />

        {/* Mock audit table */}
        <div className="fsu1" style={{ background: "#080808", border: `1px solid ${P.cardBorder}`, borderRadius: "8px", overflow: "hidden", marginBottom: "28px" }}>
          <div style={{ padding: "10px 20px", background: P.card, borderBottom: `1px solid ${P.cardBorder}`, display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1.2fr 1fr 1fr", gap: "12px" }}>
            {["source_field", "fhir_path", "transform_chain", "value_after", "confidence", "llm_used"].map((h, i) => (
              <div key={i} style={{ fontSize: "9px", letterSpacing: "1.5px", color: P.textMid, fontFamily: P.mono, textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {[
            { sf: "PID.5.1", fp: "Patient.name[0].family", tc: "TRIM", va: "Sharma", conf: "1.00", llm: false },
            { sf: "PID.7", fp: "Patient.birthDate", tc: "DATE_YYYYMMDD", va: "1990-04-15", conf: "1.00", llm: false },
            { sf: "PID.8", fp: "Patient.gender", tc: "CODE_MAP", va: "female", conf: "1.00", llm: false },
            { sf: "pat_dob_str", fp: "Patient.birthDate", tc: "DATE_NORMALIZE", va: "1985-11-22", conf: "0.97", llm: true },
            { sf: "IN1.4", fp: "Coverage.payor[0]", tc: "OID_LOOKUP", va: "PMJAY-ORG-001", conf: "1.00", llm: false },
            { sf: "insurance_type", fp: "Coverage.type", tc: "CODE_MAP", va: "GOVERNMENT", conf: "0.82", llm: true },
          ].map((row, i) => (
            <div key={i} style={{
              padding: "9px 20px",
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1.5fr 1.2fr 1fr 1fr",
              gap: "12px",
              borderBottom: i < 5 ? `1px solid ${P.cardBorder}` : "none",
              alignItems: "center",
              background: row.llm ? `${P.violet}05` : "transparent",
            }}>
              <div style={{ fontSize: "11px", color: P.gold, fontFamily: P.mono }}>{row.sf}</div>
              <div style={{ fontSize: "10px", color: P.teal, fontFamily: P.mono }}>{row.fp}</div>
              <div style={{ fontSize: "10px", color: P.orange, fontFamily: P.mono }}>{row.tc}</div>
              <div style={{ fontSize: "11px", color: P.text, fontFamily: P.mono }}>{row.va}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: parseFloat(row.conf) >= 0.95 ? P.green : parseFloat(row.conf) >= 0.75 ? P.gold : P.red, fontFamily: P.mono }}>{row.conf}</div>
              <div>
                {row.llm
                  ? <Badge color={P.violet}>AI</Badge>
                  : <Badge color={P.textMid}>YAML</Badge>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Why audit matters */}
        <div className="fsu2" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
          {[
            { icon: "🔍", title: "Debug Any Rejection", desc: "When NRCeS rejects a bundle, trace exactly which field was wrong, what value was set, and which transform produced it.", color: P.green },
            { icon: "📊", title: "AI Usage Analytics", desc: "Know exactly how often LLM fills gaps per source system. High LLM use = missing YAML rules to add.", color: P.violet },
            { icon: "🏥", title: "Hospital Benchmarks", desc: "Compare mapping quality across hospitals. Low confidence patterns reveal systemic data quality issues.", color: P.teal },
          ].map((c, i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${P.cardBorder}`, borderLeft: `3px solid ${c.color}`, borderRadius: "8px", padding: "18px" }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>{c.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: c.color, marginBottom: "6px", fontFamily: P.body }}>{c.title}</div>
              <div style={{ fontSize: "12px", color: P.textMid, lineHeight: 1.6, fontFamily: P.body }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SummarySection() {
  return (
    <section style={{ padding: "80px 60px", borderTop: `1px solid ${P.cardBorder}` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <SectionHeader eyebrow="Summary" title="What Makes This Mapper Win" color={P.gold} />

        <div className="fsu1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "40px" }}>
          {[
            { icon: "⚡", t: "Surgical AI Use", d: "LLM called only for truly unknown fields. Not a chatbot. Not full-document AI. Targeted, cheap, fast.", c: P.gold },
            { icon: "⇄", t: "Zero Code Onboarding", d: "New hospital HMIS? Add a YAML file. Hot-reload. Done. No engineer needed.", c: P.teal },
            { icon: "🔒", t: "Nothing is a Black Box", d: "Every field mapped has a source, a transform, a confidence score, and an audit row.", c: P.green },
            { icon: "📐", t: "Composable Transforms", d: "8 built-in transforms compose like LEGO. Add new ones without touching existing code.", c: P.orange },
            { icon: "🧬", t: "SNOMED is Embedded", d: "Clinical codes resolved locally from RF2 subset. No network dependency for 95% of cases.", c: P.violet },
            { icon: "🔄", t: "Bi-directional", d: "FHIR → Legacy works too. ClaimResponse back to HL7 DFT. The half every other team misses.", c: P.blue },
          ].map((c, i) => (
            <div key={i} className="hover-lift" style={{ background: P.card, border: `1px solid ${P.cardBorder}`, borderTop: `2px solid ${c.c}`, borderRadius: "8px", padding: "20px" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{c.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: c.c, marginBottom: "6px", fontFamily: P.body }}>{c.t}</div>
              <div style={{ fontSize: "12px", color: P.textMid, lineHeight: 1.6, fontFamily: P.body }}>{c.d}</div>
            </div>
          ))}
        </div>

        {/* Final stack strip */}
        <div style={{
          background: P.goldDim,
          border: `1px solid ${P.goldBright}`,
          borderRadius: "10px",
          padding: "28px 36px",
          textAlign: "center",
        }} className="fsu2">
          <div style={{ fontSize: "12px", letterSpacing: "3px", color: P.gold, marginBottom: "14px", fontFamily: P.body, textTransform: "uppercase" }}>Complete Mapper Tech Stack</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
            {["Spring Boot 3.3", "Java 17", "MapStruct 1.6", "Jackson YAML", "HAPI FHIR R4 7.x", "OpenAI GPT-4o-mini", "Spring WebClient", "SNOMED CT RF2", "SNOMED ECL Engine", "UMLS REST API", "MySQL 8.0", "Caffeine Cache", "Flyway", "Micrometer + Prometheus", "Docker"].map((t, i) => (
              <Pill key={i}>{t}</Pill>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── NAV ───────────────────────────────────────────────────────── */
function Nav() {
  const sections = [
    { label: "Overview", id: "hero" },
    { label: "Pipeline", id: "pipeline" },
    { label: "YAML Config", id: "yaml" },
    { label: "LLM Logic", id: "llm" },
    { label: "Tech Stack", id: "tech" },
    { label: "SNOMED", id: "snomed" },
    { label: "Audit", id: "audit" },
    { label: "Summary", id: "summary" },
  ];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      background: "rgba(10,10,10,0.93)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${P.cardBorder}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", height: "56px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: P.gold }} className="glow-pulse" />
        <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: P.mono, color: P.gold }}>AI Mapper</span>
        <span style={{ fontSize: "11px", color: P.textMid, fontFamily: P.mono }}>Step 03 — LLM + YAML Engine</span>
      </div>
      <div style={{ display: "flex", gap: "2px" }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })} style={{
            background: "none", border: "none",
            color: P.textMid, fontSize: "11px", padding: "6px 12px",
            cursor: "pointer", fontFamily: P.body, borderRadius: "5px",
            transition: "color 0.15s",
          }} className="tab-btn">{s.label}</button>
        ))}
      </div>
    </nav>
  );
}

/* ── ROOT ──────────────────────────────────────────────────────── */
export default function App() {
  useEffect(() => { injectFonts(); }, []);

  return (
    <div style={{ background: P.bg, minHeight: "100vh", color: P.text, fontFamily: P.body }}>
      <Nav />
      <div style={{ paddingTop: "56px" }}>
        <div id="hero"><HeroSection /></div>
        <div id="pipeline"><PipelineSection /></div>
        <div id="yaml"><YAMLSection /></div>
        <div id="llm"><LLMSection /></div>
        <div id="tech"><TechStackSection /></div>
        <div id="snomed"><SnomedSection /></div>
        <div id="audit"><AuditSection /></div>
        <div id="summary"><SummarySection /></div>
      </div>
      <footer style={{
        borderTop: `1px solid ${P.cardBorder}`,
        padding: "20px 60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: P.surface,
      }}>
        <span style={{ fontSize: "11px", color: P.textMid, fontFamily: P.mono }}>HealthBridge · AI Mapper · Step 3/6 · Spring Boot + MySQL + HAPI FHIR + GPT-4o-mini</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge color={P.gold}>Apache 2.0</Badge>
          <Badge color={P.teal}>NRCeS Compliant</Badge>
        </div>
      </footer>
    </div>
  );
}