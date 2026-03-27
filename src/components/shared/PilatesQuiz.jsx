import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Mail, CheckCircle, ChevronRight } from "lucide-react";
import Anthropic from "@anthropic-ai/sdk";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import emailjs from "@emailjs/browser";

const C = {
  black:  "#0d0d0d",
  forest: "#1a2e1e",
  green:  "#2d5a34",
  lime:   "#7db87a",
  gold:   "#c9a84c",
  ivory:  "#f5f0e8",
  cream:  "#faf7f2",
  white:  "#ffffff",
  muted:  "#6b6b5e",
};

const QUESTIONS = [
  {
    id: 1,
    q: "What's bringing you to Pilates?",
    options: [
      { label: "Build core strength & tone", tags: ["power","reformer"] },
      { label: "Improve flexibility & posture", tags: ["mat","barre"] },
      { label: "Recover from pain or injury", tags: ["restore","prenatal"] },
      { label: "Complement my existing training", tags: ["power","reformer"] },
    ],
  },
  {
    id: 2,
    q: "How active are you right now?",
    options: [
      { label: "Mostly sedentary, just starting out", tags: ["mat","restore"] },
      { label: "Light movement — walks, stretching", tags: ["mat","barre"] },
      { label: "Regular gym or fitness classes", tags: ["reformer","power"] },
      { label: "Training 5+ days a week", tags: ["power","reformer"] },
    ],
  },
  {
    id: 3,
    q: "Any prior Pilates experience?",
    options: [
      { label: "Completely new — first time!", tags: ["mat","restore"] },
      { label: "Tried it once or twice", tags: ["mat","barre"] },
      { label: "A few months of practice", tags: ["reformer","barre"] },
      { label: "Over a year of regular practice", tags: ["power","reformer"] },
    ],
  },
  {
    id: 4,
    q: "Any physical conditions or limitations?",
    options: [
      { label: "None — feeling great!", tags: ["power","reformer","barre"] },
      { label: "Chronic back or neck pain", tags: ["restore","mat"] },
      { label: "Joint issues (knees, hips)", tags: ["restore","mat"] },
      { label: "Pregnant or postpartum", tags: ["prenatal"] },
    ],
  },
  {
    id: 5,
    q: "How many sessions per week can you commit to?",
    options: [
      { label: "1 session — testing the waters", tags: ["mat","restore"] },
      { label: "2 sessions — building a routine", tags: ["mat","barre"] },
      { label: "3 sessions — serious commitment", tags: ["reformer","barre"] },
      { label: "4+ sessions — fully dedicated", tags: ["power","reformer"] },
    ],
  },
  {
    id: 6,
    q: "How do you like your workouts to feel?",
    options: [
      { label: "Slow, intentional, almost meditative", tags: ["restore","mat"] },
      { label: "Balanced — steady but not too easy", tags: ["barre","mat"] },
      { label: "Challenging — I want to sweat", tags: ["power","reformer"] },
      { label: "Varied — mix of everything!", tags: ["reformer","barre"] },
    ],
  },
  {
    id: 7,
    q: "What matters most to you in a class?",
    options: [
      { label: "Mental calm and stress relief", tags: ["restore","mat"] },
      { label: "Visible physical transformation", tags: ["power","reformer"] },
      { label: "Learning proper technique", tags: ["mat","reformer"] },
      { label: "Grace, elegance, and poise", tags: ["barre","prenatal"] },
    ],
  },
  {
    id: 8,
    q: "How does your body feel right now?",
    options: [
      { label: "Stiff and tight — needs to loosen up", tags: ["restore","barre"] },
      { label: "Generally okay, could be better", tags: ["mat","reformer"] },
      { label: "Energized and ready to work hard", tags: ["power","reformer"] },
      { label: "Sore or recovering from strain", tags: ["restore","prenatal"] },
    ],
  },
  {
    id: 9,
    q: "What's your age range?",
    options: [
      { label: "Under 25", tags: ["power","barre"] },
      { label: "25 – 35", tags: ["reformer","barre"] },
      { label: "36 – 50", tags: ["mat","reformer"] },
      { label: "50+", tags: ["restore","mat"] },
    ],
  },
  {
    id: 10,
    q: "Pick the statement that resonates most:",
    options: [
      { label: "I want a stronger, flatter core", tags: ["power","mat"] },
      { label: "I want to move without pain daily", tags: ["restore","mat"] },
      { label: "I want to stand taller and look confident", tags: ["barre","reformer"] },
      { label: "I want functional athletic strength", tags: ["power","reformer"] },
    ],
  },
  {
    id: 11,
    q: "Do you have a background in any of these?",
    options: [
      { label: "Yoga or meditation", tags: ["restore","mat"] },
      { label: "Dance or performing arts", tags: ["barre","prenatal"] },
      { label: "Weight training or CrossFit", tags: ["power","reformer"] },
      { label: "None of the above", tags: ["mat","reformer"] },
    ],
  },
  {
    id: 12,
    q: "When you hit a hard exercise, you:",
    options: [
      { label: "Ease back and honour your limits", tags: ["restore","prenatal"] },
      { label: "Work through it steadily", tags: ["mat","reformer"] },
      { label: "Push harder — that's the point", tags: ["power"] },
      { label: "Modify it and try again next time", tags: ["barre","mat"] },
    ],
  },
  {
    id: 13,
    q: "Biggest obstacle to staying consistent?",
    options: [
      { label: "Not enough time", tags: ["mat","barre"] },
      { label: "Lack of motivation or accountability", tags: ["reformer","barre"] },
      { label: "Physical pain or old injuries", tags: ["restore","mat"] },
      { label: "Haven't found the right method yet", tags: ["reformer","power"] },
    ],
  },
  {
    id: 14,
    q: "After a perfect session, you feel:",
    options: [
      { label: "Zen, stretched, and completely calm", tags: ["restore","mat"] },
      { label: "Strong, sculpted, and accomplished", tags: ["power","reformer"] },
      { label: "Graceful and long in your limbs", tags: ["barre","prenatal"] },
      { label: "Like your body genuinely needed that", tags: ["restore","reformer"] },
    ],
  },
  {
    id: 15,
    q: "What would make this studio feel like home?",
    options: [
      { label: "Small classes where I'm truly seen", tags: ["mat","restore"] },
      { label: "Results I can measure and track", tags: ["power","reformer"] },
      { label: "Beautiful, calming atmosphere", tags: ["barre","prenatal"] },
      { label: "Instructors who understand my body", tags: ["restore","reformer"] },
    ],
  },
];

const CLASS_INFO = {
  mat:      { name: "Mat Pilates",    emoji: "🧘", color: "#7db87a", desc: "Core strength & flexibility on the mat — perfect foundation for any level." },
  reformer: { name: "Reformer",       emoji: "⚡", color: "#c9a84c", desc: "Full-body resistance on Balanced Body reformers — the gold standard of Pilates." },
  barre:    { name: "Barre Fusion",   emoji: "🩰", color: "#e8a598", desc: "Ballet-inspired sculpting for a long, graceful, and toned physique." },
  restore:  { name: "Core & Restore", emoji: "🌿", color: "#88c8a8", desc: "Deep core work combined with therapeutic stretching — healing from the inside out." },
  power:    { name: "Power Pilates",  emoji: "🔥", color: "#e87a4a", desc: "High-intensity challenge for those ready to push their limits." },
  prenatal: { name: "Prenatal Flow",  emoji: "🌸", color: "#e8c8d8", desc: "Safe, nurturing movement designed for every trimester." },
};

function scoreAnswers(answers) {
  const scores = { mat: 0, reformer: 0, barre: 0, restore: 0, power: 0, prenatal: 0 };
  answers.forEach(a => {
    if (!a) return;
    a.tags.forEach(tag => { scores[tag] = (scores[tag] || 0) + 1; });
  });
  return scores;
}

function getTopClass(scores) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function buildRadarData(scores) {
  const max = Math.max(...Object.values(scores), 1);
  return [
    { subject: "Strength",    value: Math.round(((scores.power || 0) + (scores.reformer || 0)) / (2 * max) * 100) },
    { subject: "Flexibility", value: Math.round(((scores.mat || 0) + (scores.barre || 0)) / (2 * max) * 100) },
    { subject: "Recovery",    value: Math.round(((scores.restore || 0) + (scores.prenatal || 0)) / (2 * max) * 100) },
    { subject: "Endurance",   value: Math.round(((scores.power || 0) + (scores.mat || 0)) / (2 * max) * 100) },
    { subject: "Grace",       value: Math.round(((scores.barre || 0) + (scores.prenatal || 0)) / (2 * max) * 100) },
  ];
}

async function streamAnalysis(answers, topClass, onChunk) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing VITE_ANTHROPIC_API_KEY");

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const summary = QUESTIONS.map((q, i) => `Q${i + 1}. ${q.q}\n→ ${answers[i]?.label || "—"}`).join("\n");

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 600,
    system: `You are a warm, expert Pilates instructor at Vigour Pilates Studio in Pune.
Write a short, personal assessment for a new student based on their quiz answers.
Structure it in exactly 3 sections, each starting with a bold emoji heading:
**🎯 Your Profile** (2 sentences describing their body & fitness personality)
**✨ Why ${CLASS_INFO[topClass].name} is perfect for you** (2-3 sentences of specific reasoning)
**🌱 Your First 30 Days** (2 sentences on what to expect)
Be warm, specific, encouraging. Use "you" not "they". No generic fluff.`,
    messages: [{ role: "user", content: `Quiz answers:\n${summary}\n\nRecommended class: ${CLASS_INFO[topClass].name}` }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      onChunk(event.delta.text);
    }
  }
}

async function sendEmail(toEmail, toName, topClass, analysis, radarData) {
  const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) return false;

  const radarSummary = radarData.map(r => `${r.subject}: ${r.value}%`).join(" | ");

  await emailjs.send(serviceId, templateId, {
    to_name:        toName,
    to_email:       toEmail,
    class_name:     CLASS_INFO[topClass].name,
    class_emoji:    CLASS_INFO[topClass].emoji,
    class_desc:     CLASS_INFO[topClass].desc,
    analysis:       analysis,
    radar_summary:  radarSummary,
    studio_url:     window.location.origin,
  }, publicKey);

  return true;
}

// ── Question slide ────────────────────────────────────────────
function QuestionSlide({ q, index, total, selected, onSelect }) {
  return (
    <motion.div key={q.id}
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35, ease: "easeInOut" }}>

      <p className="font-body text-xs tracking-widest uppercase mb-3"
        style={{ color: "rgba(201,168,76,0.7)", letterSpacing: "0.2em" }}>
        Question {index + 1} of {total}
      </p>
      <h3 className="font-display font-semibold mb-8 leading-snug"
        style={{ color: C.white, fontSize: "clamp(1.5rem,3.5vw,2.2rem)" }}>
        {q.q}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((opt, i) => {
          const active = selected?.label === opt.label;
          return (
            <motion.button key={i} onClick={() => onSelect(opt)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="text-left px-5 py-4 rounded-2xl border transition-all duration-200 font-body text-sm"
              style={{
                background: active ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                borderColor: active ? C.gold : "rgba(255,255,255,0.1)",
                color: active ? C.gold : "rgba(255,255,255,0.75)",
                boxShadow: active ? `0 0 0 1px ${C.gold}` : "none",
              }}>
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs"
                  style={{
                    borderColor: active ? C.gold : "rgba(255,255,255,0.2)",
                    background: active ? C.gold : "transparent",
                    color: active ? C.black : "rgba(255,255,255,0.4)",
                  }}>
                  {active ? "✓" : String.fromCharCode(65 + i)}
                </span>
                {opt.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Results view ─────────────────────────────────────────────
function ResultsView({ topClass, analysis, radarData, onSendEmail }) {
  const cls = CLASS_INFO[topClass];
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSend = async () => {
    if (!name.trim() || !email.trim()) { setEmailError("Please enter your name and email."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError("Please enter a valid email address."); return; }
    setSending(true);
    setEmailError("");
    try {
      await sendEmail(email, name, topClass, analysis, radarData);
      setSent(true);
    } catch {
      setEmailError("Could not send email. Please screenshot your results!");
    } finally {
      setSending(false);
    }
  };

  // Parse analysis into sections for display
  const sections = analysis.split(/\*\*([^*]+)\*\*/).filter(Boolean).reduce((acc, part, i) => {
    if (i % 2 === 0) acc.push({ heading: part, body: "" });
    else if (acc.length > 0) acc[acc.length - 1].body = part.trim();
    return acc;
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

      {/* Top recommendation card */}
      <div className="rounded-3xl p-6 mb-6 border"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(201,168,76,0.25)" }}>
        <p className="font-body text-xs tracking-widest uppercase mb-3"
          style={{ color: "rgba(201,168,76,0.7)", letterSpacing: "0.2em" }}>Your perfect match</p>
        <div className="flex items-center gap-4 mb-3">
          <span style={{ fontSize: "2.5rem" }}>{cls.emoji}</span>
          <div>
            <h3 className="font-display font-semibold text-2xl" style={{ color: C.white }}>{cls.name}</h3>
            <p className="font-body text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{cls.desc}</p>
          </div>
        </div>
      </div>

      {/* Radar chart + AI analysis — stacked on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Radar */}
        <div className="rounded-3xl p-6 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="font-body text-xs tracking-widest uppercase mb-4" style={{ color: C.lime, letterSpacing: "0.2em" }}>Your fitness profile</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "DM Sans, sans-serif" }} />
              <Radar dataKey="value" stroke={C.gold} fill={C.gold} fillOpacity={0.18} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Analysis */}
        <div className="rounded-3xl p-6 border overflow-auto" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)", maxHeight: "320px" }}>
          <p className="font-body text-xs tracking-widest uppercase mb-4" style={{ color: C.lime, letterSpacing: "0.2em" }}>Your personal assessment</p>
          {sections.length > 0 ? sections.map((s, i) => (
            <div key={i} className="mb-4">
              <p className="font-body font-semibold text-sm mb-1" style={{ color: C.gold }}>{s.heading}</p>
              <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{s.body}</p>
            </div>
          )) : (
            <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{analysis}</p>
          )}
        </div>
      </div>

      {/* Email capture */}
      <div className="rounded-3xl p-6 border" style={{ background: "rgba(201,168,76,0.06)", borderColor: "rgba(201,168,76,0.2)" }}>
        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 py-2">
            <CheckCircle size={22} style={{ color: C.lime }} />
            <div>
              <p className="font-body font-semibold text-sm" style={{ color: C.white }}>Results sent to {email}</p>
              <p className="font-body text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Check your inbox — book your trial today!</p>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Mail size={16} style={{ color: C.gold }} />
              <p className="font-body font-semibold text-sm" style={{ color: C.white }}>Get your full report by email</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 px-4 py-3 rounded-xl font-body text-sm outline-none border"
                  style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: C.white }} />
                <input value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" type="email"
                  className="flex-1 px-4 py-3 rounded-xl font-body text-sm outline-none border"
                  style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: C.white }} />
              </div>
              <button onClick={handleSend} disabled={sending}
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl font-body font-semibold text-sm transition-all"
                style={{ background: sending ? "rgba(201,168,76,0.4)" : C.gold, color: C.black }}>
                {sending ? "Sending…" : <><span>Send my results</span><ChevronRight size={16}/></>}
              </button>
            </div>
            {emailError && <p className="font-body text-xs mt-2" style={{ color: "#e87a7a" }}>{emailError}</p>}
            <p className="font-body text-xs mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
              Your email is only used to send this report. No spam, ever.
            </p>
          </>
        )}
      </div>

      {/* CTA */}
      <div className="text-center mt-6">
        <a href="#trial"
          className="inline-flex items-center gap-2 font-body font-semibold px-8 py-4 rounded-2xl transition-all"
          style={{ background: C.gold, color: C.black, boxShadow: "0 8px 30px rgba(201,168,76,0.35)", fontSize: "15px" }}>
          Book a Trial — ₹1,000 <ArrowRight size={18} />
        </a>
        <p className="font-body text-xs mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
          One class. Real instructors. Feel the difference.
        </p>
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function PilatesQuiz() {
  const [current,   setCurrent]   = useState(0);           // 0-14 = questions, 15 = analyzing, 16 = results
  const [answers,   setAnswers]   = useState(Array(15).fill(null));
  const [analysis,  setAnalysis]  = useState("");
  const [topClass,  setTopClass]  = useState("reformer");
  const [radarData, setRadarData] = useState([]);
  const [phase,     setPhase]     = useState("quiz");       // "quiz" | "analyzing" | "results"
  const [error,     setError]     = useState("");

  const progress = ((current) / QUESTIONS.length) * 100;

  const selectAnswer = (opt) => {
    const next = [...answers];
    next[current] = opt;
    setAnswers(next);
  };

  const goNext = async () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
      return;
    }
    // Last question — run analysis
    setPhase("analyzing");
    const scores  = scoreAnswers(answers);
    const top     = getTopClass(scores);
    const radar   = buildRadarData(scores);
    setTopClass(top);
    setRadarData(radar);

    let accumulated = "";
    setError("");
    try {
      await streamAnalysis(answers, top, (chunk) => {
        accumulated += chunk;
        setAnalysis(accumulated);
      });
    } catch (e) {
      setAnalysis(`Based on your answers, ${CLASS_INFO[top].name} is your ideal starting point at Vigour. ${CLASS_INFO[top].desc}`);
      setError("");
    }
    setPhase("results");
  };

  const goBack = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  const restart = () => {
    setCurrent(0);
    setAnswers(Array(15).fill(null));
    setAnalysis("");
    setPhase("quiz");
    setError("");
  };

  return (
    <section id="quiz"
      style={{ background: `linear-gradient(160deg, ${C.forest} 0%, #0d1f10 40%, ${C.black} 100%)`,
        padding: "100px 24px", position: "relative", overflow: "hidden" }}>

      {/* Ambient orbs */}
      <div className="absolute pointer-events-none" style={{
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(45,90,52,0.2) 0%, transparent 70%)",
        top: "-200px", right: "-100px", filter: "blur(80px)"
      }} />
      <div className="absolute pointer-events-none" style={{
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
        bottom: "0", left: "-100px", filter: "blur(60px)"
      }} />

      <div className="max-w-2xl mx-auto relative">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
            style={{borderColor:"rgba(201,168,76,0.3)", background:"rgba(201,168,76,0.07)"}}>
            <span style={{color:C.gold, fontSize:"12px"}}>✦</span>
            <span className="font-body text-xs" style={{color:"rgba(201,168,76,0.8)"}}>Free — ₹2,000 value · No signup required</span>
          </div>
          <p className="font-body text-xs tracking-widest uppercase mb-3"
            style={{ color: "rgba(201,168,76,0.7)", letterSpacing: "0.2em" }}>Personalised for you</p>
          <h2 className="font-display font-semibold leading-none"
            style={{ color: C.white, fontSize: "clamp(2.5rem,6vw,4rem)" }}>
            Find your<br /><em style={{ fontStyle: "italic", color: C.gold }}>perfect class</em>
          </h2>
          <p className="font-body text-sm mt-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            15 questions · 3 minutes · AI-powered analysis sent to your inbox
          </p>
          <p className="font-body text-xs mt-2" style={{color:"rgba(125,184,122,0.6)"}}>
            ✓ Taken by 850+ Vigour members · Results include personalised class recommendation + 30-day plan
          </p>
        </motion.div>

        {/* Card */}
        <div className="rounded-4xl border p-8 md:p-10"
          style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)",
            borderColor: "rgba(255,255,255,0.07)" }}>

          {/* Progress bar — only during quiz */}
          {phase === "quiz" && (
            <div className="mb-8">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${C.green}, ${C.gold})` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }} />
              </div>
            </div>
          )}

          {/* States */}
          {phase === "quiz" && (
            <>
              <AnimatePresence mode="wait">
                <QuestionSlide
                  key={current}
                  q={QUESTIONS[current]}
                  index={current}
                  total={QUESTIONS.length}
                  selected={answers[current]}
                  onSelect={selectAnswer}
                />
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button onClick={goBack} disabled={current === 0}
                  className="flex items-center gap-2 font-body text-sm px-4 py-2 rounded-xl transition-all"
                  style={{ color: current === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)",
                    cursor: current === 0 ? "not-allowed" : "pointer" }}>
                  <ArrowLeft size={16} /> Back
                </button>

                <button onClick={goNext} disabled={!answers[current]}
                  className="flex items-center gap-2 font-body font-semibold px-6 py-3 rounded-2xl transition-all"
                  style={{
                    background: answers[current] ? C.gold : "rgba(255,255,255,0.07)",
                    color: answers[current] ? C.black : "rgba(255,255,255,0.2)",
                    cursor: answers[current] ? "pointer" : "not-allowed",
                    boxShadow: answers[current] ? "0 6px 20px rgba(201,168,76,0.3)" : "none",
                  }}>
                  {current === QUESTIONS.length - 1 ? (
                    <><Sparkles size={16} /> See My Results</>
                  ) : (
                    <>Next <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </>
          )}

          {phase === "analyzing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-16 flex flex-col items-center gap-6 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Sparkles size={36} style={{ color: C.gold }} />
              </motion.div>
              <div>
                <p className="font-display font-semibold text-xl mb-2" style={{ color: C.white }}>
                  Analysing your profile…
                </p>
                <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Our AI is building your personalised report
                </p>
              </div>
              {analysis && (
                <p className="font-body text-xs max-w-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {analysis.slice(0, 120)}…
                </p>
              )}
            </motion.div>
          )}

          {phase === "results" && (
            <>
              <ResultsView
                topClass={topClass}
                analysis={analysis}
                radarData={radarData}
                onSendEmail={() => {}}
              />
              <button onClick={restart}
                className="mt-6 font-body text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.2)", display: "block", margin: "24px auto 0" }}
                onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.2)"}>
                Retake the quiz →
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
