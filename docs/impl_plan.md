# NHCX–FHIR Converter Service — Implementation Plan

**Project:** HealthBridge · Legacy → FHIR R4 → NHCX HCX Gateway  
**Tech Stack:** Spring Boot 3.3 · MySQL 8.0 · Angular 17 · HAPI FHIR R4 · Java 17  
**Pipeline:** 6-Stage Data Flow as shown in architecture diagram  

---

## Pipeline Overview

```
Legacy HMIS  →  Ingest API  →  AI Mapper  →  FHIR Builder  →  NRCeS Validator  →  HCX Gateway
HL7/CSV/XML     Spring Boot     LLM+YAML      HAPI FHIR R4    StructureDefs       NHCX v0.7
  [STEP 1]       [STEP 2]       [STEP 3]       [STEP 4]          [STEP 5]          [STEP 6]
```

---

## Phase 1 — Foundation & Infrastructure
**Duration:** Week 1–2  
**Goal:** Project scaffold, DB schema, CI/CD, base Spring Boot app running

### 1.1 Project Setup
- Initialize Maven multi-module Spring Boot 3.3 project
- Configure `application.yml` for dev / staging / prod profiles
- Set up MySQL 8.0 database: `nhcx_fhir_db`
- Add Flyway migration support (`db/migration/`)
- Configure HikariCP connection pool (max 20, min-idle 5)
- Add Lombok, MapStruct, Jackson YAML to `pom.xml`
- Set up Docker + `docker-compose.yml` (app + MySQL + Prometheus)
- Initialize Angular 17 frontend project (standalone components)
- Configure GitHub Actions CI pipeline (build → test → docker build)

### 1.2 Database Schema (Flyway V1)
Run `V1__init_schema.sql` creating all 8 core tables:

| Table | Purpose |
|---|---|
| `raw_messages` | Every inbound legacy payload log |
| `mapping_profiles` | YAML configs per source system |
| `code_translations` | Cached SNOMED/ICD terminology |
| `snomed_concepts` | RF2 subset (read-only) |
| `fhir_bundles` | Generated FHIR R4 bundles |
| `fhir_resources` | Individual resource records |
| `validation_results` | NRCeS validation issues per bundle |
| `dispatch_log` | HCX gateway submission audit |

### 1.3 Core Domain Model
- Create all JPA `@Entity` classes with Lombok `@Data`/`@Builder`
- Create all Spring Data `JpaRepository` interfaces
- Create `ConversionId` (UUID) value object used across all tables
- Create `SourceFormatEnum`: `HL7_V2`, `CSV`, `XML`, `JSON`
- Create `BundleTypeEnum`: `COVERAGE_ELIGIBILITY`, `CLAIM`, `COMMUNICATION`
- Create `ConversionStatus` state machine enum

---

## Phase 2 — Step 1: Legacy HMIS Ingestion Layer
**Duration:** Week 3–4  
**Goal:** Accept HL7 v2.x, CSV, XML, JSON payloads via REST

### 2.1 Format Auto-Detection
```
IngestionController  →  FormatDetectorService  →  ParsedPayload
```
- `FormatDetectorService`: sniff payload bytes — MSH segment = HL7, delimiter scan = CSV, root tag = XML
- Use Apache Tika for MIME detection fallback
- Return `SourceFormatEnum` + confidence score
- Persist raw payload to `raw_messages` with `status = PENDING`

### 2.2 HL7 v2.x Parser
- Add HAPI HL7v2 dependency (`hapi-hl7v2-base:2.5.1`)
- `HL7ParserService`: parse ADT^A01, DFT^P03, ORU^R01 messages
- Extract segment groups: PID, PV1, IN1, DG1, PR1, FT1
- Output: `ParsedHL7Payload` domain object (flat key-value map)
- Handle encoding characters, repetitions, sub-components

### 2.3 Flat File Parsers
- `CSVParserService`: OpenCSV with configurable delimiter and quote char
- `XMLParserService`: JAXB unmarshalling with XPath value extraction
- `JSONParserService`: Jackson `JsonNode` tree traversal
- All parsers output the same `ParsedLegacyPayload` interface

### 2.4 REST Endpoints
```
POST /api/v1/ingest/hl7      — HL7 v2.x (raw text or MLLP-over-HTTP)
POST /api/v1/ingest/csv      — Multipart CSV file + mapping_profile_id
POST /api/v1/ingest/xml      — XML document body
POST /api/v1/ingest/json     — JSON DB export or REST response
GET  /api/v1/ingest/{id}     — Fetch raw_message by conversion_id
```

### 2.5 Angular: Upload UI
- File upload component with drag-and-drop
- Source system selector dropdown
- Real-time upload status indicator

---

## Phase 3 — Step 2: AI Mapping Engine
**Duration:** Week 5–7  
**Goal:** YAML profile loading, LLM gap filling, transform pipeline

### 3.1 YAML Profile System
- Define `MappingProfile` YAML schema (Jackson `@JsonProperty`)
- `MappingProfileService`: load by `source_system` from MySQL
- Caffeine cache: TTL 24h, evict on `PUT /api/v1/mappings/{system}`
- Support profile versioning: `source_system + version` unique key
- Hot-reload: `PUT` endpoint triggers `cache.invalidate(sourceSystem)`

### 3.2 LLM Suggester
- `LLMSuggesterClient`: Spring WebClient → OpenAI `/v1/chat/completions`
- Use `response_format: { type: "json_object" }` for structured output
- Prompt template includes: field name, sample values (top 3), FHIR R4 schema
- Response parsing: `fhir_path`, `transform`, `confidence`, `reasoning`
- Guard: only call LLM if field missing from YAML profile
- Guard: reject suggestions where `confidence < min_confidence` (default 0.75)
- Fallback: Google Gemini Flash via config flag `nhcx.llm.provider`
- Timeout: 8 seconds. Never block main conversion thread (async)

### 3.3 Transform Pipeline
Composable chain applied to every field value:

| Transform Key | Input → Output |
|---|---|
| `TRIM` | Remove leading/trailing whitespace |
| `UPPERCASE` / `LOWERCASE` | Case normalization |
| `DATE_YYYYMMDD` | `19900415` → `1990-04-15` |
| `DATE_NORMALIZE` | Auto-detect any date format → ISO 8601 |
| `CODE_MAP` | M → male, F → female (via YAML code_map block) |
| `OID_LOOKUP` | Insurer OID → FHIR Organization reference |
| `SNOMED_RESOLVE` | Local code → SNOMED CT concept |
| `NULL_SAFE` | Null → empty string, no NPE |

- `TransformPipeline.java`: registry map of `String → FieldTransform`
- `DateNormalizer.java`: tries 8 common date format patterns in sequence
- All transforms are `@Component` beans — composable, independently testable

### 3.4 SNOMED CT Resolution
- Bundle SNOMED CT RF2 subset JAR (common clinical + insurance codes)
- `SnomedLookupService`: check `code_translations` MySQL table first
- Fallback: SNOMED ECL Engine for hierarchy queries
- Fallback: UMLS REST API for unknown codes
- Cache resolved codes back to `code_translations` for next use
- On no match: return `null` + log `WARNING` in audit, do NOT silently pass

### 3.5 Mapping Audit
- `MappingAuditService`: persist one row to `mapping_audit` per field
- Fields logged: `source_field`, `fhir_path`, `value_before`, `value_after`, `transform_chain`, `confidence`, `llm_used`, `llm_model`
- Use `conversion_id` UUID to correlate all audit rows for one conversion

### 3.6 REST Endpoints
```
GET  /api/v1/mappings/{sourceSystem}         — Get active YAML profile
PUT  /api/v1/mappings/{sourceSystem}         — Upload new YAML (hot-reload)
GET  /api/v1/mappings/{sourceSystem}/audit   — Mapping audit for last N conversions
POST /api/v1/mappings/suggest                — Manually trigger LLM suggestion for a field
```

---

## Phase 4 — Step 3: FHIR Bundle Builder
**Duration:** Week 8–9  
**Goal:** Build typed HAPI FHIR R4 resources from mapped data

### 4.1 Resource Factories
Each resource builder is an independent `@Service`:

- `PatientBuilder` — builds `Patient` with ABHA identifier, name, DOB, gender
- `CoverageBuilder` — builds `Coverage` with insurer reference, plan code, period
- `CoverageEligibilityBuilder` — assembles `CoverageEligibilityRequest` bundle
- `ClaimBuilder` — builds `Claim` + `Condition` (ICD-10→SNOMED) + `Procedure`
- `CommunicationBuilder` — builds `Communication` + `DocumentReference`
- `EncounterBuilder` — builds `Encounter` with SNOMED encounter class

### 4.2 Bundle Assembler
- `FHIRBundleService`: orchestrates all resource factories
- Set `Bundle.type = collection`
- Inject NHCX profile URL in `Bundle.meta.profile`
- Add `entry.fullUrl` for each resource (`resource-type/id`)
- Serialize to JSON using `FhirContext.forR4().newJsonParser()`
- Persist serialized JSON to `fhir_bundles` table

### 4.3 Profile URL Injection
Inject correct NRCeS/HCX IG URLs:

| Bundle Type | Profile URL |
|---|---|
| CoverageEligibility | `https://ig.hcxprotocol.io/v0.7/StructureDefinition-HCXCoverageEligibilityRequest.html` |
| Claim | `https://ig.hcxprotocol.io/v0.7/StructureDefinition-HCXClaim.html` |
| Communication | `https://ig.hcxprotocol.io/v0.7/StructureDefinition-HCXCommunication.html` |

### 4.4 REST Endpoints
```
POST /api/v1/convert/coverage-eligibility   — Full pipeline → CoverageEligibilityRequest
POST /api/v1/convert/claim                  — Full pipeline → Claim bundle
POST /api/v1/convert/communication          — Full pipeline → Communication bundle
GET  /api/v1/bundles/{conversionId}         — Fetch generated FHIR bundle JSON
GET  /api/v1/bundles/{conversionId}/preview — Human-readable bundle summary
```

---

## Phase 5 — Step 4: NRCeS Validation Engine
**Duration:** Week 10  
**Goal:** Validate bundles against NRCeS StructureDefinitions, return fix hints

### 5.1 Validator Setup
- Add `hapi-fhir-validation-resources-r4:7.2.1` dependency
- Bundle NRCeS StructureDefinition JSON snapshots in `resources/nrces-profiles/`
- `NRCeSValidatorService`: run `FhirValidator.validateWithResult(bundle)`
- Parse `ValidationResult` → list of `SingleValidationMessage`

### 5.2 OperationOutcome Builder
- Map HAPI severity levels to FHIR `OperationOutcome.issue.severity`
- Add `fix_hint` per issue type (manually curated 50 most common errors)
- Persist each issue to `validation_results` table with `bundle_id` FK
- Update `fhir_bundles.validation_status` = `VALID` / `INVALID`

### 5.3 Fix Hints (Top 10)
| Issue | Fix Hint |
|---|---|
| Missing `Patient.identifier` with ABHA system | Add identifier with system=`https://healthid.ndhm.gov.in` |
| Invalid `Coverage.payor` reference | Resolve insurer OID via payer_registry.yaml |
| `Claim.use` not in valueset | Allowed: `claim`, `preauthorization`, `predetermination` |
| Missing `Bundle.meta.profile` | Inject HCX IG profile URL |
| `Patient.gender` invalid code | Normalize via CODE_MAP transform |

### 5.4 REST Endpoints
```
POST /api/v1/validate              — Validate any FHIR bundle JSON
GET  /api/v1/validate/{bundleId}   — Fetch validation results for a bundle
GET  /api/v1/validate/stats        — Error frequency heatmap (last 30 days)
```

---

## Phase 6 — Step 5: HCX Gateway Dispatch
**Duration:** Week 11  
**Goal:** Sign and submit validated bundles to HCX gateway, handle responses

### 6.1 HCX Client
- `HCXGatewayClient`: Spring WebClient (reactive, non-blocking)
- Endpoints: `POST /v0.7/coverageeligibility/check`, `/v0.7/claims/submit`
- Add `Authorization: Bearer {HCX_API_KEY}` header
- Add `X-HCX-Sender-Code`, `X-HCX-Recipient-Code`, `X-HCX-Correlation-ID` headers
- Sign payload as JWE (JSON Web Encryption) per HCX protocol spec
- Log every request/response to `dispatch_log` table

### 6.2 Retry Engine
- Spring `@Scheduled` polling of `dispatch_log` where `success = false`
- Spring Retry with exponential backoff: 2s → 4s → 8s
- Dead-letter after 3 failed attempts: set `status = DEAD_LETTER`, alert
- `RetryService`: separate thread pool, does not block ingestion pipeline

### 6.3 Response Handling
- HCX returns `202 Accepted` + `correlation_id`
- Poll `GET /v0.7/status/{correlationId}` every 30s for async response
- On `ClaimResponse` received: update `fhir_bundles.status`, notify patient (Phase 2)
- On `4xx`: parse error body, persist to `dispatch_log.response_body`

### 6.4 REST Endpoints
```
POST /api/v1/dispatch/{bundleId}           — Submit to HCX gateway
GET  /api/v1/dispatch/{bundleId}/status    — Poll dispatch + HCX response
GET  /api/v1/dispatch/pending              — List bundles awaiting dispatch
POST /api/v1/dispatch/{bundleId}/retry     — Manual retry trigger
```

---

## Phase 7 — Angular Dashboard
**Duration:** Week 12  
**Goal:** Operational UI for hospital IT teams

### 7.1 Pages
- **Onboarding Wizard** — Upload sample file → AI mapping preview → confirm → save profile
- **Live Conversion Feed** — Real-time table of conversions with status badges
- **Bundle Inspector** — View generated FHIR JSON with syntax highlighting
- **Mapping Editor** — YAML editor with live preview for mapping profiles
- **Validation Console** — Error breakdown by field, fix-hint panel
- **Dispatch Tracker** — HCX submission status, retry controls

### 7.2 Angular Services
- `IngestionService` — wraps POST /api/v1/ingest/*
- `MappingService` — wraps GET/PUT /api/v1/mappings/*
- `ConversionService` — wraps POST /api/v1/convert/*
- `ValidationService` — wraps POST /api/v1/validate
- `DispatchService` — wraps POST /api/v1/dispatch/*
- `WebSocketService` — live conversion feed via Spring WebSocket

---

## Phase 8 — Observability & Security
**Duration:** Week 13  

### 8.1 Observability
- Spring Actuator: `/actuator/health`, `/actuator/metrics`
- Micrometer + Prometheus: custom metrics
  - `nhcx.conversions.total` (counter, by bundle_type)
  - `nhcx.mapping.llm_calls` (counter)
  - `nhcx.mapping.confidence_avg` (gauge)
  - `nhcx.validation.errors.total` (counter, by issue_code)
  - `nhcx.dispatch.latency` (histogram)
- Grafana dashboard JSON (bundled in repo)
- MDC logging: `conversion_id` in every log line for full trace

### 8.2 Security
- Spring Security with JWT Bearer tokens
- Roles: `ROLE_HOSPITAL_ADMIN`, `ROLE_IT_OPERATOR`, `ROLE_VIEWER`
- All `/api/v1/**` endpoints require authentication
- `HCX_API_KEY` and `DB_PASS` from environment variables only — never in code
- Rate limiting: 100 requests/minute per source system (Bucket4j)

---

## Deployment Architecture

```
[Angular 17 UI]  →  [Spring Boot 3.3 API :8080]  →  [MySQL 8.0 :3306]
                              ↓
                     [HCX Gateway (external)]
                              ↓
                     [Prometheus :9090]  →  [Grafana :3000]
```

### Docker Compose Services
1. `nhcx-fhir-converter` — Spring Boot app
2. `mysql` — MySQL 8.0 with health check
3. `prometheus` — metrics scrape
4. `grafana` — dashboards

### Environment Variables Required
```
DB_USER, DB_PASS, DB_ROOT_PASS
HCX_GATEWAY_URL, HCX_SENDER_CODE, HCX_API_KEY
OPENAI_API_KEY (or GEMINI_API_KEY)
JWT_SECRET
```

---

## Non-Functional Targets

| Metric | Target |
|---|---|
| End-to-end conversion latency | < 500ms (P95, LLM excluded) |
| LLM call latency | < 8s timeout, async |
| Profile cache hit rate | > 99% after warmup |
| Validation accuracy vs NRCeS | 100% (zero false passes) |
| Uptime | 99.5% (Kubernetes liveness probe) |
| Audit completeness | 100% of fields logged |
| SNOMED resolution local hit rate | > 95% for common codes |