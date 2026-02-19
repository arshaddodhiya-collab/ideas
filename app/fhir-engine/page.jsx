"use client"

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   NHCX–FHIR CONVERTER SERVICE
   Tech Stack: Spring Boot · MySQL · Java 17 · HAPI FHIR
   Design: Blueprint / Engineering Schematic aesthetic
   ─ White on deep navy, graph-paper grid, technical annotation style
═══════════════════════════════════════════════════════════════ */

const C = {
  navy: "#050E1F",
  navyMid: "#0A1628",
  navyLight: "#0F1F3D",
  grid: "rgba(30,80,160,0.12)",
  border: "#1A3560",
  borderBright: "#2A5090",
  blue: "#4A9EFF",
  blueGlow: "rgba(74,158,255,0.15)",
  cyan: "#00E5D4",
  cyanGlow: "rgba(0,229,212,0.12)",
  green: "#39FF84",
  greenGlow: "rgba(57,255,132,0.12)",
  amber: "#FFD166",
  amberGlow: "rgba(255,209,102,0.12)",
  red: "#FF6B8A",
  white: "#E8F4FF",
  dim: "#4A6FA8",
  dimmer: "#2A4070",
  tag: "#0D1F42",
};

const gridBg = `
  linear-gradient(${C.grid} 1px, transparent 1px),
  linear-gradient(90deg, ${C.grid} 1px, transparent 1px)
`;

/* ── DATA ─────────────────────────────────────────────────────── */

const modules = [
  {
    id: "ingestion",
    code: "MOD-01",
    name: "Ingestion Layer",
    color: C.blue,
    icon: "⬇",
    desc: "Multi-protocol input gateway accepting HL7 v2.x, CSV, XML and REST payloads from any HMIS source.",
    springComponents: [
      { type: "Controller", name: "IngestionController", file: "IngestionController.java", desc: "REST endpoints: /ingest/hl7, /ingest/csv, /ingest/xml, /ingest/json" },
      { type: "Service", name: "HL7ParserService", file: "HL7ParserService.java", desc: "HAPI HL7 v2 parser — reads PID, IN1, DFT segments into domain objects" },
      { type: "Service", name: "FlatFileParserService", file: "FlatFileParserService.java", desc: "OpenCSV + JAXB XML binding with configurable column mapping" },
      { type: "Entity", name: "RawMessage", file: "RawMessage.java", desc: "JPA entity persisting raw payload, source_system, received_at, status" },
      { type: "Repository", name: "RawMessageRepository", file: "RawMessageRepository.java", desc: "Spring Data JPA — findByStatusAndSourceSystem, findByConversionId" },
    ],
    mysql: ["raw_messages (id, source_system, message_type, payload LONGTEXT, received_at, status, retry_count)"],
    deps: ["hapi-hl7v2-base:2.5.1", "opencsv:5.9", "spring-boot-starter-web"],
    endpoints: [
      { method: "POST", path: "/api/v1/ingest/hl7", desc: "HL7 v2.x MLLP or HTTP payload" },
      { method: "POST", path: "/api/v1/ingest/csv", desc: "Multipart CSV upload with mapping profile ID" },
      { method: "POST", path: "/api/v1/ingest/xml", desc: "Legacy XML document (HL7 CDA / proprietary)" },
      { method: "POST", path: "/api/v1/ingest/json", desc: "JSON DB export / REST API response" },
    ],
  },
  {
    id: "mapping",
    code: "MOD-02",
    name: "Mapping Engine",
    color: C.cyan,
    icon: "⇄",
    desc: "Config-driven field mapper with SNOMED CT lookup, ICD-10 translation, and hot-reloadable YAML profiles.",
    springComponents: [
      { type: "Service", name: "MappingEngineService", file: "MappingEngineService.java", desc: "Loads YAML profiles, applies field-path mappings, resolves terminology codes" },
      { type: "Service", name: "SnomedLookupService", file: "SnomedLookupService.java", desc: "SNOMED CT ECL queries via embedded H2 concept index + UMLS REST fallback" },
      { type: "Service", name: "TerminologyService", file: "TerminologyService.java", desc: "ICD-10 → SNOMED translation, LOINC lookup, local value-set resolution" },
      { type: "Entity", name: "MappingProfile", file: "MappingProfile.java", desc: "JPA entity: profile_id, source_system, version, yaml_config TEXT, active" },
      { type: "Entity", name: "CodeTranslation", file: "CodeTranslation.java", desc: "Cached code mappings: source_system, source_code, target_system, target_code" },
      { type: "Repository", name: "MappingProfileRepository", file: "MappingProfileRepository.java", desc: "findBySourceSystemAndActiveTrue, findLatestVersion" },
    ],
    mysql: [
      "mapping_profiles (id, source_system, profile_name, version, yaml_config MEDIUMTEXT, active, created_at, updated_at)",
      "code_translations (id, source_system, source_code, target_system, target_code, display, verified_at)",
      "snomed_concepts (concept_id, fsn, preferred_term, hierarchy_code, active) — read-only RF2 subset",
    ],
    deps: ["snomed-owl-toolkit:3.1.0", "jackson-dataformat-yaml:2.16", "spring-cache + Caffeine"],
    endpoints: [
      { method: "GET", path: "/api/v1/mappings/{sourceSystem}", desc: "Retrieve active mapping profile" },
      { method: "PUT", path: "/api/v1/mappings/{sourceSystem}", desc: "Hot-reload YAML mapping (no restart)" },
      { method: "GET", path: "/api/v1/terminology/translate", desc: "Translate source code to target system" },
    ],
  },
  {
    id: "fhir",
    code: "MOD-03",
    name: "FHIR Builder",
    color: C.green,
    icon: "◈",
    desc: "HAPI FHIR R4 resource factories producing NRCeS-profile-compliant CoverageEligibility, Claim, and Communication bundles.",
    springComponents: [
      { type: "Service", name: "FHIRBundleService", file: "FHIRBundleService.java", desc: "Orchestrates resource factories → assembles transaction Bundle with correct entry.request" },
      { type: "Service", name: "CoverageEligibilityBuilder", file: "CoverageEligibilityBuilder.java", desc: "Builds Patient + Coverage + CoverageEligibilityRequest resources from mapped domain object" },
      { type: "Service", name: "ClaimBuilder", file: "ClaimBuilder.java", desc: "Builds Patient + Encounter + Condition + Procedure + Claim + SupportingInfo resources" },
      { type: "Service", name: "CommunicationBuilder", file: "CommunicationBuilder.java", desc: "Builds Communication + CommunicationRequest + DocumentReference resources" },
      { type: "Entity", name: "FhirBundle", file: "FhirBundle.java", desc: "Persists serialized bundle JSON, bundle_type, profile_url, status, linked raw_message_id" },
      { type: "Repository", name: "FhirBundleRepository", file: "FhirBundleRepository.java", desc: "findByConversionId, findByBundleTypeAndStatus, countByCreatedAtBetween" },
    ],
    mysql: [
      "fhir_bundles (id, conversion_id UUID, bundle_type, bundle_json LONGTEXT, profile_url, validation_status, raw_message_id FK, created_at)",
      "fhir_resources (id, bundle_id FK, resource_type, resource_id, resource_json MEDIUMTEXT)",
    ],
    deps: ["hapi-fhir-structures-r4:7.2.1", "hapi-fhir-base:7.2.1", "org.hl7.fhir.r4"],
    endpoints: [
      { method: "POST", path: "/api/v1/convert/coverage-eligibility", desc: "→ HCXCoverageEligibilityRequest bundle" },
      { method: "POST", path: "/api/v1/convert/claim", desc: "→ HCXClaim bundle (includes pre-auth)" },
      { method: "POST", path: "/api/v1/convert/communication", desc: "→ HCXCommunication bundle" },
      { method: "GET", path: "/api/v1/bundles/{conversionId}", desc: "Retrieve generated FHIR bundle by ID" },
    ],
  },
  {
    id: "validation",
    code: "MOD-04",
    name: "Validation & Dispatch",
    color: C.amber,
    icon: "✓",
    desc: "NRCeS StructureDefinition validator with OperationOutcome reporting and HCX gateway dispatch with retry.",
    springComponents: [
      { type: "Service", name: "NRCeSValidatorService", file: "NRCeSValidatorService.java", desc: "HAPI FHIR Validator + NRCeS IG snapshots. Returns scored OperationOutcome with fix hints" },
      { type: "Service", name: "HCXGatewayClient", file: "HCXGatewayClient.java", desc: "Spring WebClient — signs JWE payload, POSTs to HCX sandbox/production, handles 202/4xx/5xx" },
      { type: "Service", name: "RetryService", file: "RetryService.java", desc: "Spring @Scheduled + Spring Retry — exponential backoff, dead-letter queue after 3 attempts" },
      { type: "Entity", name: "ValidationResult", file: "ValidationResult.java", desc: "Stores severity, issue_code, diagnostics, location, fix_hint per bundle" },
      { type: "Entity", name: "DispatchLog", file: "DispatchLog.java", desc: "HCX submission log: correlation_id, http_status, response_body, dispatched_at, attempt_no" },
    ],
    mysql: [
      "validation_results (id, bundle_id FK, severity, issue_code, diagnostics TEXT, location, fix_hint, validated_at)",
      "dispatch_log (id, bundle_id FK, hcx_correlation_id, http_status, response_body TEXT, attempt_no, dispatched_at, success)",
    ],
    deps: ["hapi-fhir-validation-resources-r4:7.2.1", "spring-boot-starter-webflux", "spring-retry:2.0.5"],
    endpoints: [
      { method: "POST", path: "/api/v1/validate", desc: "Validate FHIR bundle against NRCeS profiles" },
      { method: "POST", path: "/api/v1/dispatch/{bundleId}", desc: "Submit validated bundle to HCX gateway" },
      { method: "GET", path: "/api/v1/dispatch/{bundleId}/status", desc: "Poll dispatch + HCX acknowledgement status" },
    ],
  },
];

const dbTables = [
  { name: "raw_messages", engine: "InnoDB", rows: "Primary ingestion log", key: "id, source_system, status", color: C.blue },
  { name: "mapping_profiles", engine: "InnoDB", rows: "YAML config store", key: "source_system, version, active", color: C.cyan },
  { name: "code_translations", engine: "InnoDB", rows: "Terminology cache", key: "source_code + source_system", color: C.cyan },
  { name: "snomed_concepts", engine: "InnoDB", rows: "RF2 subset (read-only)", key: "concept_id, hierarchy_code", color: C.green },
  { name: "fhir_bundles", engine: "InnoDB", rows: "Generated bundles", key: "conversion_id (UUID)", color: C.green },
  { name: "fhir_resources", engine: "InnoDB", rows: "Individual resources", key: "bundle_id FK, resource_type", color: C.green },
  { name: "validation_results", engine: "InnoDB", rows: "NRCeS issue log", key: "bundle_id FK, severity", color: C.amber },
  { name: "dispatch_log", engine: "InnoDB", rows: "HCX submission audit", key: "hcx_correlation_id, success", color: C.amber },
];

const pom = `<dependencies>
  <!-- Spring Boot Core -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
  </dependency>

  <!-- MySQL -->
  <dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
  </dependency>

  <!-- HAPI FHIR R4 -->
  <dependency>
    <groupId>ca.uhn.hapi.fhir</groupId>
    <artifactId>hapi-fhir-structures-r4</artifactId>
    <version>7.2.1</version>
  </dependency>
  <dependency>
    <groupId>ca.uhn.hapi.fhir</groupId>
    <artifactId>hapi-fhir-validation-resources-r4</artifactId>
    <version>7.2.1</version>
  </dependency>

  <!-- HL7 v2.x Parser -->
  <dependency>
    <groupId>ca.uhn.hapi</groupId>
    <artifactId>hapi-hl7v2-base</artifactId>
    <version>2.5.1</version>
  </dependency>

  <!-- YAML Mapping Config -->
  <dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-yaml</artifactId>
  </dependency>

  <!-- CSV Parsing -->
  <dependency>
    <groupId>com.opencsv</groupId>
    <artifactId>opencsv</artifactId>
    <version>5.9</version>
  </dependency>

  <!-- Cache -->
  <dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
  </dependency>

  <!-- Observability -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
  </dependency>
  <dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
  </dependency>

  <!-- Lombok + MapStruct -->
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
  </dependency>
  <dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.6.0</version>
  </dependency>
</dependencies>`;

const appYml = `# application.yml
spring:
  application:
    name: nhcx-fhir-converter

  datasource:
    url: jdbc:mysql://localhost:3306/nhcx_fhir_db
    username: \${DB_USER:nhcx_user}
    password: \${DB_PASS}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5

  jpa:
    hibernate:
      ddl-auto: validate      # Flyway manages schema
    show-sql: false
    properties:
      hibernate.dialect: org.hibernate.dialect.MySQL8Dialect

  flyway:
    enabled: true
    locations: classpath:db/migration

  cache:
    type: caffeine
    caffeine.spec: maximumSize=5000,expireAfterWrite=24h

server:
  port: 8080

nhcx:
  hcx:
    gateway-url: \${HCX_GATEWAY_URL:https://staging.hcxprotocol.io}
    sender-code: \${HCX_SENDER_CODE}
    api-key: \${HCX_API_KEY}
    retry-max-attempts: 3
    retry-backoff-ms: 2000
  fhir:
    nrces-profile-base: https://nrces.in/ndhm/fhir/r4
    hcx-ig-version: 0.7.1
  mapping:
    profiles-dir: /config/mappings/
    hot-reload: true`;

const sampleCode = `// ClaimBuilder.java — excerpt
@Service
@RequiredArgsConstructor
public class ClaimBuilder {

    private final SnomedLookupService snomedSvc;
    private final MappingEngineService mappingSvc;

    public Bundle buildClaimBundle(MappedClaimData data) {
        Bundle bundle = new Bundle();
        bundle.setType(Bundle.BundleType.COLLECTION);
        bundle.getMeta().addProfile(
            "https://ig.hcxprotocol.io/v0.7/" +
            "StructureDefinition-HCXClaim.html");

        // Patient resource
        Patient patient = buildPatient(data.getPatient());
        bundle.addEntry().setResource(patient)
              .setFullUrl("Patient/" + patient.getId());

        // Condition (ICD-10 → SNOMED)
        Condition condition = new Condition();
        CodeableConcept code = new CodeableConcept();
        code.addCoding()
            .setSystem("http://snomed.info/sct")
            .setCode(snomedSvc.translateIcd10(data.getDiagnosisCode()))
            .setDisplay(snomedSvc.getDisplay(data.getDiagnosisCode()));
        condition.setCode(code);

        // Claim resource
        Claim claim = new Claim();
        claim.setStatus(Claim.ClaimStatus.ACTIVE);
        claim.setUse(Claim.Use.CLAIM);
        claim.setPatient(new Reference("Patient/" + patient.getId()));
        claim.addDiagnosis()
             .setDiagnosis(new Reference("Condition/" + condition.getId()));

        bundle.addEntry().setResource(claim);
        return bundle;
    }
}`;

const projectStructure = [
  { path: "src/main/java/in/gov/abdm/nhcx/", type: "root" },
  { path: "  NhcxFhirConverterApplication.java", type: "main" },
  { path: "  controller/", type: "dir" },
  { path: "    IngestionController.java", type: "file" },
  { path: "    ConversionController.java", type: "file" },
  { path: "    MappingController.java", type: "file" },
  { path: "    ValidationController.java", type: "file" },
  { path: "  service/ingestion/", type: "dir" },
  { path: "    HL7ParserService.java", type: "file" },
  { path: "    FlatFileParserService.java", type: "file" },
  { path: "  service/mapping/", type: "dir" },
  { path: "    MappingEngineService.java", type: "file" },
  { path: "    SnomedLookupService.java", type: "file" },
  { path: "    TerminologyService.java", type: "file" },
  { path: "  service/fhir/", type: "dir" },
  { path: "    FHIRBundleService.java", type: "file" },
  { path: "    CoverageEligibilityBuilder.java", type: "file" },
  { path: "    ClaimBuilder.java", type: "file" },
  { path: "    CommunicationBuilder.java", type: "file" },
  { path: "  service/validation/", type: "dir" },
  { path: "    NRCeSValidatorService.java", type: "file" },
  { path: "    HCXGatewayClient.java", type: "file" },
  { path: "    RetryService.java", type: "file" },
  { path: "  domain/entity/", type: "dir" },
  { path: "    RawMessage.java", type: "file" },
  { path: "    MappingProfile.java", type: "file" },
  { path: "    FhirBundle.java", type: "file" },
  { path: "    ValidationResult.java", type: "file" },
  { path: "    DispatchLog.java", type: "file" },
  { path: "  repository/", type: "dir" },
  { path: "    RawMessageRepository.java", type: "file" },
  { path: "    FhirBundleRepository.java", type: "file" },
  { path: "    MappingProfileRepository.java", type: "file" },
  { path: "  config/", type: "dir" },
  { path: "    FhirConfig.java", type: "file" },
  { path: "    CacheConfig.java", type: "file" },
  { path: "    HCXClientConfig.java", type: "file" },
  { path: "src/main/resources/", type: "dir" },
  { path: "  application.yml", type: "file" },
  { path: "  db/migration/V1__init.sql", type: "file" },
  { path: "  mappings/hl7_adt_coverage.yaml", type: "file" },
  { path: "  mappings/csv_claim.yaml", type: "file" },
  { path: "  nrces-profiles/ (StructureDefinitions)", type: "dir" },
  { path: "Dockerfile", type: "file" },
  { path: "docker-compose.yml", type: "file" },
  { path: "pom.xml", type: "file" },
];

/* ── COMPONENTS ──────────────────────────────────────────────── */

function Tag({ children, color, small }) {
  return (
    <span style={{
      display: "inline-block",
      padding: small ? "1px 7px" : "3px 10px",
      borderRadius: "2px",
      fontSize: small ? "9px" : "10px",
      fontWeight: "700",
      letterSpacing: "1.2px",
      textTransform: "uppercase",
      border: `1px solid ${color || C.dim}60`,
      color: color || C.dim,
      background: `${color || C.dim}12`,
    }}>{children}</span>
  );
}

function SectionLabel({ text, color }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "24px",
    }}>
      <div style={{ width: "3px", height: "18px", background: color || C.blue, flexShrink: 0 }} />
      <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: color || C.blue, fontWeight: "700" }}>{text}</span>
      <div style={{ flex: 1, height: "1px", background: `${color || C.blue}25` }} />
    </div>
  );
}

function CodeBox({ code, lang, color }) {
  return (
    <div style={{
      background: "#020914",
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${color || C.blue}`,
      borderRadius: "4px",
      overflow: "hidden",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    }}>
      {lang && (
        <div style={{
          padding: "6px 14px",
          background: "#050D1E",
          borderBottom: `1px solid ${C.border}`,
          fontSize: "9px",
          letterSpacing: "2px",
          color: C.dim,
          textTransform: "uppercase",
        }}>{lang}</div>
      )}
      <pre style={{
        margin: 0,
        padding: "16px",
        fontSize: "11px",
        color: "#7EB8FF",
        overflowX: "auto",
        lineHeight: "1.75",
        whiteSpace: "pre",
      }}>{code}</pre>
    </div>
  );
}

function ModuleCard({ mod, expanded, onToggle }) {
  return (
    <div style={{
      background: C.navyLight,
      border: `1px solid ${expanded ? mod.color : C.border}`,
      borderLeft: `4px solid ${mod.color}`,
      borderRadius: "6px",
      overflow: "hidden",
      boxShadow: expanded ? `0 0 30px ${mod.color}18` : "none",
      transition: "all 0.25s",
    }}>
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          padding: "18px 24px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div style={{
          width: "36px", height: "36px",
          border: `1px solid ${mod.color}50`,
          borderRadius: "4px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px",
          background: `${mod.color}12`,
          color: mod.color,
          flexShrink: 0,
        }}>{mod.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ fontSize: "9px", color: mod.color, letterSpacing: "2px" }}>{mod.code}</span>
            <Tag color={mod.color} small>Spring Boot Module</Tag>
          </div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: C.white, letterSpacing: "0.3px" }}>{mod.name}</div>
          <div style={{ fontSize: "12px", color: C.dim, marginTop: "2px", lineHeight: "1.4" }}>{mod.desc}</div>
        </div>
        <div style={{ color: C.dim, fontSize: "12px", transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "none" }}>▶</div>
      </div>

      {/* Expanded Body */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "24px" }}>
          {/* Spring Components */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "2.5px", color: C.dim, textTransform: "uppercase", marginBottom: "12px" }}>Spring Components</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {mod.springComponents.map((sc, i) => (
                <div key={i} style={{
                  display: "flex", gap: "14px", alignItems: "flex-start",
                  padding: "10px 14px",
                  background: C.navyMid,
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                }}>
                  <Tag color={{
                    Controller: C.red, Service: C.green,
                    Entity: C.amber, Repository: C.cyan,
                  }[sc.type] || C.dim} small>{sc.type}</Tag>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", color: mod.color, fontFamily: "monospace", marginBottom: "2px" }}>{sc.name}</div>
                    <div style={{ fontSize: "10px", color: C.dim, fontFamily: "monospace" }}>{sc.file}</div>
                    <div style={{ fontSize: "11px", color: "#8AABCC", marginTop: "4px", lineHeight: "1.5" }}>{sc.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* MySQL Tables */}
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "2.5px", color: C.dim, textTransform: "uppercase", marginBottom: "10px" }}>MySQL Tables</div>
              {mod.mysql.map((t, i) => (
                <div key={i} style={{
                  fontSize: "10px", fontFamily: "monospace", color: "#6BC5FF",
                  padding: "6px 10px", background: C.navyMid,
                  border: `1px solid ${C.border}`, borderRadius: "3px",
                  marginBottom: "6px", lineHeight: "1.6",
                }}>{t}</div>
              ))}
            </div>
            {/* Endpoints */}
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "2.5px", color: C.dim, textTransform: "uppercase", marginBottom: "10px" }}>REST Endpoints</div>
              {mod.endpoints.map((ep, i) => (
                <div key={i} style={{
                  display: "flex", gap: "8px", alignItems: "flex-start",
                  marginBottom: "6px", padding: "6px 10px",
                  background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: "3px",
                }}>
                  <Tag color={{ POST: C.green, GET: C.blue, PUT: C.amber }[ep.method] || C.dim} small>{ep.method}</Tag>
                  <div>
                    <div style={{ fontSize: "10px", color: mod.color, fontFamily: "monospace" }}>{ep.path}</div>
                    <div style={{ fontSize: "10px", color: C.dim, marginTop: "1px" }}>{ep.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deps */}
          <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "9px", color: C.dim, letterSpacing: "2px", paddingTop: "4px" }}>DEPS:</span>
            {mod.deps.map((d, i) => (
              <Tag key={i} color={C.dimmer}>{d}</Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TABS ─────────────────────────────────────────────────────── */

const TABS = [
  { id: "modules", label: "Spring Modules" },
  { id: "database", label: "MySQL Schema" },
  { id: "structure", label: "Project Structure" },
  { id: "config", label: "Config & Build" },
];

/* ── APP ──────────────────────────────────────────────────────── */

export default function App() {
  const [activeTab, setActiveTab] = useState("modules");
  const [expandedMod, setExpandedMod] = useState("ingestion");
  const [codeTab, setCodeTab] = useState("pom");

  return (
    <div style={{
      background: C.navy,
      minHeight: "100vh",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      color: C.white,
      backgroundImage: gridBg,
      backgroundSize: "40px 40px",
    }}>

      {/* HEADER */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        background: "rgba(5,14,31,0.96)",
        backdropFilter: "blur(8px)",
        padding: "16px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "8px", letterSpacing: "3px", color: C.dim, textTransform: "uppercase" }}>NRCeS · ABDM · NHCX Protocol v0.7</div>
            <div style={{ fontSize: "17px", fontWeight: "800", letterSpacing: "0.5px" }}>
              <span style={{ color: C.blue }}>NHCX</span>
              <span style={{ color: C.dim }}>–</span>
              <span style={{ color: C.cyan }}>FHIR</span>
              <span style={{ color: C.dim }}> Converter Service</span>
            </div>
          </div>
          <div style={{ width: "1px", height: "32px", background: C.border }} />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Tag color={C.blue}>Spring Boot 3.3</Tag>
            <Tag color={C.green}>MySQL 8.0</Tag>
            <Tag color={C.cyan}>HAPI FHIR R4</Tag>
            <Tag color={C.amber}>Java 17</Tag>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Tag color={C.green}>Apache 2.0</Tag>
          <Tag color={C.blue}>Open Source</Tag>
        </div>
      </div>

      {/* HERO FLOW DIAGRAM */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "32px 40px",
        background: "rgba(5,14,31,0.7)",
      }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div style={{ fontSize: "9px", color: C.dim, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "20px" }}>System Data Flow</div>

          <div style={{ display: "flex", alignItems: "center", gap: "0", overflowX: "auto", paddingBottom: "8px" }}>
            {/* Sources */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "150px" }}>
              {["HL7 v2.x (ADT/DFT)", "CSV / XML Files", "REST / DB Dump"].map((s, i) => (
                <div key={i} style={{
                  padding: "6px 12px", fontSize: "10px",
                  border: `1px solid ${C.border}`,
                  background: C.navyLight, borderRadius: "3px",
                  color: "#7EAACC",
                }}>{s}</div>
              ))}
            </div>

            <Arrow color={C.blue} label="ingest" />

            {/* MOD-01 */}
            <FlowBox code="MOD-01" name="Ingestion" color={C.blue} />
            <Arrow color={C.cyan} label="parse" />
            <FlowBox code="MOD-02" name="Mapping Engine" color={C.cyan} />
            <Arrow color={C.green} label="build" />
            <FlowBox code="MOD-03" name="FHIR Builder" color={C.green} />
            <Arrow color={C.amber} label="validate" />
            <FlowBox code="MOD-04" name="Validate & Dispatch" color={C.amber} />

            <Arrow color={C.red} label="submit" />

            {/* Output */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "160px" }}>
              {[
                { label: "CoverageEligibility", c: C.blue },
                { label: "Claim / Pre-Auth", c: C.green },
                { label: "Communication", c: C.amber },
              ].map((o, i) => (
                <div key={i} style={{
                  padding: "6px 12px", fontSize: "10px",
                  border: `1px solid ${o.c}50`,
                  background: `${o.c}12`, borderRadius: "3px",
                  color: o.c, fontWeight: "700",
                }}>{o.label}</div>
              ))}
              <div style={{
                padding: "6px 12px", fontSize: "10px",
                border: `1px solid ${C.red}50`,
                background: `${C.red}12`, borderRadius: "3px",
                color: C.red, fontWeight: "700",
                marginTop: "2px",
              }}>→ HCX Gateway</div>
            </div>
          </div>

          {/* Infra row */}
          <div style={{ display: "flex", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "9px", color: C.dim, letterSpacing: "2px", paddingTop: "4px" }}>INFRASTRUCTURE:</span>
            {[
              { label: "MySQL 8.0", c: C.blue }, { label: "Flyway Migrations", c: C.blue },
              { label: "HikariCP Pool", c: C.blue }, { label: "Caffeine Cache", c: C.cyan },
              { label: "Spring Actuator", c: C.green }, { label: "Prometheus Metrics", c: C.green },
              { label: "Docker + K8s", c: C.amber }, { label: "Spring Retry", c: C.amber },
            ].map((t, i) => <Tag key={i} color={t.c}>{t.label}</Tag>)}
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(10,22,40,0.9)", position: "sticky", top: "61px", zIndex: 90 }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 40px", display: "flex" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: "none", border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${C.cyan}` : "2px solid transparent",
              color: activeTab === tab.id ? C.cyan : C.dim,
              padding: "13px 20px",
              fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "inherit",
              transition: "color 0.15s",
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "36px 40px" }}>

        {/* ── TAB: SPRING MODULES ── */}
        {activeTab === "modules" && (
          <div>
            <SectionLabel text="4 Spring Boot Modules — Click to Expand" color={C.blue} />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {modules.map(mod => (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  expanded={expandedMod === mod.id}
                  onToggle={() => setExpandedMod(expandedMod === mod.id ? null : mod.id)}
                />
              ))}
            </div>

            {/* Sample Code */}
            <div style={{ marginTop: "36px" }}>
              <SectionLabel text="Sample Service Code" color={C.green} />
              <CodeBox lang="ClaimBuilder.java — HAPI FHIR R4 Bundle Assembly" code={sampleCode} color={C.green} />
            </div>
          </div>
        )}

        {/* ── TAB: MYSQL SCHEMA ── */}
        {activeTab === "database" && (
          <div>
            <SectionLabel text="MySQL 8.0 Schema — 8 Tables" color={C.cyan} />

            {/* Table Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "32px" }}>
              {dbTables.map((t, i) => (
                <div key={i} style={{
                  background: C.navyLight,
                  border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${t.color}`,
                  borderRadius: "5px",
                  padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: t.color, fontFamily: "monospace" }}>{t.name}</span>
                    <Tag color={t.color} small>{t.engine}</Tag>
                  </div>
                  <div style={{ fontSize: "11px", color: "#7EAACC", marginBottom: "6px" }}>{t.rows}</div>
                  <div style={{ fontSize: "10px", color: C.dim, fontFamily: "monospace" }}>PK/IDX: {t.key}</div>
                </div>
              ))}
            </div>

            {/* Full DDL for fhir_bundles */}
            <SectionLabel text="Core DDL Excerpt — fhir_bundles + validation_results" color={C.amber} />
            <CodeBox lang="V1__init.sql — Flyway Migration" color={C.amber} code={`-- raw_messages: every inbound payload
CREATE TABLE raw_messages (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversion_id CHAR(36)      NOT NULL UNIQUE COMMENT 'UUID',
    source_system VARCHAR(100)  NOT NULL,
    message_type  ENUM('HL7_V2','CSV','XML','JSON') NOT NULL,
    payload       LONGTEXT      NOT NULL,
    received_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    status        ENUM('PENDING','PROCESSING','CONVERTED','FAILED') NOT NULL DEFAULT 'PENDING',
    retry_count   TINYINT       NOT NULL DEFAULT 0,
    INDEX idx_status_source (status, source_system),
    INDEX idx_conversion_id (conversion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- mapping_profiles: hot-reloadable YAML configs
CREATE TABLE mapping_profiles (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_system VARCHAR(100)  NOT NULL,
    profile_name  VARCHAR(200)  NOT NULL,
    version       VARCHAR(20)   NOT NULL,
    yaml_config   MEDIUMTEXT    NOT NULL,
    active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_system_version (source_system, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- fhir_bundles: generated FHIR R4 bundles
CREATE TABLE fhir_bundles (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversion_id     CHAR(36)     NOT NULL UNIQUE,
    bundle_type       ENUM('COVERAGE_ELIGIBILITY','CLAIM','COMMUNICATION') NOT NULL,
    bundle_json       LONGTEXT     NOT NULL,
    profile_url       VARCHAR(300) NOT NULL,
    validation_status ENUM('PENDING','VALID','INVALID','SKIPPED') DEFAULT 'PENDING',
    raw_message_id    BIGINT,
    created_at        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (raw_message_id) REFERENCES raw_messages(id) ON DELETE SET NULL,
    INDEX idx_bundle_type_status (bundle_type, validation_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- validation_results: NRCeS OperationOutcome issues
CREATE TABLE validation_results (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    bundle_id     BIGINT        NOT NULL,
    severity      ENUM('ERROR','WARNING','INFORMATION','FATAL') NOT NULL,
    issue_code    VARCHAR(100),
    diagnostics   TEXT,
    location      VARCHAR(500),
    fix_hint      TEXT,
    validated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (bundle_id) REFERENCES fhir_bundles(id) ON DELETE CASCADE,
    INDEX idx_bundle_severity (bundle_id, severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- dispatch_log: HCX gateway submission audit
CREATE TABLE dispatch_log (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    bundle_id          BIGINT        NOT NULL,
    hcx_correlation_id VARCHAR(200),
    http_status        SMALLINT,
    response_body      TEXT,
    attempt_no         TINYINT       NOT NULL DEFAULT 1,
    dispatched_at      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    success            BOOLEAN       NOT NULL DEFAULT FALSE,
    FOREIGN KEY (bundle_id) REFERENCES fhir_bundles(id),
    INDEX idx_bundle_attempt (bundle_id, attempt_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`} />
          </div>
        )}

        {/* ── TAB: PROJECT STRUCTURE ── */}
        {activeTab === "structure" && (
          <div>
            <SectionLabel text="Maven Project Structure" color={C.green} />
            <div style={{
              background: "#020914",
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.green}`,
              borderRadius: "4px",
              padding: "20px 24px",
              fontFamily: "monospace",
              fontSize: "12px",
              lineHeight: "1.8",
            }}>
              {projectStructure.map((item, i) => (
                <div key={i} style={{
                  color: item.type === "main" ? C.blue :
                    item.type === "dir" ? C.amber :
                    item.type === "root" ? C.cyan :
                    "#7EB8FF",
                  paddingLeft: item.path.startsWith("  ") ? (item.path.match(/^(\s+)/)?.[1].length * 4 + "px") : "0",
                }}>
                  {item.type === "dir" ? "📁 " : item.type === "main" ? "🚀 " : item.type === "root" ? "📦 " : "   "}
                  {item.path.trim()}
                </div>
              ))}
            </div>

            {/* Docker */}
            <div style={{ marginTop: "28px" }}>
              <SectionLabel text="Docker Compose" color={C.blue} />
              <CodeBox lang="docker-compose.yml" color={C.blue} code={`version: '3.9'
services:
  nhcx-fhir-converter:
    build: .
    image: nhcx/fhir-converter:1.0.0
    ports:
      - "8080:8080"
    environment:
      DB_USER: nhcx_user
      DB_PASS: \${DB_PASS}
      HCX_GATEWAY_URL: https://staging.hcxprotocol.io
      HCX_SENDER_CODE: \${HCX_SENDER_CODE}
      HCX_API_KEY: \${HCX_API_KEY}
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - ./config/mappings:/config/mappings   # hot-reload YAML
      - ./nrces-profiles:/nrces-profiles
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: nhcx_fhir_db
      MYSQL_USER: nhcx_user
      MYSQL_PASSWORD: \${DB_PASS}
      MYSQL_ROOT_PASSWORD: \${DB_ROOT_PASS}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"

volumes:
  mysql_data:`} />
            </div>
          </div>
        )}

        {/* ── TAB: CONFIG & BUILD ── */}
        {activeTab === "config" && (
          <div>
            <SectionLabel text="Build & Runtime Configuration" color={C.amber} />

            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
              {[
                { id: "pom", label: "pom.xml" },
                { id: "yml", label: "application.yml" },
                { id: "mapping", label: "mapping YAML" },
              ].map(t => (
                <button key={t.id} onClick={() => setCodeTab(t.id)} style={{
                  background: codeTab === t.id ? `${C.amber}20` : "none",
                  border: `1px solid ${codeTab === t.id ? C.amber : C.border}`,
                  borderRadius: "3px",
                  color: codeTab === t.id ? C.amber : C.dim,
                  padding: "6px 14px",
                  fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase",
                  cursor: "pointer", fontFamily: "inherit",
                }}>{t.label}</button>
              ))}
            </div>

            {codeTab === "pom" && <CodeBox lang="pom.xml — Maven Dependencies" color={C.amber} code={pom} />}
            {codeTab === "yml" && <CodeBox lang="application.yml — Spring Boot Config" color={C.cyan} code={appYml} />}
            {codeTab === "mapping" && <CodeBox lang="mappings/hl7_adt_coverage.yaml — Config-Driven Field Mapping" color={C.green} code={`# NHCX-FHIR Converter — HL7 v2.x ADT → CoverageEligibility Mapping
# Drop a new YAML here; service hot-reloads without restart.

source_system: "HMIS_HL7_ADT"
fhir_bundle_type: "COVERAGE_ELIGIBILITY"
nhcx_profile: "https://ig.hcxprotocol.io/v0.7/StructureDefinition-HCXCoverageEligibilityRequest.html"

patient:
  family_name:       PID.5.1                  # PID segment, field 5, component 1
  given_name:        PID.5.2
  date_of_birth:     PID.7                    # format: YYYYMMDD
  gender:            PID.8
  abha_id:           PID.3[id_type=ABHA]      # filter by ID type

# Value transforms
transforms:
  gender:
    M: "male"
    F: "female"
    O: "other"
    U: "unknown"

coverage:
  insurer_oid:       IN1.4                    # resolve via payer_registry.yaml
  plan_code:         IN1.35
  subscriber_id:     IN1.36
  period_start:      IN1.12                   # format: YYYYMMDD
  period_end:        IN1.13
  benefit_category:  IN1.15

organization:
  insurer_name:      IN1.4.2
  insurer_id_system: "https://ndhm.gov.in/insurers"

# SNOMED CT mappings for encounter context
snomed_map:
  encounter_class:
    O: { code: "185387006", display: "New patient consultation — outpatient" }
    I: { code: "11429006",  display: "Inpatient admission" }
    E: { code: "50849002",  display: "Emergency room admission" }

  purpose:
    ELIGIBILITY: "benefits"
    PREAUTH:     "auth-requirements"

# Validation overrides
validation:
  require_abha_id: true
  require_period:  true`} />}

            {/* Architecture decision summary */}
            <div style={{ marginTop: "32px" }}>
              <SectionLabel text="Architectural Decisions" color={C.blue} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {[
                  { q: "Why Spring Boot?", a: "Mature JPA/Hibernate + HikariCP for MySQL, native HAPI FHIR Java SDK integration, Spring Retry & WebClient for HCX dispatch, Actuator/Prometheus observability out-of-the-box.", c: C.blue },
                  { q: "Why MySQL 8.0?", a: "Hospital HMIS environments predominantly run MySQL/MariaDB. JSON column support for flexible payload storage, full-text indexing for FHIR bundle search, mature InnoDB transactions.", c: C.green },
                  { q: "Why HAPI FHIR?", a: "Canonical Java FHIR implementation. Includes typed R4 resource models, NRCeS StructureDefinition validator, FHIR Bundle/transaction builder, and an embedded terminology server.", c: C.cyan },
                  { q: "Why Flyway?", a: "Version-controlled schema migrations compatible with CI/CD pipelines. Zero-downtime rolling migrations. Audit trail of every schema change — critical for regulated healthcare environments.", c: C.amber },
                  { q: "Why YAML Mappings?", a: "Zero-code onboarding for new source systems. HMIS teams update a YAML file; the hot-reload endpoint picks it up instantly. Community-contributed profiles published in the OSS repo.", c: C.red },
                  { q: "Why Spring Retry?", a: "HCX gateway can return 202-Accepted then require async polling. Exponential backoff + dead-letter queue ensures no claim submission is silently dropped due to transient network errors.", c: C.dim },
                ].map((card, i) => (
                  <div key={i} style={{
                    background: C.navyLight,
                    border: `1px solid ${C.border}`,
                    borderTop: `2px solid ${card.c}`,
                    borderRadius: "5px",
                    padding: "16px",
                  }}>
                    <div style={{ fontSize: "11px", fontWeight: "800", color: card.c, marginBottom: "8px" }}>{card.q}</div>
                    <div style={{ fontSize: "11px", color: "#7EAACC", lineHeight: "1.7" }}>{card.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "18px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(5,14,31,0.8)" }}>
        <div style={{ fontSize: "9px", color: C.dimmer, letterSpacing: "2px", textTransform: "uppercase" }}>NHCX–FHIR Converter Service · Spring Boot 3.3 · MySQL 8.0 · HAPI FHIR R4 · Java 17 · Apache 2.0</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Tag color={C.blue}>NRCeS Compliant</Tag>
          <Tag color={C.cyan}>ABDM Ready</Tag>
        </div>
      </div>
    </div>
  );
}

/* ── HELPERS ──────────────────────────────────────────────────── */

function FlowBox({ code, name, color }) {
  return (
    <div style={{
      background: `${color}12`,
      border: `1px solid ${color}50`,
      borderRadius: "5px",
      padding: "10px 16px",
      textAlign: "center",
      minWidth: "110px",
    }}>
      <div style={{ fontSize: "8px", color: color, letterSpacing: "1.5px", marginBottom: "3px" }}>{code}</div>
      <div style={{ fontSize: "11px", fontWeight: "700", color: C.white, whiteSpace: "nowrap" }}>{name}</div>
    </div>
  );
}

function Arrow({ color, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 4px" }}>
      <div style={{ fontSize: "8px", color: color, letterSpacing: "1px", marginBottom: "2px" }}>{label}</div>
      <div style={{ color: color, fontSize: "16px" }}>→</div>
    </div>
  );
}