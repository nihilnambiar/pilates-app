// src/pages/ComparePage.jsx
import { Link } from 'react-router-dom';

const BODY  = "'Inter', 'DM Sans', sans-serif";
const SERIF = "'Playfair Display', serif";

const rows = [
  {
    category: "Primary Focus",
    pilates:  "Core strength, posture, full-body alignment & controlled movement",
    gym:      "Muscle hypertrophy, strength gains & cardiovascular fitness",
    yoga:     "Flexibility, breath control, mindfulness & mental clarity",
  },
  {
    category: "Impact Level",
    pilates:  "Low-impact — joint-friendly, safe for all ages and fitness levels",
    gym:      "Moderate to high-impact — can stress joints, especially with heavy lifting",
    yoga:     "Low-impact — gentle on joints, though some styles can be intense",
  },
  {
    category: "Equipment",
    pilates:  "Specialised apparatus: Reformer, Cadillac, Barrel, Chair — providing resistance and support",
    gym:      "Free weights, machines, cables, cardio equipment",
    yoga:     "Mat, blocks, straps — minimal equipment needed",
  },
  {
    category: "Class Size",
    pilates:  "Small, intentional groups (typically 5–8 people) — every body gets attention",
    gym:      "Varies — can be solo or group classes of 20–40+ people",
    yoga:     "Often 10–25 people per class depending on the studio",
  },
  {
    category: "Instructor Attention",
    pilates:  "High — instructors correct form in real-time, personalise every session",
    gym:      "Low in general — personal trainers cost extra",
    yoga:     "Medium — instructor-led but adjustments vary by class size",
  },
  {
    category: "Rehabilitation Suitability",
    pilates:  "Excellent — widely recommended by physiotherapists for back pain, post-surgery, injuries",
    gym:      "Limited — risk of aggravating injuries if not properly guided",
    yoga:     "Good — particularly restorative yoga styles, though not a clinical tool",
  },
  {
    category: "Posture & Back Pain",
    pilates:  "Direct focus — many members report significant back pain relief within weeks",
    gym:      "Indirect — heavy lifting without proper form can worsen posture",
    yoga:     "Moderate benefit — spinal mobility and flexibility help over time",
  },
  {
    category: "Weight Loss",
    pilates:  "Effective through body recomposition — builds lean muscle that burns fat at rest",
    gym:      "Very effective — high calorie burn, especially with cardio and strength training",
    yoga:     "Mild — most styles have low calorie burn, though active styles help",
  },
  {
    category: "PCOD / Hormonal Health",
    pilates:  "Highly recommended — low-impact, reduces cortisol, improves insulin sensitivity",
    gym:      "Moderate — high-intensity workouts can spike cortisol and worsen hormonal imbalance",
    yoga:     "Good — stress reduction and hormonal regulation through breathwork",
  },
  {
    category: "Mind-Body Connection",
    pilates:  "Strong — every movement is intentional, breath is integrated into exercise",
    gym:      "Low — typically exercise-focused without mindfulness component",
    yoga:     "Very strong — mindfulness, meditation and breathwork are central",
  },
  {
    category: "Visible Results Timeline",
    pilates:  "10 sessions to feel it. 20 sessions to see it. 30 sessions to have a new body.",
    gym:      "4–8 weeks for noticeable change with consistent effort and nutrition",
    yoga:     "6–12 weeks for flexibility gains; longer for visible body changes",
  },
  {
    category: "Suitable For",
    pilates:  "All levels — beginners, post-injury recovery, seniors, athletes, prenatal/postnatal",
    gym:      "Generally healthy adults — beginners need guidance to avoid injury",
    yoga:     "Most people — particularly those seeking stress relief and flexibility",
  },
];

const verdict = [
  {
    title: "Choose Pilates if…",
    color: "#9DC230",
    bg: "#f4f9e8",
    border: "#c8e07a",
    points: [
      "You have back pain, posture issues or a past injury",
      "You want a lean, toned body without bulk",
      "You want personalised attention in every session",
      "You're dealing with PCOD, hormonal imbalance or stress",
      "You want long-term results that actually stick",
    ],
  },
  {
    title: "Choose Gym if…",
    color: "#1E80C2",
    bg: "#eaf3fb",
    border: "#90c4e8",
    points: [
      "Your primary goal is maximum muscle mass",
      "You enjoy high-intensity cardio or powerlifting",
      "You prefer working out solo at your own pace",
      "You want a wide variety of equipment",
    ],
  },
  {
    title: "Choose Yoga if…",
    color: "#c084fc",
    bg: "#f5eeff",
    border: "#d4a8f8",
    points: [
      "Stress relief and mental clarity are your top priority",
      "You want to build flexibility and breathwork",
      "You prefer a meditative, spiritual practice",
      "You want a complementary practice alongside other workouts",
    ],
  },
];

export default function ComparePage() {
  return (
    <div style={{ background: "#f9f7f4", minHeight: "100vh", fontFamily: BODY }}>

      {/* Nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e3dc", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/">
            <img src="/logop.png" alt="Vigour Pilates Studio" style={{ height: "30px", objectFit: "contain" }} />
          </Link>
          <Link to="/" style={{ fontFamily: BODY, fontSize: "13px", fontWeight: 500, color: "#888", textDecoration: "none" }}>
            ← Back to home
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 24px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: "56px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9DC230", marginBottom: "14px" }}>
            The honest comparison
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 600, lineHeight: 1.15, color: "#1a1a1a", marginBottom: "16px" }}>
            Pilates vs Gym vs Yoga
          </h1>
          <p style={{ fontSize: "16px", color: "#666", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto" }}>
            All three are excellent — but they're built for very different goals. Here's everything you need to decide what's right for your body.
          </p>
        </div>

        {/* Comparison Table */}
        <div style={{ overflowX: "auto", marginBottom: "64px", borderRadius: "16px", border: "1px solid #e8e3dc", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e8e3dc" }}>
                <th style={{ padding: "18px 20px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", width: "18%", background: "#fafafa" }}>
                  Category
                </th>
                {[
                  { label: "🌿 Pilates", color: "#9DC230", bg: "#f7fbed" },
                  { label: "🏋️ Gym",    color: "#1E80C2", bg: "#f0f7fd" },
                  { label: "🧘 Yoga",   color: "#c084fc", bg: "#faf5ff" },
                ].map(h => (
                  <th key={h.label} style={{ padding: "18px 20px", textAlign: "left", fontFamily: SERIF, fontWeight: 600, fontSize: "17px", color: h.color, background: h.bg, width: "27.3%" }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.category} style={{ borderBottom: "1px solid #f0ece6", background: i % 2 === 0 ? "#fff" : "#fdfcfa" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 600, fontSize: "13px", color: "#444", verticalAlign: "top", lineHeight: 1.5 }}>
                    {row.category}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#444", lineHeight: 1.7, verticalAlign: "top", borderLeft: "3px solid #d4eb8a" }}>
                    {row.pilates}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#666", lineHeight: 1.7, verticalAlign: "top", borderLeft: "1px solid #f0ece6" }}>
                    {row.gym}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#666", lineHeight: 1.7, verticalAlign: "top", borderLeft: "1px solid #f0ece6" }}>
                    {row.yoga}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verdict cards */}
        <h2 style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 600, color: "#1a1a1a", marginBottom: "28px", textAlign: "center" }}>
          So, which is right for you?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "64px" }}>
          {verdict.map(v => (
            <div key={v.title} style={{ background: v.bg, border: `1px solid ${v.border}`, borderRadius: "16px", padding: "28px" }}>
              <h3 style={{ fontFamily: BODY, fontSize: "15px", fontWeight: 700, color: v.color, marginBottom: "16px" }}>{v.title}</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {v.points.map((p, i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "14px", color: "#444", lineHeight: 1.65 }}>
                    <span style={{ color: v.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", background: "#fff", borderRadius: "20px", border: "1px solid #e8e3dc", padding: "48px 32px" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9DC230", marginBottom: "12px" }}>
            Ready to try?
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 600, color: "#1a1a1a", marginBottom: "12px" }}>
            Experience Pilates for ₹1,000
          </h2>
          <p style={{ fontSize: "15px", color: "#777", marginBottom: "28px", lineHeight: 1.7 }}>
            One trial session. One hour. Zero commitment.<br />
            Most people tell us they wish they'd started sooner.
          </p>
          <Link to="/#trial" style={{
            display: "inline-block", fontFamily: BODY, fontWeight: 600, fontSize: "15px",
            background: "#1a3d6b", color: "#fff", padding: "14px 36px", borderRadius: "14px",
            textDecoration: "none", letterSpacing: "0.01em",
            boxShadow: "0 4px 20px rgba(26,61,107,0.25)",
          }}>
            Book a Trial Session →
          </Link>
        </div>

      </div>
    </div>
  );
}
