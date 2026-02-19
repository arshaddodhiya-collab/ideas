"use client";
import { useState, useEffect } from "react";

const innovations = [
  {
    id: 1,
    code: "NXT-01",
    category: "SOCIAL INFRA",
    title: "Auto-Rickshaw Ambulance Network",
    subtitle: "India's 5M Auto-Rickshaws as Emergency Response Fleet",
    emoji: "🛺",
    color: "#FFD700",
    gradient: "linear-gradient(135deg, #FFD700, #FFA500)",
    problem: "India has 1 ambulance per 40,000 people vs WHO standard of 1 per 1,000. Average emergency response time: 42 minutes in cities, 2+ hours in rural areas.",
    solution: "Convert auto-rickshaws into certified emergency responders. Install a ₹2,500 kit: oxygen cylinder, basic first aid, panic button GPS tracker, and LED emergency light. Auto drivers get ₹500/month retainer + ₹1,000 per emergency response.",
    impact: "5M distributed ambulances, response time <5 minutes",
    why: "Auto-rickshaws are everywhere, know every galli, and drivers need income. Why build infrastructure when it already exists?",
    implementation: [
      "Emergency kit standardization (O2 + first aid + GPS)",
      "Auto driver training program (8-hour weekend course)",
      "Insurance coverage for drivers during emergency trips",
      "Government subsidy for kit installation",
      "Integration with 108 emergency services dispatch"
    ],
    metrics: [
      { label: "Target fleet", value: "5M rickshaws", icon: "🛺" },
      { label: "Response time", value: "<5 min", icon: "⏱️" },
      { label: "Cost per rickshaw", value: "₹2,500", icon: "💰" },
      { label: "Lives saved/year", value: "50K+", icon: "❤️" }
    ],
    phase: "Pilot",
    readiness: 85
  },
  {
    id: 2,
    code: "NXT-02",
    category: "BEHAVIORAL DESIGN",
    title: "Desi Health Superstitions ++",
    subtitle: "Gamify Traditional Beliefs for Modern Outcomes",
    emoji: "🪔",
    color: "#FF6B6B",
    gradient: "linear-gradient(135deg, #FF6B6B, #C92A2A)",
    problem: "Indians follow traditional beliefs religiously but ignore medical advice. 68% believe in nazar, 54% in rahu kaal, 82% won't cut hair on Tuesday. But only 12% complete antibiotic courses.",
    solution: "Design 'health rituals' that piggyback on existing beliefs. Create auspicious times for medication (rahu kaal reminder becomes medicine reminder). Issue 'lucky' colored pills for different days. Prescribe 'sacred' step counts (108 rounds around temple courtyard = 8000 steps).",
    impact: "80% medication adherence without fighting culture",
    why: "Don't fight tradition. Weaponize it. If people won't take pills because it's Tuesday, make Tuesday 'liver protection day' where skipping meds brings bad luck.",
    implementation: [
      "Astrological medicine timing recommendations",
      "Temple-walking distance equivalents for cardio",
      "Lucky number pill counts (multiples of 108, 7, 21)",
      "Festival-aligned health challenges (Navratri detox, Diwali steps)",
      "Pandit/priest endorsement program for medicine compliance"
    ],
    metrics: [
      { label: "Current adherence", value: "12%", icon: "📉" },
      { label: "Target adherence", value: "80%", icon: "📈" },
      { label: "Belief leverage", value: "82% population", icon: "🕉️" },
      { label: "Behavioral nudge", value: "Zero cost", icon: "✨" }
    ],
    phase: "Concept",
    readiness: 72
  },
  {
    id: 3,
    code: "NXT-03",
    category: "REVERSE LOGISTICS",
    title: "Dabbawallahs for Medicine",
    subtitle: "Mumbai's 6-Sigma Supply Chain Delivers Meds",
    emoji: "🍱",
    color: "#4ECDC4",
    gradient: "linear-gradient(135deg, #4ECDC4, #44A08D)",
    problem: "Chronic disease patients miss 40% of doses because they forget refills, can't leave work, or pharmacy is out of stock. Mumbai's dabbawallahs achieve 99.999999% accuracy—one error per 16 million deliveries.",
    solution: "Partner with dabbawallah network for daily medicine delivery. Patients get weekly medicine strips delivered with their lunch dabbas. Pharmacies load the network, dabbawallahs ensure same-day delivery. Return trip brings empty strips for compliance tracking.",
    impact: "99.99% delivery accuracy, 95% adherence for chronic meds",
    why: "Mumbai has 5,000 dabbawallahs delivering 200,000 boxes daily with zero tech. Harvard Business School calls it a 'six sigma' system. Don't reinvent logistics—plug into the best.",
    implementation: [
      "Pharmacy → Dabbawallah collection points",
      "Color-coded medicine box system (lunch box + med box)",
      "Weekly medication strips pre-packaged by pharmacies",
      "Empty strip return = compliance verification",
      "Expand model to vegetable vendors, newspaper delivery"
    ],
    metrics: [
      { label: "Accuracy rate", value: "99.999999%", icon: "🎯" },
      { label: "Current fleet", value: "5,000 wallahs", icon: "🚶" },
      { label: "Daily deliveries", value: "200K boxes", icon: "📦" },
      { label: "Adherence target", value: "95%", icon: "💊" }
    ],
    phase: "Design",
    readiness: 78
  },
  {
    id: 4,
    code: "NXT-04",
    category: "HYPER-LOCAL DATA",
    title: "Pincode Health Warriors",
    subtitle: "Every Pincode Gets a Health Champion",
    emoji: "📍",
    color: "#9B59B6",
    gradient: "linear-gradient(135deg, #9B59B6, #8E44AD)",
    problem: "Health data is national or hospital-level. But disease spreads in neighborhoods. Dengue in Malad East, TB in Dharavi, diabetes in Banjara Hills. No one owns hyperlocal health intelligence.",
    solution: "Appoint 19,300 'Pincode Champions' (one per Indian pincode). Give them a dashboard of their pincode's health metrics: disease outbreaks, pharmacy stock, doctor availability, air quality. They organize monthly health camps, coordinate with local authorities, and earn ₹5,000/month.",
    impact: "Hyperlocal health ownership at 150,000-person scale",
    why: "Sarpanch system works. RWA works. Pincode is the perfect unit—small enough for one person to know everyone, large enough to matter. Create hyperlocal health CEOs.",
    implementation: [
      "Public dashboard per pincode (anonymized health metrics)",
      "Monthly health camp mandate with govt PHC support",
      "WhatsApp group per pincode for outbreak alerts",
      "Gamification: pincodes compete on health scores",
      "Integration with ASHA workers and ANMs"
    ],
    metrics: [
      { label: "Total pincodes", value: "19,300", icon: "📮" },
      { label: "People per pincode", value: "~150K", icon: "👥" },
      { label: "Champion stipend", value: "₹5K/mo", icon: "💵" },
      { label: "Camps per year", value: "12 per pincode", icon: "🏥" }
    ],
    phase: "Concept",
    readiness: 68
  },
  {
    id: 5,
    code: "NXT-05",
    category: "WASTE → HEALTH",
    title: "Swachh Tokens",
    subtitle: "Trade Waste for Healthcare",
    emoji: "♻️",
    color: "#27AE60",
    gradient: "linear-gradient(135deg, #27AE60, #229954)",
    problem: "India generates 277 tons of plastic waste daily. 85% is not recycled. Simultaneously, 60% of population can't afford regular health checkups. Two problems, one solution?",
    solution: "Government-backed plastic recycling tokens redeemable for healthcare. Collect 5kg plastic = ₹100 health credit at any government hospital. Covers OPD visit, basic tests, or generic medicines. Kabadiwallas become health enablers.",
    impact: "Clean India + Universal Healthcare. 100M tons plastic → ₹200 Cr health credits",
    why: "People will clean up if there's direct value. Not charity. Not CSR. Direct exchange. Your plastic for your health. Kabadiwallas already collect—just add health tokenomics.",
    implementation: [
      "Blockchain-based 'Swachh Tokens' (1kg plastic = 1 token)",
      "Redemption at government hospitals, Jan Aushadhi kendras",
      "Integration with existing kabadiwallah networks",
      "Token exchange: 20 tokens = OPD, 50 tokens = blood test, 100 tokens = X-ray",
      "Sponsored by plastic manufacturers as EPR compliance"
    ],
    metrics: [
      { label: "Plastic waste daily", value: "277 tons", icon: "🗑️" },
      { label: "Current recycling", value: "15%", icon: "📉" },
      { label: "5kg plastic value", value: "₹100 credit", icon: "🎫" },
      { label: "Target collection", value: "100M tons/yr", icon: "♻️" }
    ],
    phase: "Pilot",
    readiness: 81
  },
  {
    id: 6,
    code: "NXT-06",
    category: "TIME ARBITRAGE",
    title: "Night Shift Hospitals",
    subtitle: "Use Empty Hospital Infrastructure After Hours",
    emoji: "🌙",
    color: "#3498DB",
    gradient: "linear-gradient(135deg, #3498DB, #2980B9)",
    problem: "Government hospitals are 40% utilized at night. OPD shuts at 5pm. Operation theaters, diagnostic labs, and doctors go home. Meanwhile, working Indians can't take off during the day for health checkups.",
    solution: "Run 'Night OPD' at all district hospitals 8pm-12am. Doctors work flexible shifts (earn extra for night hours). Target is working adults who can't afford day-time hospital visits. Labs run overnight, reports by morning.",
    impact: "2x hospital utilization, 50M working Indians get access",
    why: "Hospital is real estate. Right now, ₹1000 Cr infrastructure sits dark 16 hours a day. People work 9-7. This is a time arbitrage opportunity.",
    implementation: [
      "Doctor shift premium (₹500/hr for night hours)",
      "Night OPD for non-emergency cases (BP, diabetes, general check)",
      "Overnight lab processing (X-ray, blood tests, ECG)",
      "Security upgrades for night operations",
      "WhatsApp booking system (no day-time queue needed)"
    ],
    metrics: [
      { label: "Current utilization", value: "40% at night", icon: "🏥" },
      { label: "Target utilization", value: "80%", icon: "📊" },
      { label: "Working population", value: "50M potential", icon: "👔" },
      { label: "Doctor night premium", value: "₹500/hr", icon: "💰" }
    ],
    phase: "Design",
    readiness: 75
  },
  {
    id: 7,
    code: "NXT-07",
    category: "IDENTITY HACK",
    title: "Mobile Number = Health ID",
    subtitle: "Forget ABHA. Your Phone Number IS Your Health ID",
    emoji: "📱",
    color: "#E74C3C",
    gradient: "linear-gradient(135deg, #E74C3C, #C0392B)",
    problem: "ABHA has 500M registrations but actual usage is <5%. Why? Because it's a new number to remember. Indians change addresses, lose cards, forget passwords. But they NEVER change mobile numbers—it's their digital identity.",
    solution: "Repurpose mobile number as health ID. Every health record auto-links to your mobile. Hospital visit? Give phone number. Pharmacy? Phone number. Lab test? Phone number. OTP verification for access. Records follow you forever.",
    impact: "1.18 billion instant health IDs, zero enrollment needed",
    why: "Mobile number is already your bank ID, ration card, Aadhaar OTP receiver. It's India's true universal ID. Stop creating new numbers. Use what people already guard with their life.",
    implementation: [
      "National health record linked to mobile number registry",
      "Hospital registration = mobile number + OTP verification",
      "Prescription pickup = mobile OTP + pharmacist verification",
      "Lab reports sent to mobile (SMS + WhatsApp)",
      "Lost phone? Visit any hospital with Aadhaar to reclaim records"
    ],
    metrics: [
      { label: "Mobile subscribers", value: "1.18 billion", icon: "📱" },
      { label: "ABHA active usage", value: "<5%", icon: "📉" },
      { label: "Enrollment time", value: "0 seconds", icon: "⚡" },
      { label: "Coverage", value: "100%", icon: "✅" }
    ],
    phase: "Concept",
    readiness: 92
  },
  {
    id: 8,
    code: "NXT-08",
    category: "SPACE OPTIMIZATION",
    title: "Container Clinics",
    subtitle: "Shipping Containers as Modular PHCs",
    emoji: "📦",
    color: "#16A085",
    gradient: "linear-gradient(135deg, #16A085, #138D75)",
    problem: "Building a new PHC takes 3 years, ₹2 Cr, and navigating 47 approvals. Rural areas wait decades for healthcare infrastructure. Meanwhile, India has 10,000+ unused shipping containers at ports.",
    solution: "Convert 20-foot shipping containers into fully-equipped mobile PHCs. Pre-fabricated in 30 days: exam room, pharmacy, mini-lab, toilet. Costs ₹25 lakhs. Delivered on a truck. Plug into solar + internet. Doctor arrives. Clinic is live.",
    impact: "10,000 clinics deployed in 1 year vs 10 years for brick-and-mortar",
    why: "Containers are weatherproof, stackable, mobile, and dirt-cheap. Why build permanent when you can deploy modular? Outbreak in Bihar? Ship 50 containers.",
    implementation: [
      "Standard container PHC design (exam room + pharmacy + lab)",
      "Solar + satellite internet integration",
      "Prefab manufacturing in industrial zones",
      "Truck delivery to remote locations",
      "Doctor + nurse assigned on rotation (15-day shifts)"
    ],
    metrics: [
      { label: "Traditional PHC cost", value: "₹2 Cr", icon: "🏗️" },
      { label: "Container PHC cost", value: "₹25L", icon: "📦" },
      { label: "Setup time", value: "30 days vs 3 years", icon: "⚡" },
      { label: "Target deployment", value: "10,000 units", icon: "🚚" }
    ],
    phase: "Prototype",
    readiness: 88
  },
  {
    id: 9,
    code: "NXT-09",
    category: "PEER ECONOMY",
    title: "Patient-to-Patient Medicine Sharing",
    subtitle: "Uber for Unused Medicines",
    emoji: "💊",
    color: "#F39C12",
    gradient: "linear-gradient(135deg, #F39C12, #E67E22)",
    problem: "Indians waste ₹5,000 Cr in unused medicines annually. Cancer patient buys ₹40,000 chemo course, dies on day 8, 80% unused. Meanwhile, another patient in the same city can't afford the same drug. Medicines expire in bathroom cabinets.",
    solution: "Peer-to-peer medicine marketplace. Verified by pharmacists. Upload photo of unused medicine strip + prescription + expiry. Someone else in same city needs it? Courier delivers in 2 hours. Donor gets ₹100 pickup fee. Receiver pays 50% market price. Both win.",
    impact: "₹5,000 Cr waste → ₹2,500 Cr accessible healthcare",
    why: "Medicines don't care who swallows them. If it's sealed, expiry is 12+ months away, and verified by pharmacist, why let it rot? Dunzo for meds. Uber for pills. Commons economy for health.",
    implementation: [
      "App for listing unused medicines (photo + prescription + expiry)",
      "Pharmacist verification layer (ensure strip is sealed)",
      "Hyperlocal courier integration (Dunzo, Porter, Swiggy Genie)",
      "Pricing: 50% of retail (30% donor, 20% platform)",
      "Insurance coverage for verified peer-to-peer transactions"
    ],
    metrics: [
      { label: "Medicine waste/yr", value: "₹5,000 Cr", icon: "💸" },
      { label: "Recoverable value", value: "₹2,500 Cr", icon: "💰" },
      { label: "Unused meds per home", value: "₹800 avg", icon: "🏠" },
      { label: "Donor incentive", value: "₹100 pickup", icon: "🎁" }
    ],
    phase: "Design",
    readiness: 70
  },
  {
    id: 10,
    code: "NXT-10",
    category: "DEAD SPACE ACTIVATION",
    title: "Bus Stop Health Kiosks",
    subtitle: "40,000 Bus Stops Become Health Checkpoints",
    emoji: "🚏",
    color: "#8E44AD",
    gradient: "linear-gradient(135deg, #8E44AD, #9B59B6)",
    problem: "Urban Indians spend 45 minutes/day waiting at bus stops doing nothing. 40,000 bus stops in Indian cities are wasted real estate. Meanwhile, people skip health checks because 'no time'.",
    solution: "Install weatherproof health kiosks at every bus stop: automated BP machine, BMI scale, oximeter, and screen for quick health tips. Takes 90 seconds. Data syncs to your mobile via QR code. Free. No appointment needed.",
    impact: "40,000 health checkpoints, 200M checks/year",
    why: "Bus stops are public infrastructure we already paid for. People are standing there anyway. Why not make the wait productive? 90 seconds while waiting for bus = free health check.",
    implementation: [
      "Vandal-proof outdoor kiosk design (steel housing)",
      "Solar-powered operation (no grid dependency)",
      "QR code scan to claim health data (linked to mobile)",
      "Partnership with municipal corporations for installation",
      "Sponsored by pharma companies (ad space on kiosk screen)"
    ],
    metrics: [
      { label: "Bus stops in India", value: "40,000+", icon: "🚏" },
      { label: "Daily commuters", value: "200M", icon: "👥" },
      { label: "Check time", value: "90 seconds", icon: "⏱️" },
      { label: "Cost per kiosk", value: "₹1L (solar)", icon: "☀️" }
    ],
    phase: "Concept",
    readiness: 83
  }
];

const categories = ["All", "Social Infra", "Behavioral Design", "Reverse Logistics", "Hyper-Local Data", "Waste → Health", "Time Arbitrage", "Identity Hack", "Space Optimization", "Peer Economy", "Dead Space"];

export default function NonAIInnovations() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = filter === "All" 
    ? innovations 
    : innovations.filter(i => i.category === filter.toUpperCase().replace(" ", " "));

  const active = innovations.find(i => i.id === selected);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0a0e1a 0%, #1a1f35 50%, #0a0e1a 100%)",
      fontFamily: "'Courier New', monospace",
      color: "#fff",
      padding: "0",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated grid background */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        animation: "gridMove 20s linear infinite",
        pointerEvents: "none"
      }} />
      <style>
        {`
          @keyframes gridMove {
            0% { transform: translateY(0); }
            100% { transform: translateY(60px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>

      {/* Hero */}
      <div style={{ 
        position: "relative",
        padding: "80px 40px 60px",
        borderBottom: "2px solid rgba(255,215,0,0.2)",
        background: "linear-gradient(180deg, rgba(255,215,0,0.05) 0%, transparent 100%)"
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(255,215,0,0.1)",
            border: "1px solid rgba(255,215,0,0.5)",
            color: "#FFD700",
            padding: "6px 16px",
            fontSize: "10px",
            letterSpacing: "4px",
            marginBottom: "20px",
            fontWeight: "700"
          }}>
            ZERO AI • 100% INNOVATION
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 6vw, 72px)",
            fontWeight: "900",
            lineHeight: 1.1,
            margin: "0 0 16px",
            letterSpacing: "-2px",
            background: "linear-gradient(135deg, #FFD700, #FFA500, #FF6347)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            NON-AI INNOVATIONS<br/>
            FOR INDIA HEALTH
          </h1>

          <p style={{
            fontSize: "16px",
            color: "#94a3b8",
            maxWidth: "700px",
            lineHeight: 1.8,
            marginBottom: "32px"
          }}>
            Because not everything needs machine learning. Sometimes the best innovation is just connecting dots differently — using existing infrastructure, changing behavior, or hacking identity systems. Here are 10 ideas that require zero AI but could transform Indian healthcare.
          </p>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  background: filter === cat ? "linear-gradient(135deg, #FFD700, #FFA500)" : "rgba(255,215,0,0.05)",
                  border: `1px solid ${filter === cat ? "#FFD700" : "rgba(255,215,0,0.2)"}`,
                  color: filter === cat ? "#000" : "#94a3b8",
                  padding: "8px 16px",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  cursor: "pointer",
                  fontWeight: filter === cat ? "700" : "400",
                  transition: "all 0.3s",
                  fontFamily: "'Courier New', monospace"
                }}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "60px 40px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        gap: "24px"
      }}>
        {filtered.map((item, idx) => {
          const isSelected = selected === item.id;
          
          return (
            <div
              key={item.id}
              onClick={() => setSelected(isSelected ? null : item.id)}
              style={{
                background: isSelected 
                  ? `linear-gradient(135deg, ${item.color}15, rgba(10,14,26,0.9))`
                  : "rgba(26,31,53,0.5)",
                border: `2px solid ${isSelected ? item.color : "rgba(255,255,255,0.1)"}`,
                padding: "32px",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                backdropFilter: "blur(10px)",
                position: "relative",
                overflow: "hidden",
                animation: mounted ? `slideUp 0.6s ease ${idx * 0.1}s both` : "none"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 20px 60px ${item.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Code badge */}
              <div style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: item.gradient,
                color: "#000",
                fontSize: "9px",
                fontWeight: "900",
                letterSpacing: "2px",
                padding: "6px 12px",
                borderRadius: "4px"
              }}>
                {item.code}
              </div>

              {/* Category tag */}
              <div style={{
                display: "inline-block",
                background: `${item.color}20`,
                border: `1px solid ${item.color}60`,
                color: item.color,
                fontSize: "9px",
                letterSpacing: "3px",
                padding: "4px 10px",
                marginBottom: "16px",
                fontWeight: "700"
              }}>
                {item.category}
              </div>

              {/* Emoji */}
              <div style={{
                fontSize: "48px",
                marginBottom: "16px",
                filter: isSelected ? "none" : "grayscale(50%)",
                transition: "filter 0.3s"
              }}>
                {item.emoji}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: "22px",
                fontWeight: "900",
                margin: "0 0 8px",
                color: "#fff",
                letterSpacing: "-0.5px",
                lineHeight: 1.2
              }}>
                {item.title}
              </h3>

              {/* Subtitle */}
              <p style={{
                fontSize: "12px",
                color: "#64748b",
                margin: "0 0 20px",
                lineHeight: 1.6
              }}>
                {item.subtitle}
              </p>

              {/* Why quote */}
              <div style={{
                background: "rgba(0,0,0,0.3)",
                borderLeft: `3px solid ${item.color}`,
                padding: "12px 16px",
                marginBottom: "20px"
              }}>
                <div style={{
                  fontSize: "9px",
                  color: item.color,
                  letterSpacing: "2px",
                  marginBottom: "6px",
                  fontWeight: "700"
                }}>
                  WHY THIS WORKS
                </div>
                <p style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  margin: 0,
                  lineHeight: 1.6,
                  fontStyle: "italic"
                }}>
                  "{item.why}"
                </p>
              </div>

              {/* Readiness bar */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px"
                }}>
                  <span style={{ fontSize: "9px", color: "#475569", letterSpacing: "2px" }}>
                    READINESS
                  </span>
                  <span style={{ fontSize: "11px", color: item.color, fontWeight: "700" }}>
                    {item.readiness}%
                  </span>
                </div>
                <div style={{
                  height: "4px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "2px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%",
                    width: mounted ? `${item.readiness}%` : "0%",
                    background: item.gradient,
                    transition: "width 1.5s ease",
                    borderRadius: "2px"
                  }} />
                </div>
              </div>

              {/* Metrics grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "20px"
              }}>
                {item.metrics.slice(0, 2).map((m, i) => (
                  <div key={i} style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "12px",
                    borderRadius: "4px",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <div style={{ fontSize: "16px", marginBottom: "4px" }}>{m.icon}</div>
                    <div style={{ fontSize: "9px", color: "#475569", letterSpacing: "1px", marginBottom: "4px" }}>
                      {m.label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "13px", color: "#fff", fontWeight: "700" }}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Expand indicator */}
              <div style={{
                marginTop: "20px",
                textAlign: "center",
                fontSize: "9px",
                letterSpacing: "2px",
                color: isSelected ? item.color : "#475569",
                fontWeight: "700"
              }}>
                {isSelected ? "▲ COLLAPSE DETAILS" : "▼ EXPAND FULL CONCEPT"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Panel */}
      {active && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "70vh",
          overflowY: "auto",
          background: `linear-gradient(to bottom, ${active.color}20, rgba(10,14,26,0.98))`,
          backdropFilter: "blur(20px)",
          borderTop: `3px solid ${active.color}`,
          padding: "48px 40px",
          animation: "slideUp 0.4s ease",
          zIndex: 1000,
          boxShadow: `0 -20px 60px ${active.color}40`
        }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <button
              onClick={() => setSelected(null)}
              style={{
                position: "absolute",
                top: "24px",
                right: "40px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                padding: "8px 16px",
                fontSize: "10px",
                letterSpacing: "2px",
                cursor: "pointer",
                fontWeight: "700",
                fontFamily: "'Courier New', monospace"
              }}
            >
              ✕ CLOSE
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "40px" }}>
              <div>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>{active.emoji}</div>
                <div style={{
                  fontSize: "10px",
                  letterSpacing: "4px",
                  color: active.color,
                  marginBottom: "8px",
                  fontWeight: "700"
                }}>
                  {active.category}
                </div>
                <h2 style={{
                  fontSize: "36px",
                  fontWeight: "900",
                  margin: "0 0 12px",
                  letterSpacing: "-1px",
                  color: "#fff"
                }}>
                  {active.title}
                </h2>
                <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px" }}>
                  {active.subtitle}
                </p>

                <div style={{
                  background: "rgba(0,0,0,0.4)",
                  border: `2px solid ${active.color}60`,
                  padding: "20px",
                  borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "10px", color: active.color, letterSpacing: "3px", marginBottom: "12px", fontWeight: "700" }}>
                    THE PROBLEM
                  </div>
                  <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>
                    {active.problem}
                  </p>
                </div>
              </div>

              <div>
                <div style={{
                  background: active.gradient,
                  padding: "24px",
                  borderRadius: "8px",
                  marginBottom: "24px"
                }}>
                  <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.7)", letterSpacing: "3px", marginBottom: "12px", fontWeight: "700" }}>
                    THE SOLUTION
                  </div>
                  <p style={{ fontSize: "14px", color: "#000", lineHeight: 1.7, margin: 0, fontWeight: "500" }}>
                    {active.solution}
                  </p>
                </div>

                <div style={{
                  background: "rgba(0,0,0,0.4)",
                  border: `1px solid ${active.color}40`,
                  padding: "20px",
                  borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "3px", marginBottom: "12px", fontWeight: "700" }}>
                    PROJECTED IMPACT
                  </div>
                  <p style={{ fontSize: "18px", color: active.color, lineHeight: 1.5, margin: 0, fontWeight: "700" }}>
                    {active.impact}
                  </p>
                </div>
              </div>
            </div>

            {/* Implementation steps */}
            <div style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "32px",
              borderRadius: "8px",
              marginBottom: "24px"
            }}>
              <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "3px", marginBottom: "20px", fontWeight: "700" }}>
                IMPLEMENTATION ROADMAP
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                {active.implementation.map((step, i) => (
                  <div key={i} style={{
                    background: "rgba(0,0,0,0.4)",
                    padding: "16px",
                    borderLeft: `3px solid ${active.color}`,
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start"
                  }}>
                    <div style={{
                      background: active.color,
                      color: "#000",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "900",
                      flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0, lineHeight: 1.6 }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* All metrics */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px"
            }}>
              {active.metrics.map((m, i) => (
                <div key={i} style={{
                  background: "rgba(0,0,0,0.4)",
                  border: `1px solid ${active.color}40`,
                  padding: "20px",
                  textAlign: "center",
                  borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>{m.icon}</div>
                  <div style={{ fontSize: "9px", color: "#64748b", letterSpacing: "2px", marginBottom: "8px" }}>
                    {m.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "16px", color: active.color, fontWeight: "900" }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "60px 40px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "3px", marginBottom: "8px" }}>
            NO AI REQUIRED
          </div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>
            Just smart infrastructure hacks, behavior design, and system thinking.
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "3px", marginBottom: "8px" }}>
            INDIA HEALTH INNOVATION
          </div>
          <div style={{ fontSize: "14px", fontWeight: "700" }}>
            <span style={{ color: "#FFD700" }}>🇮🇳</span> Built for Bharat, Scaled for Bharat
          </div>
        </div>
      </div>
    </div>
  );
}