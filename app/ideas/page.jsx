"use client"

import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   NHCX × HEALTHBRIDGE — IIT Hyderabad Hackathon Presentation
   Premium CTO-ready pitch deck as interactive React SPA
   Aesthetic: Luxury dark enterprise — obsidian + electric teal + gold
═══════════════════════════════════════════════════════════════════ */

const T = {
  bg: "#060B14",
  surface: "#0C1525",
  card: "#101C35",
  cardHover: "#152240",
  border: "#1A2E52",
  borderBright: "#2A4A80",
  teal: "#00C9B1",
  tealDim: "rgba(0,201,177,0.12)",
  tealGlow: "rgba(0,201,177,0.25)",
  gold: "#F5C842",
  goldDim: "rgba(245,200,66,0.1)",
  blue: "#3B82F6",
  blueDim: "rgba(59,130,246,0.12)",
  violet: "#8B5CF6",
  violetDim: "rgba(139,92,246,0.12)",
  rose: "#F43F5E",
  roseDim: "rgba(244,63,94,0.1)",
  green: "#10B981",
  greenDim: "rgba(16,185,129,0.12)",
  amber: "#F59E0B",
  text: "#E2EEFF",
  textMid: "#7A9CC8",
  textDim: "#3A5880",
  white: "#FFFFFF",
};

const injectStyles = () => {
  if (document.getElementById("hb-styles")) return;
  const s = document.createElement("style");
  s.id = "hb-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: ${T.bg}; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: ${T.surface}; }
    ::-webkit-scrollbar-thumb { background: ${T.teal}; border-radius: 2px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:0.6;} 50%{transform:scale(1.18);opacity:0.2;} }
    @keyframes flowDot { 0%{transform:translateX(0);opacity:1;} 100%{transform:translateX(180px);opacity:0;} }
    @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
    @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
    @keyframes countUp { from{opacity:0;transform:scale(0.7);} to{opacity:1;transform:scale(1);} }
    .fade-up { animation: fadeUp 0.6s ease both; }
    .fade-up-1 { animation: fadeUp 0.6s 0.1s ease both; }
    .fade-up-2 { animation: fadeUp 0.6s 0.2s ease both; }
    .fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }
    .card-hover { transition: all 0.25s ease; cursor:pointer; }
    .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 60px rgba(0,201,177,0.12); }
    .btn-primary { transition: all 0.2s; }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(0,201,177,0.3); }
    .nav-link { transition: all 0.2s; }
    .nav-link:hover { color: ${T.teal} !important; }
    .solution-tab { transition: all 0.2s; }
    .solution-tab:hover { border-color: rgba(0,201,177,0.4) !important; }
    .metric-num { animation: countUp 0.5s ease both; }
    .flow-line { position:relative; overflow:hidden; }
  `;
  document.head.appendChild(s);
};

/* ── MOCK DATA ─────────────────────────────────────────────────── */

const SOLUTIONS = [
  {
    id: "sol1",
    num: "01",
    tag: "UNIVERSAL BRIDGE",
    name: "HealthBridge",
    subtitle: "AI-Powered Legacy → FHIR Conversion Engine",
    tagline: "Zero-code hospital onboarding in under 20 minutes",
    color: T.teal,
    colorDim: T.tealDim,
    icon: "⬡",
    gradient: "linear-gradient(135deg, rgba(0,201,177,0.15) 0%, rgba(59,130,246,0.08) 100%)",
    problem: "85% of India's 70,000 hospitals run legacy HMIS that cannot speak NHCX. Custom integration costs ₹15–25 lakhs and takes 3–6 months. Smaller hospitals simply never integrate.",
    gap: [
      "Static, hardcoded HL7→FHIR adapters per vendor",
      "No AI assistance for unknown field mapping",
      "Unidirectional only — legacy → FHIR, never back",
      "No validation before HCX submission",
      "Zero observability into conversion failures",
    ],
    uniqueness: [
      { icon: "🧠", title: "AI Mapping Suggester", desc: "Upload any CSV/HL7 file. LLM suggests FHIR field mappings with confidence scores. Human confirms. Profile saved." },
      { icon: "⇄", title: "Bi-directional Flow", desc: "FHIR ClaimResponse → HL7 DFT back to legacy system. The missing half every other team ignores." },
      { icon: "🔥", title: "Hot-Reload Profiles", desc: "YAML mapping configs update live. No deployment. Hospital upgrades their HMIS — they update one file." },
      { icon: "📊", title: "Ecosystem Intelligence", desc: "Anonymized error heatmaps across all hospitals. NRCeS gets data to improve NHCX profiles themselves." },
    ],
    fhirFlow: [
      { label: "Legacy HMIS", sub: "HL7 v2.x / CSV / XML", color: T.textDim },
      { label: "Ingest API", sub: "Spring Boot Controller", color: T.blue },
      { label: "AI Mapper", sub: "LLM + YAML Profile", color: T.violet },
      { label: "FHIR Builder", sub: "HAPI FHIR R4", color: T.teal },
      { label: "NRCeS Validator", sub: "StructureDefinitions", color: T.amber },
      { label: "HCX Gateway", sub: "NHCX Protocol v0.7", color: T.green },
    ],
    architecture: [
      { layer: "Angular UI", items: ["Onboarding Wizard", "Mapping Editor", "Live Dashboard"], color: T.violet },
      { layer: "Spring Boot API", items: ["Ingestion Controller", "AI Mapping Service", "FHIR Builder", "Retry Engine"], color: T.teal },
      { layer: "MySQL 8.0", items: ["raw_messages", "mapping_profiles", "fhir_bundles", "dispatch_log"], color: T.blue },
      { layer: "Integrations", items: ["HCX Gateway", "ABHA Registry", "SNOMED CT", "UMLS API"], color: T.amber },
    ],
    impact: [
      { who: "Hospitals", metric: "95%", label: "Reduction in integration cost", color: T.teal },
      { who: "Patients", metric: "3×", label: "Faster claim processing", color: T.gold },
      { who: "Insurers", metric: "₹0", label: "Claim format rejections", color: T.green },
      { who: "Govt/ABDM", metric: "70K", label: "Hospitals reachable overnight", color: T.blue },
    ],
    techStack: ["Spring Boot 3.3", "Angular 17", "MySQL 8.0", "HAPI FHIR R4", "Java 17", "OpenAI API", "Flyway", "Docker", "Prometheus"],
    demoStory: "A hospital IT coordinator in Warangal uploads their 2012 HMIS export CSV. In 4 minutes: AI suggests all field mappings, bundle validates against NRCeS profiles, dispatches to HCX sandbox, correlation ID received. Total cost: ₹0.",
  },
  {
    id: "sol2",
    num: "02",
    tag: "PATIENT SOVEREIGNTY",
    name: "ConsentChain",
    subtitle: "ABHA-Native Patient Consent & Claims Portal",
    tagline: "Patients control their health data — not hospitals, not insurers",
    color: T.gold,
    colorDim: T.goldDim,
    icon: "◎",
    gradient: "linear-gradient(135deg, rgba(245,200,66,0.12) 0%, rgba(244,63,94,0.06) 100%)",
    problem: "Patients have zero visibility into their insurance claims journey. Consent is a physical form signed blindly. Pre-auth delays kill critical care. ABHA IDs go unused for their intended purpose.",
    gap: [
      "No real-time claim status for patients",
      "Pre-auth approvals take 24–72 hours via phone/fax",
      "Consent collected on paper, not digitally auditable",
      "ABHA linked but never actually queried in workflows",
      "Patients cannot dispute rejections with evidence",
    ],
    uniqueness: [
      { icon: "📱", title: "ABHA-Linked PWA", desc: "Patient scans ABHA QR at admission. Instantly sees all active coverages, pre-auth status, claim history on their phone." },
      { icon: "⚡", title: "Real-time Pre-Auth", desc: "CoverageEligibilityRequest fires on admission. AI pre-scores likelihood. Average approval: 4 minutes vs 48 hours." },
      { icon: "🔐", title: "Digital Consent Ledger", desc: "Every data access logged as FHIR AuditEvent. Patient can revoke consent. Fully auditable by regulator." },
      { icon: "💬", title: "AI Claims Assistant", desc: "WhatsApp/SMS bot answers 'Why was my claim rejected?' in plain Hindi/Telugu. No call centre." },
    ],
    fhirFlow: [
      { label: "Patient ABHA", sub: "QR / MPIN auth", color: T.textDim },
      { label: "ABHA Registry", sub: "Identity resolution", color: T.blue },
      { label: "Coverage Check", sub: "CoverageEligibilityReq", color: T.gold },
      { label: "Consent Service", sub: "FHIR Consent resource", color: T.violet },
      { label: "Claim Bundle", sub: "HCXClaim + AuditEvent", color: T.teal },
      { label: "Patient Portal", sub: "Real-time status", color: T.green },
    ],
    architecture: [
      { layer: "Patient PWA", items: ["ABHA QR Login", "Claim Tracker", "Consent Manager", "AI Chat Bot"], color: T.gold },
      { layer: "Spring Boot API", items: ["ABHA Auth Service", "Consent Engine", "Pre-Auth Scorer", "Notification Service"], color: T.teal },
      { layer: "MySQL 8.0", items: ["consent_records", "claim_status", "audit_events", "patient_sessions"], color: T.blue },
      { layer: "Integrations", items: ["ABHA Registry", "HCX Gateway", "WhatsApp API", "SMS Gateway"], color: T.rose },
    ],
    impact: [
      { who: "Patients", metric: "4 min", label: "Pre-auth approval (vs 48hr)", color: T.gold },
      { who: "Hospitals", metric: "60%", label: "Less admin staff time", color: T.teal },
      { who: "Insurers", metric: "40%", label: "Fraud reduction via audit trail", color: T.green },
      { who: "Regulators", metric: "100%", label: "Digital consent auditability", color: T.blue },
    ],
    techStack: ["Spring Boot 3.3", "Angular 17 + PWA", "MySQL 8.0", "HAPI FHIR R4", "ABHA SDK", "WhatsApp Cloud API", "JWT + OAuth2", "Redis Cache"],
    demoStory: "Patient Ananya is admitted for surgery. Her ABHA QR is scanned at the counter. Her phone pings — pre-auth request sent. She reviews the procedure details, taps 'Consent'. 4 minutes later, approval received. She tracks every rupee of her claim from her phone, in Telugu.",
  },
  {
    id: "sol3",
    num: "03",
    tag: "ECOSYSTEM INTELLIGENCE",
    name: "NHCXPulse",
    subtitle: "National Claims Analytics & Anomaly Detection Engine",
    tagline: "The nervous system India's healthcare ecosystem never had",
    color: T.violet,
    colorDim: T.violetDim,
    icon: "◉",
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(0,201,177,0.06) 100%)",
    problem: "ABDM has data flowing through NHCX but zero aggregate intelligence. Hospitals don't know their rejection patterns. Insurers can't detect fraud rings. NRCeS can't see which profile fields cause most failures. Everyone is blind.",
    gap: [
      "No cross-hospital conversion failure analytics",
      "Fraud detection is manual, delayed by months",
      "NRCeS profile improvements are anecdote-driven",
      "Hospitals don't know they're being underpaid",
      "No benchmark: am I performing better than peers?",
    ],
    uniqueness: [
      { icon: "🔍", title: "Profile Drift Detector", desc: "When NRCeS releases a new IG version, automatically flags all mapping profiles that will break. Zero surprise rejections." },
      { icon: "🤖", title: "ML Fraud Scorer", desc: "Claim patterns scored in real-time. Unusual billing codes, duplicate diagnoses, implausible procedure combos flagged before submission." },
      { icon: "📡", title: "Ecosystem Heatmap", desc: "Which hospitals fail which FHIR fields most. Which insurers reject most claims. Which procedure codes are ambiguous. All live." },
      { icon: "📈", title: "Hospital Benchmarking", desc: "Your claim approval rate vs anonymized national average. Your avg pre-auth time vs cohort. Actionable, not vanity metrics." },
    ],
    fhirFlow: [
      { label: "All Hospitals", sub: "Anonymized events", color: T.textDim },
      { label: "Event Stream", sub: "Spring Kafka / Queue", color: T.violet },
      { label: "ML Pipeline", sub: "Anomaly + Fraud Score", color: T.rose },
      { label: "Analytics DB", sub: "MySQL partitioned", color: T.blue },
      { label: "NRCeS Dashboard", sub: "Profile improvement data", color: T.amber },
      { label: "Hospital Portal", sub: "Benchmarks + Alerts", color: T.green },
    ],
    architecture: [
      { layer: "Angular Dashboards", items: ["Hospital Analytics", "NRCeS Admin", "Fraud Alert Console", "Benchmark Portal"], color: T.violet },
      { layer: "Spring Boot + ML", items: ["Event Aggregator", "Fraud ML Service", "Drift Detector", "Benchmark Engine"], color: T.teal },
      { layer: "MySQL 8.0 (Partitioned)", items: ["claim_events", "fraud_scores", "profile_versions", "benchmark_cohorts"], color: T.blue },
      { layer: "External", items: ["NRCeS IG Registry", "NHCX Event Bus", "Python ML Models", "Grafana Export"], color: T.rose },
    ],
    impact: [
      { who: "Hospitals", metric: "₹2.3Cr", label: "Avg recovered underpayments/yr", color: T.violet },
      { who: "Insurers", metric: "67%", label: "Fraud detection before payout", color: T.rose },
      { who: "NRCeS", metric: "Data-driven", label: "Profile improvement cycle", color: T.gold },
      { who: "ABDM", metric: "1 dashboard", label: "Full ecosystem visibility", color: T.teal },
    ],
    techStack: ["Spring Boot 3.3", "Angular 17", "MySQL 8.0 Partitioned", "HAPI FHIR R4", "Python ML (scikit-learn)", "Apache Kafka", "Grafana", "Docker + K8s"],
    demoStory: "NRCeS releases NHCX IG v0.8. NHCXPulse immediately scans all 847 active mapping profiles across connected hospitals. 134 profiles will break on the new 'serviceType' required field. Automated alerts sent. Zero hospitals submit a broken bundle. The ecosystem self-heals.",
  },
];

const WHY_WIN = [
  { icon: "🎯", title: "Not a converter — infrastructure", desc: "We built the connective tissue of India's digital health ecosystem, not another HL7 parser.", color: T.teal },
  { icon: "🧠", title: "AI where it matters", desc: "Not AI for AI's sake. AI precisely where human bottlenecks exist: mapping unknown fields and answering patient queries.", color: T.violet },
  { icon: "↔️", title: "The missing half", desc: "Bi-directional FHIR ⇄ Legacy conversion. Every other team goes one way. We close the loop.", color: T.gold },
  { icon: "📱", title: "Patient-first sovereignty", desc: "ABHA IDs as real identity, not placeholder. Patients in control. Consent digitally auditable.", color: T.rose },
  { icon: "🔭", title: "Ecosystem intelligence", desc: "The only team generating insights that improve NHCX profiles themselves. We feed back to the standard.", color: T.blue },
  { icon: "🏗️", title: "IIT-level architecture", desc: "Spring Boot + Angular + MySQL + HAPI FHIR + Kafka + ML. Production-grade, not prototype-grade.", color: T.amber },
];

const NAV_ITEMS = ["Overview", "Solution 1", "Solution 2", "Solution 3", "Architecture", "Why We Win"];

/* ── MICRO COMPONENTS ──────────────────────────────────────────── */

function Badge({ children, color, small }) {
  return (
    <span style={{
      display: "inline-block",
      padding: small ? "2px 8px" : "4px 12px",
      borderRadius: "3px",
      fontSize: small ? "9px" : "10px",
      fontWeight: 700,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      background: `${color}18`,
      border: `1px solid ${color}40`,
      color: color,
      fontFamily: "'DM Sans', sans-serif",
    }}>{children}</span>
  );
}

function Divider({ color }) {
  return <div style={{ width: "100%", height: "1px", background: color ? `${color}30` : T.border, margin: "0" }} />;
}

function SectionTitle({ eyebrow, title, subtitle, color, center }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: "48px" }} className="fade-up">
      {eyebrow && (
        <div style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: color || T.teal, marginBottom: "12px", fontFamily: "'DM Sans', sans-serif" }}>
          {eyebrow}
        </div>
      )}
      <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: T.text, lineHeight: 1.15, marginBottom: "16px" }}>
        {title}
      </h2>
      {subtitle && <p style={{ fontSize: "16px", color: T.textMid, maxWidth: center ? "620px" : "none", margin: center ? "0 auto" : "0", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>{subtitle}</p>}
    </div>
  );
}

function GlowCard({ children, color, style, onClick, className }) {
  return (
    <div
      onClick={onClick}
      className={`card-hover ${className || ""}`}
      style={{
        background: T.card,
        border: `1px solid ${color ? `${color}30` : T.border}`,
        borderRadius: "12px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        boxShadow: color ? `0 0 0 0 ${color}` : "none",
        ...style,
      }}
    >
      {color && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }} />
      )}
      {children}
    </div>
  );
}

function FlowDiagram({ steps, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", overflowX: "auto", padding: "8px 0 16px" }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div style={{
            background: `${step.color}15`,
            border: `1px solid ${step.color}40`,
            borderRadius: "8px",
            padding: "10px 16px",
            textAlign: "center",
            minWidth: "120px",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: step.color, fontFamily: "'DM Sans',sans-serif" }}>{step.label}</div>
            <div style={{ fontSize: "10px", color: T.textMid, marginTop: "3px", fontFamily: "'DM Sans',sans-serif" }}>{step.sub}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
              <div style={{ width: "32px", height: "1px", background: `linear-gradient(90deg, ${step.color}60, ${steps[i+1].color}60)`, position: "relative" }}>
                <div style={{ position: "absolute", right: "0", top: "-3px", color: steps[i+1].color, fontSize: "8px" }}>▶</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ImpactMetric({ metric, label, who, color }) {
  return (
    <GlowCard color={color} style={{ textAlign: "center", padding: "28px 20px" }}>
      <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: T.textMid, marginBottom: "12px", fontFamily: "'DM Sans',sans-serif" }}>{who}</div>
      <div style={{ fontSize: "clamp(28px,3vw,38px)", fontWeight: 800, color: color, fontFamily: "'Syne',sans-serif", lineHeight: 1, marginBottom: "8px" }} className="metric-num">{metric}</div>
      <div style={{ fontSize: "12px", color: T.textMid, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>{label}</div>
    </GlowCard>
  );
}

function ArchLayer({ layer, color }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${color}`,
      borderRadius: "8px",
      padding: "16px 20px",
    }}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: color, marginBottom: "10px", fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>{layer.layer}</div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {layer.items.map((item, i) => (
          <div key={i} style={{
            padding: "4px 10px",
            background: `${color}10`,
            border: `1px solid ${color}25`,
            borderRadius: "4px",
            fontSize: "11px",
            color: T.textMid,
            fontFamily: "'DM Sans',sans-serif",
          }}>{item}</div>
        ))}
      </div>
    </div>
  );
}

function TechPill({ name }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "5px 12px",
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: "20px",
      fontSize: "11px",
      color: T.textMid,
      fontFamily: "'DM Sans',sans-serif",
    }}>{name}</span>
  );
}

/* ── PAGES ─────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section id="overview" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", padding: "100px 60px 60px", overflow: "hidden" }}>
      {/* Background orbs */}
      <div style={{ position: "absolute", top: "10%", right: "5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,201,177,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "0%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", left: "40%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,200,66,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        {/* Event badge */}
        <div className="fade-up" style={{ display: "flex", gap: "12px", marginBottom: "32px", alignItems: "center", flexWrap: "wrap" }}>
          <Badge color={T.teal}>IIT Hyderabad Hackathon 2025</Badge>
          <Badge color={T.gold}>Healthcare Innovation Track</Badge>
          <Badge color={T.violet}>NHCX × ABDM × FHIR R4</Badge>
        </div>

        {/* Title */}
        <div className="fade-up-1">
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(42px,6vw,80px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-1px",
            color: T.text,
            marginBottom: "24px",
          }}>
            <span style={{ color: T.teal }}>HealthBridge</span><br />
            <span style={{ color: T.textMid, fontSize: "0.65em", fontWeight: 400 }}>× NHCXPulse × ConsentChain</span>
          </h1>
          <p style={{
            fontSize: "clamp(16px,1.8vw,20px)",
            color: T.textMid,
            maxWidth: "640px",
            lineHeight: 1.75,
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: "40px",
          }}>
            Three interlocking solutions that don't just solve the legacy-to-FHIR problem —<br />
            they become the <strong style={{ color: T.text }}>connective tissue of India's digital health future.</strong>
          </p>
        </div>

        {/* CTA row */}
        <div className="fade-up-2" style={{ display: "flex", gap: "16px", marginBottom: "80px", flexWrap: "wrap" }}>
          {SOLUTIONS.map(s => (
            <button key={s.id} className="btn-primary" onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })} style={{
              background: `${s.color}15`,
              border: `1px solid ${s.color}50`,
              borderRadius: "8px",
              padding: "12px 24px",
              color: s.color,
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{ fontSize: "16px" }}>{s.icon}</span> {s.name}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="fade-up-3" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px" }}>
          {[
            { num: "70,000", label: "Hospitals to reach", color: T.teal },
            { num: "₹0", label: "Integration cost", color: T.gold },
            { num: "4 min", label: "Pre-auth (was 48hr)", color: T.violet },
            { num: "3×", label: "Faster claim closure", color: T.rose },
          ].map((s, i) => (
            <div key={i} style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "10px",
              padding: "20px",
              borderTop: `2px solid ${s.color}`,
            }}>
              <div style={{ fontSize: "clamp(22px,2.5vw,30px)", fontWeight: 800, color: s.color, fontFamily: "'Syne',sans-serif" }}>{s.num}</div>
              <div style={{ fontSize: "12px", color: T.textMid, marginTop: "6px", fontFamily: "'DM Sans',sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection({ sol }) {
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = ["overview", "fhir flow", "architecture", "impact"];

  return (
    <section id={sol.id} style={{ padding: "100px 60px", borderTop: `1px solid ${T.border}`, position: "relative", overflow: "hidden" }}>
      {/* BG gradient */}
      <div style={{ position: "absolute", inset: 0, background: sol.gradient, pointerEvents: "none" }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "24px" }}>
          <div className="fade-up">
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
              <span style={{ fontSize: "40px", color: sol.color }}>{sol.icon}</span>
              <div>
                <Badge color={sol.color}>{sol.tag}</Badge>
                <div style={{ fontSize: "10px", color: T.textDim, letterSpacing: "3px", marginTop: "6px", fontFamily: "'DM Sans',sans-serif" }}>SOLUTION {sol.num} OF 3</div>
              </div>
            </div>
            <h2 style={{ fontSize: "clamp(30px,4vw,52px)", fontWeight: 800, fontFamily: "'Syne',sans-serif", color: T.text, lineHeight: 1.1, marginBottom: "8px" }}>
              {sol.name}
            </h2>
            <div style={{ fontSize: "18px", color: sol.color, fontFamily: "'DM Sans',sans-serif", marginBottom: "8px" }}>{sol.subtitle}</div>
            <div style={{ fontSize: "14px", color: T.textMid, fontStyle: "italic", fontFamily: "'DM Sans',sans-serif" }}>"{sol.tagline}"</div>
          </div>
          {/* Problem card */}
          <div style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderLeft: `3px solid ${sol.color}`,
            borderRadius: "10px",
            padding: "20px 24px",
            maxWidth: "380px",
          }}>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: sol.color, marginBottom: "10px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>THE PROBLEM</div>
            <p style={{ fontSize: "13px", color: T.textMid, lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>{sol.problem}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "32px", background: T.surface, padding: "4px", borderRadius: "10px", width: "fit-content" }}>
          {tabs.map(tab => (
            <button key={tab} className="solution-tab" onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? `${sol.color}20` : "transparent",
              border: `1px solid ${activeTab === tab ? sol.color : "transparent"}`,
              borderRadius: "7px",
              padding: "8px 18px",
              color: activeTab === tab ? sol.color : T.textDim,
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              textTransform: "capitalize",
              letterSpacing: "0.5px",
            }}>{tab}</button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div>
            {/* Gaps */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
              <div>
                <div style={{ fontSize: "11px", letterSpacing: "2px", color: T.rose, marginBottom: "14px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>CURRENT GAPS IN LEGACY HMIS</div>
                {sol.gap.map((g, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ color: T.rose, fontSize: "14px", marginTop: "1px" }}>✕</span>
                    <span style={{ fontSize: "13px", color: T.textMid, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>{g}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: "11px", letterSpacing: "2px", color: sol.color, marginBottom: "14px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>WHAT MAKES US DIFFERENT</div>
                {sol.uniqueness.map((u, i) => (
                  <GlowCard key={i} color={sol.color} style={{ marginBottom: "12px", padding: "16px 18px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "20px" }}>{u.icon}</span>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: "4px", fontFamily: "'DM Sans',sans-serif" }}>{u.title}</div>
                        <div style={{ fontSize: "12px", color: T.textMid, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>{u.desc}</div>
                      </div>
                    </div>
                  </GlowCard>
                ))}
              </div>
            </div>
            {/* Demo story */}
            <div style={{
              background: `${sol.color}08`,
              border: `1px solid ${sol.color}30`,
              borderRadius: "10px",
              padding: "20px 24px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}>
              <span style={{ fontSize: "24px" }}>🎬</span>
              <div>
                <div style={{ fontSize: "11px", letterSpacing: "2px", color: sol.color, marginBottom: "8px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>DEMO STORY (HACKATHON PITCH)</div>
                <p style={{ fontSize: "14px", color: T.text, lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>{sol.demoStory}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "fhir flow" && (
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: sol.color, marginBottom: "20px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>DATA FLOW: LEGACY → FHIR R4 → NHCX HCX GATEWAY</div>
            <GlowCard color={sol.color} style={{ padding: "32px 28px", marginBottom: "28px" }}>
              <FlowDiagram steps={sol.fhirFlow} color={sol.color} />
            </GlowCard>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
              {sol.fhirFlow.map((step, i) => (
                <div key={i} style={{
                  background: T.surface,
                  border: `1px solid ${step.color}30`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "10px", color: step.color, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>STEP {i + 1}</span>
                    <div style={{ flex: 1, height: "1px", background: `${step.color}20` }} />
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: step.color, fontFamily: "'DM Sans',sans-serif", marginBottom: "3px" }}>{step.label}</div>
                  <div style={{ fontSize: "11px", color: T.textMid, fontFamily: "'DM Sans',sans-serif" }}>{step.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "architecture" && (
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: sol.color, marginBottom: "20px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>SYSTEM ARCHITECTURE — SPRING BOOT + ANGULAR + MYSQL</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "28px" }}>
              {sol.architecture.map((layer, i) => (
                <ArchLayer key={i} layer={layer} color={layer.color} />
              ))}
            </div>
            <div style={{ marginTop: "8px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", color: T.textDim, marginBottom: "12px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>TECH STACK</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {sol.techStack.map((t, i) => <TechPill key={i} name={t} />)}
              </div>
            </div>
          </div>
        )}

        {activeTab === "impact" && (
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: sol.color, marginBottom: "20px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>MEASURABLE IMPACT — HOSPITALS · PATIENTS · INSURERS · GOVT</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
              {sol.impact.map((imp, i) => (
                <ImpactMetric key={i} {...imp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section id="architecture" style={{ padding: "100px 60px", borderTop: `1px solid ${T.border}`, background: T.surface }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <SectionTitle
          eyebrow="End-to-End Technical Blueprint"
          title="Unified Platform Architecture"
          subtitle="How all three solutions plug together into a single deployable platform on Spring Boot + Angular + MySQL."
          color={T.blue}
          center
        />

        {/* Master flow */}
        <GlowCard color={T.blue} style={{ marginBottom: "40px", padding: "36px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "2px", color: T.blue, marginBottom: "24px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>MASTER DATA FLOW — FULL PLATFORM</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                label: "INPUT LAYER",
                items: ["HL7 v2.x (ADT/DFT/ORU)", "CSV / XML Flat Files", "REST / DB Dump", "ABHA QR Scan"],
                color: T.textDim,
                arrow: "↓"
              },
              {
                label: "INGESTION + AI MAPPING (HealthBridge)",
                items: ["HL7 Parser (HAPI HL7v2)", "AI Mapping Suggester (LLM)", "Hot-Reload YAML Profiles", "Source System Registry"],
                color: T.teal,
                arrow: "↓"
              },
              {
                label: "FHIR BUILDER CORE",
                items: ["CoverageEligibilityBuilder", "ClaimBuilder", "CommunicationBuilder", "HAPI FHIR R4 Bundle Factory"],
                color: T.blue,
                arrow: "↓"
              },
              {
                label: "CONSENT + PATIENT LAYER (ConsentChain)",
                items: ["ABHA Identity Service", "Consent Engine (FHIR Consent)", "Pre-Auth Scorer", "Patient PWA"],
                color: T.gold,
                arrow: "↓"
              },
              {
                label: "VALIDATION + DISPATCH",
                items: ["NRCeS Validator (StructureDefinitions)", "OperationOutcome Reporter", "HCX Gateway Client", "Spring Retry + Dead-Letter"],
                color: T.amber,
                arrow: "↓"
              },
              {
                label: "ANALYTICS + INTELLIGENCE (NHCXPulse)",
                items: ["Anonymized Event Stream", "ML Fraud Scorer", "Profile Drift Detector", "Hospital Benchmark Engine"],
                color: T.violet,
                arrow: null
              },
            ].map((row, i) => (
              <div key={i}>
                <div style={{
                  background: `${row.color}10`,
                  border: `1px solid ${row.color}30`,
                  borderRadius: "8px",
                  padding: "14px 20px",
                }}>
                  <div style={{ fontSize: "10px", letterSpacing: "2px", color: row.color, marginBottom: "10px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>{row.label}</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {row.items.map((item, j) => (
                      <div key={j} style={{
                        padding: "4px 10px",
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: "4px",
                        fontSize: "11px",
                        color: T.textMid,
                        fontFamily: "'DM Sans',sans-serif",
                      }}>{item}</div>
                    ))}
                  </div>
                </div>
                {row.arrow && (
                  <div style={{ textAlign: "center", color: T.textDim, fontSize: "20px", padding: "4px 0" }}>
                    {row.arrow}
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlowCard>

        {/* Cross-cutting concerns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
          {[
            {
              title: "Security & Consent",
              color: T.rose,
              items: [
                "JWT + OAuth2 (Spring Security)",
                "FHIR AuditEvent for every access",
                "Patient-controlled consent revocation",
                "HCX JWE signed payloads",
                "Role-based access (Admin/Doctor/Patient)",
              ]
            },
            {
              title: "Data Consistency",
              color: T.amber,
              items: [
                "MySQL InnoDB transactions (ACID)",
                "Flyway version-controlled migrations",
                "Idempotent conversion IDs (UUID)",
                "Optimistic locking on mapping profiles",
                "Event sourcing for claim state machine",
              ]
            },
            {
              title: "Scalability",
              color: T.teal,
              items: [
                "Stateless Spring Boot (horizontal scale)",
                "HikariCP connection pooling",
                "Caffeine L1 + Redis L2 cache",
                "MySQL 8 partitioned analytics tables",
                "Docker + Kubernetes Helm chart",
              ]
            },
          ].map((card, i) => (
            <GlowCard key={i} color={card.color} style={{ padding: "22px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: card.color, marginBottom: "14px", letterSpacing: "1px", fontFamily: "'Syne',sans-serif" }}>{card.title.toUpperCase()}</div>
              {card.items.map((item, j) => (
                <div key={j} style={{ display: "flex", gap: "8px", padding: "7px 0", borderBottom: j < card.items.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ color: card.color, fontSize: "12px" }}>✓</span>
                  <span style={{ fontSize: "12px", color: T.textMid, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>{item}</span>
                </div>
              ))}
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyWeWinSection() {
  return (
    <section id="whywewin" style={{ padding: "100px 60px", borderTop: `1px solid ${T.border}`, position: "relative", overflow: "hidden" }}>
      {/* dramatic bg */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,201,177,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <SectionTitle
          eyebrow="Why We Win"
          title="The Bridge India's Healthcare Was Waiting For"
          color={T.gold}
          center
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", marginBottom: "60px" }}>
          {WHY_WIN.map((item, i) => (
            <GlowCard key={i} color={item.color} className="card-hover" style={{ padding: "28px 24px" }}>
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>{item.icon}</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: item.color, marginBottom: "10px", fontFamily: "'Syne',sans-serif" }}>{item.title}</div>
              <p style={{ fontSize: "13px", color: T.textMid, lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>{item.desc}</p>
            </GlowCard>
          ))}
        </div>

        {/* Closing statement */}
        <div style={{
          background: `linear-gradient(135deg, ${T.tealDim}, rgba(245,200,66,0.06), ${T.violetDim})`,
          border: `1px solid ${T.borderBright}`,
          borderRadius: "16px",
          padding: "48px 56px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${T.teal}, ${T.gold}, ${T.violet})` }} />
          <div style={{ fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase", color: T.teal, marginBottom: "20px", fontFamily: "'DM Sans',sans-serif" }}>Our One-Line Pitch</div>
          <blockquote style={{
            fontSize: "clamp(18px,2.5vw,26px)",
            fontWeight: 700,
            fontFamily: "'Syne',sans-serif",
            color: T.text,
            lineHeight: 1.4,
            marginBottom: "24px",
            fontStyle: "italic",
          }}>
            "We didn't build a FHIR converter —<br />
            <span style={{ color: T.teal }}>we built the bridge that connects 70,000 hospitals</span><br />
            to India's digital health future, and we're giving it away free."
          </blockquote>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Badge color={T.teal}>Spring Boot 3.3</Badge>
            <Badge color={T.gold}>Angular 17</Badge>
            <Badge color={T.blue}>MySQL 8.0</Badge>
            <Badge color={T.violet}>HAPI FHIR R4</Badge>
            <Badge color={T.rose}>NHCX Protocol v0.7</Badge>
            <Badge color={T.amber}>Apache 2.0 OSS</Badge>
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ marginTop: "48px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: T.textDim, textAlign: "center", marginBottom: "24px", fontFamily: "'DM Sans',sans-serif" }}>HOW WE COMPARE — US vs TYPICAL HACKATHON TEAM</div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", overflow: "hidden" }}>
            {[
              { aspect: "Conversion Direction", them: "Legacy → FHIR only", us: "Bi-directional: FHIR ↔ Legacy", win: true },
              { aspect: "Mapping Method", them: "Hardcoded static maps", us: "AI-suggested + hot-reload YAML", win: true },
              { aspect: "Patient Access", them: "Backend API only", us: "ABHA-native PWA + AI chatbot", win: true },
              { aspect: "Validation", them: "Basic schema check", us: "Full NRCeS profile + fix hints + audit", win: true },
              { aspect: "Analytics", them: "None", us: "Ecosystem heatmap + fraud ML + benchmarks", win: true },
              { aspect: "Onboarding Time", them: "3–6 months custom work", us: "20-minute self-serve wizard", win: true },
            ].map((row, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr 1.2fr",
                padding: "14px 24px",
                borderBottom: i < 5 ? `1px solid ${T.border}` : "none",
                alignItems: "center",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
              }}>
                <div style={{ fontSize: "12px", color: T.textMid, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{row.aspect}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: T.rose, fontSize: "12px" }}>✕</span>
                  <span style={{ fontSize: "12px", color: T.textDim, fontFamily: "'DM Sans',sans-serif" }}>{row.them}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: T.green, fontSize: "12px" }}>✓</span>
                  <span style={{ fontSize: "12px", color: T.text, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{row.us}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team call-to-action */}
        <div style={{ textAlign: "center", marginTop: "60px" }}>
          <div style={{ fontSize: "13px", color: T.textMid, fontFamily: "'DM Sans',sans-serif", marginBottom: "8px" }}>Built for India. Designed for scale. Open for everyone.</div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'Syne',sans-serif", color: T.teal }}>Let's ship the future of healthcare. 🚀</div>
        </div>
      </div>
    </section>
  );
}

/* ── NAV ───────────────────────────────────────────────────────── */

function Nav({ activeSection }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const navMap = {
    "Overview": "overview",
    "Solution 1": "sol1",
    "Solution 2": "sol2",
    "Solution 3": "sol3",
    "Architecture": "architecture",
    "Why We Win": "whywewin",
  };

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: "rgba(6,11,20,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${T.border}`,
      padding: "0 40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "60px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'Syne',sans-serif", color: T.teal }}>HealthBridge</span>
        <span style={{ fontSize: "11px", color: T.textDim, fontFamily: "'DM Sans',sans-serif" }}>× NHCXPulse × ConsentChain</span>
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {NAV_ITEMS.map(item => (
          <button key={item} className="nav-link" onClick={() => scrollTo(navMap[item])} style={{
            background: "none",
            border: "none",
            color: T.textMid,
            fontSize: "12px",
            padding: "8px 14px",
            cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: 500,
            borderRadius: "6px",
          }}>{item}</button>
        ))}
      </div>
      <Badge color={T.teal}>IIT Hyderabad 2025</Badge>
    </nav>
  );
}

/* ── ROOT APP ──────────────────────────────────────────────────── */

export default function App() {
  useEffect(() => { injectStyles(); }, []);

  return (
    <div style={{
      background: T.bg,
      minHeight: "100vh",
      color: T.text,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <Nav />
      <div style={{ paddingTop: "60px" }}>
        <HeroSection />
        {SOLUTIONS.map(sol => <SolutionSection key={sol.id} sol={sol} />)}
        <ArchitectureSection />
        <WhyWeWinSection />
        {/* Footer */}
        <footer style={{
          borderTop: `1px solid ${T.border}`,
          padding: "24px 60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: T.surface,
        }}>
          <div style={{ fontSize: "12px", color: T.textDim, fontFamily: "'DM Sans',sans-serif" }}>
            NHCX × FHIR R4 · Spring Boot + Angular + MySQL · Apache 2.0 Open Source
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Badge color={T.teal} small>NRCeS Compliant</Badge>
            <Badge color={T.gold} small>ABDM Ready</Badge>
            <Badge color={T.violet} small>OSS</Badge>
          </div>
        </footer>
      </div>
    </div>
  );
}