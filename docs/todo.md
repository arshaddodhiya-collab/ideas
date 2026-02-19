# NHCX–FHIR Converter — Task Breakdown

**Format:** `[STEP-XX] Title — Assignee — Effort — Priority`  
**Priority:** 🔴 Critical | 🟡 High | 🟢 Normal  
**Status:** ☐ Todo | ⚙ In Progress | ✅ Done | ⛔ Blocked  

---

## STEP 0 — Project Foundation

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-001 | Initialize Spring Boot 3.3 Maven project with multi-module structure | 2h | 🔴 | ☐ |
| T-002 | Configure `application.yml` with dev/staging/prod Spring profiles | 1h | 🔴 | ☐ |
| T-003 | Add all `pom.xml` dependencies (HAPI FHIR, HL7v2, MapStruct, Lombok, OpenCSV, Jackson YAML) | 1h | 🔴 | ☐ |
| T-004 | Set up MySQL 8.0 database `nhcx_fhir_db` and create `nhcx_user` | 30m | 🔴 | ☐ |
| T-005 | Configure HikariCP (max-pool 20, min-idle 5, connection-timeout 30s) | 30m | 🟡 | ☐ |
| T-006 | Add Flyway dependency and configure `db/migration/` directory | 30m | 🔴 | ☐ |
| T-007 | Write `V1__init_schema.sql` — all 8 tables with indexes and FK constraints | 3h | 🔴 | ☐ |
| T-008 | Write `V2__mapping_audit_table.sql` — `mapping_audit` table | 1h | 🟡 | ☐ |
| T-009 | Create all JPA `@Entity` classes: `RawMessage`, `MappingProfile`, `FhirBundle`, `FhirResource`, `ValidationResult`, `DispatchLog`, `CodeTranslation` | 3h | 🔴 | ☐ |
| T-010 | Create all `JpaRepository` interfaces with custom query methods | 2h | 🔴 | ☐ |
| T-011 | Create `ConversionStatus`, `SourceFormatEnum`, `BundleTypeEnum` enums | 1h | 🟡 | ☐ |
| T-012 | Set up `docker-compose.yml` with app + MySQL + Prometheus services | 2h | 🟡 | ☐ |
| T-013 | Write `Dockerfile` for Spring Boot app (multi-stage, JRE 17 slim) | 1h | 🟡 | ☐ |
| T-014 | Initialize Angular 17 project with standalone components + routing | 2h | 🟢 | ☐ |
| T-015 | Configure GitHub Actions CI: build → test → docker build on PR | 2h | 🟡 | ☐ |
| T-016 | Set up Lombok + MapStruct annotation processor in `pom.xml` | 30m | 🔴 | ☐ |

---

## STEP 1 — Legacy HMIS Ingestion

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-101 | Create `IngestionController` with 4 POST endpoints (`/hl7`, `/csv`, `/xml`, `/json`) | 2h | 🔴 | ☐ |
| T-102 | Implement `FormatDetectorService` — MSH sniff for HL7, delimiter scan for CSV, root tag for XML | 3h | 🔴 | ☐ |
| T-103 | Add Apache Tika dependency for MIME type fallback detection | 30m | 🟡 | ☐ |
| T-104 | Implement `HL7ParserService` using HAPI HL7v2 — parse ADT^A01 messages | 4h | 🔴 | ☐ |
| T-105 | Extend `HL7ParserService` to handle DFT^P03 (billing) and ORU^R01 (lab results) | 3h | 🔴 | ☐ |
| T-106 | Extract PID, PV1, IN1, DG1, PR1, FT1 segment groups into `ParsedHL7Payload` | 3h | 🔴 | ☐ |
| T-107 | Handle HL7 encoding chars, field repetitions, and sub-component notation (PID.3[2].1) | 2h | 🟡 | ☐ |
| T-108 | Implement `CSVParserService` with OpenCSV — configurable delimiter, quote char, header row | 3h | 🔴 | ☐ |
| T-109 | Implement `XMLParserService` with JAXB + XPath extraction | 3h | 🔴 | ☐ |
| T-110 | Implement `JSONParserService` with Jackson `JsonNode` tree traversal | 2h | 🔴 | ☐ |
| T-111 | Define `ParsedLegacyPayload` interface implemented by all 4 parsers | 1h | 🔴 | ☐ |
| T-112 | Persist every inbound payload to `raw_messages` with `status=PENDING` before processing | 1h | 🔴 | ☐ |
| T-113 | Generate `conversion_id` UUID on ingestion and attach to all downstream objects | 1h | 🔴 | ☐ |
| T-114 | Add `GET /api/v1/ingest/{conversionId}` endpoint to retrieve raw message | 30m | 🟢 | ☐ |
| T-115 | Write unit tests for `FormatDetectorService` with sample HL7, CSV, XML files | 2h | 🟡 | ☐ |
| T-116 | Write unit tests for `HL7ParserService` with real ADT^A01 test messages | 2h | 🟡 | ☐ |
| T-117 | Angular: File upload component with drag-and-drop and source system selector | 3h | 🟢 | ☐ |

---

## STEP 2 — AI Mapping Engine (Core of the System)

### 2A — YAML Profile System

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-201 | Define `MappingProfile` YAML schema as Java POJO with Jackson annotations | 2h | 🔴 | ☐ |
| T-202 | Define `FieldMapping` POJO: `sourcePath`, `fhirPath`, `transforms`, `codeMap`, `filter` | 1h | 🔴 | ☐ |
| T-203 | Implement `MappingProfileService.loadProfile(sourceSystem)` from MySQL | 2h | 🔴 | ☐ |
| T-204 | Add Caffeine cache to `loadProfile()` — TTL 24h, max 500 profiles | 1h | 🟡 | ☐ |
| T-205 | Implement `PUT /api/v1/mappings/{sourceSystem}` — save YAML to DB + evict cache | 2h | 🔴 | ☐ |
| T-206 | Implement `GET /api/v1/mappings/{sourceSystem}` — return active profile YAML | 1h | 🟡 | ☐ |
| T-207 | Write sample YAML profiles: `hl7_adt_coverage.yaml`, `csv_claim.yaml`, `xml_communication.yaml` | 4h | 🔴 | ☐ |
| T-208 | Implement profile versioning: `source_system + version` unique, `active` boolean toggle | 2h | 🟡 | ☐ |
| T-209 | Write unit tests for YAML deserialization with edge cases (missing fields, nulls) | 2h | 🟡 | ☐ |

### 2B — LLM Suggester

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-210 | Implement `LLMSuggesterClient` using Spring WebClient → OpenAI `/v1/chat/completions` | 3h | 🔴 | ☐ |
| T-211 | Write system prompt template for FHIR field mapping suggestion | 2h | 🔴 | ☐ |
| T-212 | Configure `response_format: { type: "json_object" }` and parse `LLMSuggestion` POJO | 2h | 🔴 | ☐ |
| T-213 | Add confidence threshold guard — reject suggestions below `min_confidence` (default 0.75) | 1h | 🔴 | ☐ |
| T-214 | Add 8-second timeout and async execution — LLM call never blocks main thread | 1h | 🔴 | ☐ |
| T-215 | Add Gemini Flash fallback via config flag `nhcx.llm.provider` | 3h | 🟡 | ☐ |
| T-216 | Guard: never call LLM for `abha_id`, `conversion_id`, PII identity fields | 1h | 🔴 | ☐ |
| T-217 | Log every LLM call: model, prompt tokens, response tokens, latency, confidence | 1h | 🟡 | ☐ |
| T-218 | Write integration test: mock OpenAI API response, assert correct FHIR path suggested | 2h | 🟡 | ☐ |

### 2C — Transform Pipeline

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-220 | Create `FieldTransform` functional interface: `Object apply(Object value, Map params)` | 30m | 🔴 | ☐ |
| T-221 | Implement `TransformPipeline` registry with all 8 transforms | 4h | 🔴 | ☐ |
| T-222 | Implement `DateNormalizer` — detect and parse 8 common date formats → ISO 8601 | 3h | 🔴 | ☐ |
| T-223 | Implement `CodeMapTransform` — apply YAML `code_map` block (M→male, F→female, etc.) | 1h | 🔴 | ☐ |
| T-224 | Implement `OIDLookupTransform` — resolve insurer OID to FHIR Organization ID via `payer_registry.yaml` | 2h | 🟡 | ☐ |
| T-225 | Implement `NullSafeTransform` — null coalescing, empty string handling, no NPE | 1h | 🔴 | ☐ |
| T-226 | Write unit test for every transform with normal, edge case, and null inputs | 3h | 🟡 | ☐ |

### 2D — SNOMED CT Resolution

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-230 | Bundle SNOMED CT RF2 subset (50K common clinical concepts) as JAR resource | 2h | 🔴 | ☐ |
| T-231 | Implement `SnomedLookupService.resolve(sourceCode, sourceSystem)` | 3h | 🔴 | ☐ |
| T-232 | L1: check `code_translations` MySQL table first (sub-ms) | 1h | 🔴 | ☐ |
| T-233 | L2: query embedded RF2 subset by concept ID | 2h | 🔴 | ☐ |
| T-234 | L3: SNOMED ECL Engine lookup for hierarchy queries | 2h | 🟡 | ☐ |
| T-235 | L4: UMLS REST API fallback via Spring WebClient | 2h | 🟡 | ☐ |
| T-236 | Write resolved codes back to `code_translations` (self-warming cache) | 1h | 🟡 | ☐ |
| T-237 | On no match: return null + create WARNING entry (never silently pass unknown code) | 1h | 🔴 | ☐ |
| T-238 | Pre-seed `code_translations` with 200 most common hospital codes in Flyway V3 migration | 2h | 🟡 | ☐ |

### 2E — Mapping Audit

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-240 | Implement `MappingAuditService.record(conversionId, rule, mappedField)` | 2h | 🔴 | ☐ |
| T-241 | Persist: `source_field`, `fhir_path`, `value_before`, `value_after`, `transform_chain`, `confidence`, `llm_used` | 1h | 🔴 | ☐ |
| T-242 | Implement `GET /api/v1/mappings/{sourceSystem}/audit` — audit rows for last N conversions | 1h | 🟡 | ☐ |
| T-243 | Write `AIMappingService.executeMapping()` orchestrating all sub-services | 4h | 🔴 | ☐ |

---

## STEP 3 — FHIR Bundle Builder

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-301 | Add `hapi-fhir-structures-r4:7.2.1` and `hapi-fhir-base` to `pom.xml` | 30m | 🔴 | ☐ |
| T-302 | Create `FhirContext` Spring `@Bean` (singleton — expensive to construct) | 30m | 🔴 | ☐ |
| T-303 | Implement `PatientBuilder` — ABHA identifier, HumanName, birthDate, gender | 3h | 🔴 | ☐ |
| T-304 | Implement `CoverageBuilder` — payor reference, beneficiary, period, plan code | 2h | 🔴 | ☐ |
| T-305 | Implement `CoverageEligibilityBuilder` — assemble full `CoverageEligibilityRequest` bundle | 3h | 🔴 | ☐ |
| T-306 | Implement `ConditionBuilder` — ICD-10 diagnosis → SNOMED Condition resource | 2h | 🔴 | ☐ |
| T-307 | Implement `ProcedureBuilder` — procedure code → SNOMED Procedure resource | 2h | 🔴 | ☐ |
| T-308 | Implement `ClaimBuilder` — assemble full `Claim` bundle with supporting info | 4h | 🔴 | ☐ |
| T-309 | Implement `CommunicationBuilder` — `Communication` + `DocumentReference` + attachments | 3h | 🔴 | ☐ |
| T-310 | Implement `FHIRBundleService` — orchestrates all builders, assembles `Bundle` | 3h | 🔴 | ☐ |
| T-311 | Inject correct NRCeS/HCX IG profile URL in `Bundle.meta.profile` per bundle type | 1h | 🔴 | ☐ |
| T-312 | Serialize bundle to JSON via `FhirContext.newJsonParser().encodeResourceToString()` | 1h | 🔴 | ☐ |
| T-313 | Persist serialized bundle JSON to `fhir_bundles` table | 1h | 🔴 | ☐ |
| T-314 | Implement `GET /api/v1/bundles/{conversionId}` endpoint | 1h | 🟡 | ☐ |
| T-315 | Write unit tests for each builder with sample mapped data | 4h | 🟡 | ☐ |
| T-316 | Write integration test: ingest HL7 → AI map → build bundle → assert valid JSON structure | 3h | 🟡 | ☐ |

---

## STEP 4 — NRCeS Validation Engine

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-401 | Add `hapi-fhir-validation-resources-r4:7.2.1` to `pom.xml` | 30m | 🔴 | ☐ |
| T-402 | Download and bundle NRCeS StructureDefinition JSON snapshots from NRCeS IG | 3h | 🔴 | ☐ |
| T-403 | Register NRCeS profiles with `FhirValidator` using `PrePopulatedValidationSupport` | 2h | 🔴 | ☐ |
| T-404 | Implement `NRCeSValidatorService.validate(bundleJson)` → list of `ValidationIssue` | 3h | 🔴 | ☐ |
| T-405 | Map HAPI `ResultSeverityEnum` to FHIR `OperationOutcome.issue.severity` | 1h | 🔴 | ☐ |
| T-406 | Build `fix_hints` map for top 50 most common NRCeS validation errors | 4h | 🔴 | ☐ |
| T-407 | Persist all issues to `validation_results` table with `bundle_id` FK | 1h | 🔴 | ☐ |
| T-408 | Update `fhir_bundles.validation_status` = `VALID` or `INVALID` after validation | 30m | 🔴 | ☐ |
| T-409 | Implement `POST /api/v1/validate` — validate any arbitrary FHIR bundle JSON | 1h | 🟡 | ☐ |
| T-410 | Implement `GET /api/v1/validate/stats` — error frequency heatmap last 30 days | 2h | 🟡 | ☐ |
| T-411 | Write unit tests: known-invalid bundles assert expected error codes | 3h | 🟡 | ☐ |
| T-412 | Angular: Validation console with error list, severity badges, fix hint panel | 4h | 🟢 | ☐ |

---

## STEP 5 — HCX Gateway Dispatch

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-501 | Implement `HCXGatewayClient` using Spring WebClient (reactive, non-blocking) | 3h | 🔴 | ☐ |
| T-502 | Configure HCX endpoint URLs in `application.yml` (sandbox + production) | 30m | 🔴 | ☐ |
| T-503 | Add HCX protocol headers: `X-HCX-Sender-Code`, `X-HCX-Recipient-Code`, `X-HCX-Correlation-ID` | 1h | 🔴 | ☐ |
| T-504 | Implement JWE payload signing per HCX protocol specification | 4h | 🔴 | ☐ |
| T-505 | Handle `202 Accepted` response — persist `hcx_correlation_id` to `dispatch_log` | 1h | 🔴 | ☐ |
| T-506 | Implement async polling: `GET /v0.7/status/{correlationId}` every 30s | 2h | 🔴 | ☐ |
| T-507 | Implement Spring Retry with exponential backoff (2s → 4s → 8s, max 3 attempts) | 2h | 🟡 | ☐ |
| T-508 | Implement dead-letter: after 3 failures set `status=DEAD_LETTER` and trigger alert | 1h | 🟡 | ☐ |
| T-509 | Log every request/response body to `dispatch_log` with `http_status` and `attempt_no` | 1h | 🔴 | ☐ |
| T-510 | Implement `POST /api/v1/dispatch/{bundleId}` — trigger dispatch for a specific bundle | 1h | 🔴 | ☐ |
| T-511 | Implement `GET /api/v1/dispatch/{bundleId}/status` — poll dispatch status | 1h | 🟡 | ☐ |
| T-512 | Implement `POST /api/v1/dispatch/{bundleId}/retry` — manual retry | 1h | 🟢 | ☐ |
| T-513 | Write integration test against HCX sandbox with a valid bundle | 3h | 🟡 | ☐ |
| T-514 | Angular: Dispatch tracker table with correlation IDs, retry buttons, status badges | 3h | 🟢 | ☐ |

---

## STEP 6 — Angular Dashboard

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-601 | Set up Angular 17 routing with lazy-loaded modules per page | 2h | 🟡 | ☐ |
| T-602 | Create Angular HTTP services for all 6 API groups (Ingestion, Mapping, Conversion, Validate, Dispatch, Analytics) | 4h | 🟡 | ☐ |
| T-603 | Build Onboarding Wizard: upload → AI preview → confirm → save (4-step stepper) | 6h | 🔴 | ☐ |
| T-604 | Build Live Conversion Feed table with WebSocket real-time updates | 4h | 🟡 | ☐ |
| T-605 | Build Bundle Inspector with syntax-highlighted FHIR JSON viewer | 3h | 🟡 | ☐ |
| T-606 | Build Mapping Editor: YAML editor + live preview panel | 4h | 🟡 | ☐ |
| T-607 | Build Validation Console: error list, severity filter, fix hint drawer | 3h | 🟡 | ☐ |
| T-608 | Build Dispatch Tracker: submission status, HCX correlation IDs, retry controls | 3h | 🟡 | ☐ |
| T-609 | Add Spring WebSocket endpoint for real-time conversion status push | 2h | 🟢 | ☐ |
| T-610 | Make UI responsive (mobile-friendly for hospital tablet use) | 2h | 🟢 | ☐ |

---

## STEP 7 — Observability & Security

| # | Task | Effort | Priority | Status |
|---|---|---|---|---|
| T-701 | Add Spring Actuator + Micrometer Prometheus registry | 1h | 🟡 | ☐ |
| T-702 | Register custom metric: `nhcx.conversions.total` counter by bundle_type | 30m | 🟡 | ☐ |
| T-703 | Register custom metric: `nhcx.mapping.llm_calls` counter | 30m | 🟡 | ☐ |
| T-704 | Register custom metric: `nhcx.mapping.confidence_avg` gauge | 30m | 🟡 | ☐ |
| T-705 | Register custom metric: `nhcx.dispatch.latency` histogram | 30m | 🟡 | ☐ |
| T-706 | Configure MDC logging: inject `conversion_id` into every log line | 1h | 🟡 | ☐ |
| T-707 | Add Grafana dashboard JSON for all 5 custom metrics | 3h | 🟢 | ☐ |
| T-708 | Configure Spring Security with JWT authentication | 3h | 🔴 | ☐ |
| T-709 | Define 3 roles: `ROLE_HOSPITAL_ADMIN`, `ROLE_IT_OPERATOR`, `ROLE_VIEWER` | 1h | 🔴 | ☐ |
| T-710 | Move all secrets to environment variables — zero secrets in codebase | 1h | 🔴 | ☐ |
| T-711 | Add Bucket4j rate limiting: 100 requests/minute per source system | 2h | 🟡 | ☐ |

---

## Sprint Plan (13 Weeks)

| Sprint | Weeks | Tasks | Deliverable |
|---|---|---|---|
| Sprint 1 | W1–W2 | T-001 to T-016 | Running Spring Boot + MySQL + Docker |
| Sprint 2 | W3–W4 | T-101 to T-117 | HL7 / CSV / XML ingestion working |
| Sprint 3 | W5–W6 | T-201 to T-243 | AI Mapper (YAML + LLM + transforms) |
| Sprint 4 | W7 | T-230 to T-238 | SNOMED resolution working |
| Sprint 5 | W8–W9 | T-301 to T-316 | FHIR bundles generated and persisted |
| Sprint 6 | W10 | T-401 to T-412 | NRCeS validation with fix hints |
| Sprint 7 | W11 | T-501 to T-514 | HCX gateway dispatch + retry |
| Sprint 8 | W12 | T-601 to T-610 | Angular dashboard complete |
| Sprint 9 | W13 | T-701 to T-711 | Observability, security, final QA |

---

## Definition of Done

A task is **Done** when:
1. ✅ Code written and compiles with zero warnings
2. ✅ Unit test written and passing
3. ✅ Flyway migration (if DB change) applied and rolled back successfully
4. ✅ Endpoint tested via Postman/curl with real sample data
5. ✅ No secrets hardcoded — all via `application.yml` or env vars
6. ✅ `conversion_id` present in all log lines for the task's operation
7. ✅ PR reviewed and merged to `develop` branch

---

## File Structure Reference

```
src/main/java/in/gov/abdm/nhcx/
├── controller/
│   ├── IngestionController.java       (T-101)
│   ├── MappingController.java         (T-205, T-206, T-242)
│   ├── ConversionController.java      (T-305, T-308, T-309, T-314)
│   ├── ValidationController.java      (T-409, T-410)
│   └── DispatchController.java        (T-510, T-511, T-512)
├── service/
│   ├── ingestion/
│   │   ├── FormatDetectorService.java (T-102)
│   │   ├── HL7ParserService.java      (T-104 to T-107)
│   │   ├── CSVParserService.java      (T-108)
│   │   ├── XMLParserService.java      (T-109)
│   │   └── JSONParserService.java     (T-110)
│   ├── mapping/
│   │   ├── AIMappingService.java      (T-243)
│   │   ├── MappingProfileService.java (T-203, T-204)
│   │   ├── LLMSuggesterClient.java    (T-210 to T-218)
│   │   ├── TransformPipeline.java     (T-221)
│   │   ├── DateNormalizer.java        (T-222)
│   │   ├── SnomedLookupService.java   (T-231 to T-238)
│   │   └── MappingAuditService.java   (T-240, T-241)
│   ├── fhir/
│   │   ├── FHIRBundleService.java     (T-310)
│   │   ├── PatientBuilder.java        (T-303)
│   │   ├── CoverageBuilder.java       (T-304)
│   │   ├── CoverageEligibilityBuilder.java (T-305)
│   │   ├── ClaimBuilder.java          (T-308)
│   │   ├── ConditionBuilder.java      (T-306)
│   │   ├── ProcedureBuilder.java      (T-307)
│   │   └── CommunicationBuilder.java  (T-309)
│   ├── validation/
│   │   └── NRCeSValidatorService.java (T-404 to T-408)
│   └── dispatch/
│       ├── HCXGatewayClient.java      (T-501 to T-509)
│       └── RetryService.java          (T-507, T-508)
├── domain/entity/                     (T-009)
├── repository/                        (T-010)
└── config/
    ├── FhirConfig.java                (T-302)
    ├── CacheConfig.java               (T-204)
    └── SecurityConfig.java            (T-708)

src/main/resources/
├── application.yml                    (T-002)
├── db/migration/
│   ├── V1__init_schema.sql            (T-007)
│   ├── V2__mapping_audit_table.sql    (T-008)
│   └── V3__seed_code_translations.sql (T-238)
├── mappings/
│   ├── hl7_adt_coverage.yaml          (T-207)
│   ├── csv_claim.yaml                 (T-207)
│   └── xml_communication.yaml        (T-207)
└── nrces-profiles/                    (T-402)
```