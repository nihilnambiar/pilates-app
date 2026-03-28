import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import { ArrowRight, Check, Star, ChevronDown, Menu, X, MapPin, Clock, Users } from "lucide-react";
import ChatBot from "../components/shared/ChatBot";
import PilatesQuiz from "../components/shared/PilatesQuiz";

// ─── COLOUR TOKENS ────────────────────────────────────────────
// Deep forest green + warm ivory + rich gold + near-black
const C = {
  black:   "#0d0d0d",
  forest:  "#1a2e1e",
  green:   "#2d5a34",
  lime:    "#7db87a",
  gold:    "#c9a84c",
  ivory:   "#f5f0e8",
  cream:   "#faf7f2",
  white:   "#ffffff",
  muted:   "#6b6b5e",
  border:  "rgba(45,90,52,0.15)",
};

// ─── Reformer SVG (fully animated) ───────────────────────────
function ReformerSVG({ progress }) {
  const carriageX  = useTransform(progress, [0,0.3,0.6,1], [0, 55, -38, 18]);
  const footbarR   = useTransform(progress, [0,0.4,1],     [0,-14, 4]);
  const springW    = useTransform(progress, [0,0.5,1],     [22,13,28]);
  const ropeEnd    = useTransform(progress, [0,1],         [360,435]);
  const platformY  = useTransform(progress, [0,0.5,1],     [0,-4,2]);

  return (
    <motion.svg viewBox="0 0 700 220" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-3xl mx-auto"
      style={{ filter:"drop-shadow(0 30px 60px rgba(29,90,52,0.3))" }}>

      {/* Ground glow */}
      <ellipse cx="350" cy="200" rx="290" ry="14" fill={C.green} opacity="0.13"/>

      {/* Frame base */}
      <rect x="20" y="168" width="660" height="16" rx="8" fill="#1c2820"/>
      <rect x="30" y="152" width="640" height="18" rx="4" fill="#253029"/>

      {/* Legs */}
      <rect x="24"  y="148" width="22" height="48" rx="5" fill="#1a2420"/>
      <rect x="654" y="148" width="22" height="48" rx="5" fill="#1a2420"/>
      <rect x="52"  y="155" width="14" height="32" rx="4" fill="#1a2420"/>
      <rect x="634" y="155" width="14" height="32" rx="4" fill="#1a2420"/>

      {/* Rails */}
      <rect x="38" y="138" width="624" height="11" rx="5" fill="#2d3d30"/>
      <rect x="38" y="149" width="624" height="6"  rx="3" fill="#253029"/>

      {/* Springs — animated gold */}
      {[0,1,2,3].map(i => (
        <motion.rect key={i} y={136} height={15} rx={3}
          style={{ x: useTransform(progress,[0,1],[60+i*26,80+i*26]), width: springW }}
          fill={i%2===0 ? C.gold : "#a8883e"} opacity={0.9}/>
      ))}

      {/* Carriage */}
      <motion.g style={{ x: carriageX, y: platformY }}>
        {/* Body */}
        <rect x="175" y="112" width="192" height="34" rx="10" fill="#f0ebe0" stroke="#d4c8a8" strokeWidth="1.5"/>
        {/* Cushion */}
        <rect x="183" y="100" width="176" height="25" rx="10" fill="#e8dfc8"/>
        <rect x="189" y="102" width="164" height="21" rx="8"  fill="#f2ead6"/>
        {/* Stitching */}
        <line x1="271" y1="102" x2="271" y2="123" stroke="#d4c8a8" strokeWidth="0.8" opacity="0.5"/>
        <line x1="240" y1="102" x2="240" y2="123" stroke="#d4c8a8" strokeWidth="0.8" opacity="0.4"/>
        <line x1="302" y1="102" x2="302" y2="123" stroke="#d4c8a8" strokeWidth="0.8" opacity="0.4"/>
        {/* Shoulder pads */}
        <rect x="183" y="98"  width="36" height="16" rx="6" fill="#d4c8a8"/>
        <rect x="323" y="98"  width="36" height="16" rx="6" fill="#d4c8a8"/>
        {/* Wheels */}
        <circle cx="200" cy="150" r="7" fill="#1a2420"/><circle cx="200" cy="150" r="3.5" fill="#2d3d30"/>
        <circle cx="222" cy="150" r="7" fill="#1a2420"/><circle cx="222" cy="150" r="3.5" fill="#2d3d30"/>
        <circle cx="318" cy="150" r="7" fill="#1a2420"/><circle cx="318" cy="150" r="3.5" fill="#2d3d30"/>
        <circle cx="340" cy="150" r="7" fill="#1a2420"/><circle cx="340" cy="150" r="3.5" fill="#2d3d30"/>
        {/* Brand plate */}
        <rect x="232" y="118" width="78" height="15" rx="4" fill="#c9a84c" opacity="0.18"/>
        <text x="271" y="128" textAnchor="middle" fontSize="7.5" fontFamily="Georgia,serif"
          fill="#c9a84c" fontWeight="600" letterSpacing="2.5">VIGOUR</text>
      </motion.g>

      {/* Footbar — gold */}
      <motion.g style={{ rotate:footbarR, originX:"86px", originY:"140px" }}
        transformOrigin="86px 140px">
        <rect x="60" y="106" width="52" height="14" rx="6" fill={C.gold}/>
        <rect x="70" y="96"  width="9"  height="46" rx="4" fill="#8a6e2e"/>
        <rect x="89" y="96"  width="9"  height="46" rx="4" fill="#8a6e2e"/>
        {[0,1,2,3,4].map(i=>(
          <line key={i} x1={62+i*8} y1="106" x2={62+i*8} y2="120"
            stroke="#a88a3a" strokeWidth="0.8" opacity="0.5"/>
        ))}
      </motion.g>

      {/* Pulley */}
      <circle cx="658" cy="120" r="15" fill="#253029" stroke="#2d3d30" strokeWidth="2"/>
      <circle cx="658" cy="120" r="8"  fill="#1a2420"/>
      <circle cx="658" cy="120" r="3"  fill={C.gold}/>

      {/* Rope */}
      <motion.line x1="658" y1="120" x2={ropeEnd} y2="120"
        stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4"/>
      <motion.g style={{ x: carriageX }}>
        <circle cx="365" cy="120" r="5.5" fill="none" stroke={C.gold} strokeWidth="2"/>
        <circle cx="365" cy="120" r="2.5" fill={C.gold}/>
      </motion.g>

      {/* Headrest tower */}
      <rect x="636" y="72"  width="28" height="80" rx="7" fill="#253029"/>
      <rect x="632" y="70"  width="36" height="22" rx="6" fill="#2d3d30"/>
      <rect x="638" y="74"  width="24" height="14" rx="4" fill="#e8dfc8"/>
    </motion.svg>
  );
}

// ─── Trial Form ───────────────────────────────────────────────
function TrialForm() {
  const [form, setForm] = useState({ name:"",email:"",phone:"",date:"",message:"" });
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name||!form.email) return;
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setSent(true); }, 1200);
  };

  if (sent) return (
    <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
      className="text-center py-16">
      <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
        style={{background:C.forest}}>✓</div>
      <h3 className="font-display text-3xl font-semibold mb-3" style={{color:C.white}}>You're in!</h3>
      <p className="font-body" style={{color:"rgba(255,255,255,0.6)"}}>
        We'll contact you within 24 hours to confirm your trial session.
      </p>
    </motion.div>
  );

  const inputStyle = {
    width:"100%", padding:"14px 18px", borderRadius:"12px",
    border:`1px solid rgba(201,168,76,0.3)`,
    background:"rgba(255,255,255,0.05)", color:C.white,
    fontFamily:"DM Sans,sans-serif", fontSize:"14px", outline:"none",
    transition:"border-color 0.2s",
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{color:"rgba(255,255,255,0.6)"}}>Full Name *</label>
          <input style={inputStyle} placeholder="Your name"
            value={form.name} onChange={e=>set("name",e.target.value)} required
            onFocus={e=>e.target.style.borderColor=C.gold}
            onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.3)"}/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{color:"rgba(255,255,255,0.6)"}}>Email *</label>
          <input type="email" style={inputStyle} placeholder="you@example.com"
            value={form.email} onChange={e=>set("email",e.target.value)} required
            onFocus={e=>e.target.style.borderColor=C.gold}
            onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.3)"}/>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{color:"rgba(255,255,255,0.6)"}}>Phone</label>
          <input style={inputStyle} placeholder="+91 98765 43210"
            value={form.phone} onChange={e=>set("phone",e.target.value)}
            onFocus={e=>e.target.style.borderColor=C.gold}
            onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.3)"}/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{color:"rgba(255,255,255,0.6)"}}>Preferred Date</label>
          <input type="date" style={{...inputStyle, colorScheme:"dark"}}
            value={form.date} onChange={e=>set("date",e.target.value)}
            onFocus={e=>e.target.style.borderColor=C.gold}
            onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.3)"}/>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{color:"rgba(255,255,255,0.6)"}}>Any notes?</label>
        <textarea style={{...inputStyle, resize:"none"}} rows={3}
          placeholder="Experience level, injuries, questions..."
          value={form.message} onChange={e=>set("message",e.target.value)}
          onFocus={e=>e.target.style.borderColor=C.gold}
          onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.3)"}/>
      </div>
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 font-body font-semibold py-4 rounded-2xl transition-all duration-300"
        style={{background:C.gold, color:C.black, fontSize:"15px",
          boxShadow: loading ? "none" : "0 8px 30px rgba(201,168,76,0.4)"}}>
        {loading ? (
          <span className="flex gap-2">
            {[0,1,2].map(i=>(
              <motion.span key={i} className="w-2 h-2 rounded-full" style={{background:C.black}}
                animate={{opacity:[0.3,1,0.3]}} transition={{duration:0.8,repeat:Infinity,delay:i*0.2}}/>
            ))}
          </span>
        ) : (<>Book Trial Session — ₹1,000 <ArrowRight size={18}/></>)}
      </button>
      <p className="text-center text-xs" style={{color:"rgba(255,255,255,0.4)"}}>
        ₹1,000 paid at the studio. No online payment required.
      </p>
    </form>
  );
}

// ─── DATA ─────────────────────────────────────────────────────
const allTestimonials = [
  { name:"Priya Sharma",    role:"Software Engineer",    stars:5,
    text:"The reformer sessions completely changed how I carry myself. My posture, my energy — everything shifted in 8 weeks." },
  { name:"Ananya Mehta",    role:"Marketing Director",   stars:5,
    text:"I didn't expect to become competitive about Pilates but here I am, top 3 on the leaderboard two months straight." },
  { name:"Ritika Joshi",    role:"Architect",            stars:5,
    text:"Post back surgery, my physio recommended Vigour. The instructors understand the body in a way that felt genuinely therapeutic." },
  { name:"Sneha Kulkarni",  role:"Product Designer",     stars:5,
    text:"I've been to studios in Mumbai and Bangalore — Vigour is leagues ahead. The attention to form is unmatched." },
  { name:"Meera Iyer",      role:"Physiotherapist",      stars:5,
    text:"As a physio I'm critical of fitness studios. Vigour's instructors genuinely understand anatomy. I send my patients here." },
  { name:"Pooja Desai",     role:"Entrepreneur",         stars:5,
    text:"Three months in, my core strength is something I've never had before. My entire body mechanics have shifted." },
  { name:"Tanvi Patil",     role:"Teacher",              stars:5,
    text:"The small class sizes make all the difference. Rohit noticed my hip alignment on day one and fixed something I'd struggled with for years." },
  { name:"Kavya Nair",      role:"Dancer",               stars:5,
    text:"As a dancer I'm particular about body awareness. Diya's cues are precise, intelligent, and completely transformative." },
];

function TestimonialCard({ t, C }) {
  return (
    <div className="flex-shrink-0 w-80 p-7 rounded-3xl border"
      style={{background:"rgba(255,255,255,0.04)", borderColor:"rgba(201,168,76,0.15)"}}>
      <div className="flex gap-1 mb-4">
        {Array(t.stars).fill(0).map((_,j)=>(
          <Star key={j} size={13} style={{fill:C.gold, color:C.gold}}/>
        ))}
      </div>
      <p className="font-accent italic text-base leading-relaxed mb-6"
        style={{color:"rgba(255,255,255,0.78)"}}>"{t.text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t" style={{borderColor:"rgba(201,168,76,0.12)"}}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold text-xs flex-shrink-0"
          style={{background:C.gold, color:C.black}}>{t.name[0]}</div>
        <div>
          <p className="font-body font-semibold text-sm" style={{color:"rgba(255,255,255,0.9)"}}>{t.name}</p>
          <p className="font-body text-xs" style={{color:"rgba(255,255,255,0.35)"}}>{t.role}</p>
        </div>
      </div>
    </div>
  );
}

const classes = [
  { name:"Mat Pilates",    video:"/classes/mat-pilates.mp4",    desc:"Core strength & flexibility on the mat",        level:"All levels",      dur:"60 min", badge:null },
  { name:"Reformer",       video:"/classes/reformer.mp4",       desc:"Full-body resistance on Balanced Body reformers", level:"Beginner+",      dur:"60 min", badge:"Most Booked" },
  { name:"Barre Fusion",   video:"/classes/barre-fusion.mp4",   desc:"Ballet-inspired sculpting & grace",             level:"All levels",      dur:"45 min", badge:null },
  { name:"Core & Restore", video:"/classes/core-restore.mp4",   desc:"Deep core work + therapeutic stretching",       level:"All levels",      dur:"75 min", badge:null },
  { name:"Power Pilates",  video:"/classes/power-pilates.mp4",  desc:"High-intensity challenge for those ready",      level:"Intermediate+",   dur:"60 min", badge:"Filling Fast" },
  { name:"Prenatal Flow",  video:"/classes/prenatal-flow.mp4",  desc:"Safe, nurturing movement every trimester",      level:"All trimesters",  dur:"60 min", badge:null },
];

const plans = [
  { name:"Starter", price:"₹2,999", sub:"4 classes/month", perClass:"₹750 per class",
    features:["Mat classes","App access","Progress tracking","Community access"], highlight:false },
  { name:"Flow",    price:"₹5,499", sub:"8 classes/month", perClass:"₹687 per class",
    features:["Mat + reformer","Priority booking","Trainer notes","1 guest pass/mo"], highlight:true, badge:"Most Popular", social:"68% of members choose this" },
  { name:"Elite",   price:"₹8,999", sub:"Unlimited classes", perClass:"Unlimited value",
    features:["All equipment","Monthly private session","2 guest passes","All workshops"], highlight:false, scarcity:"Only 4 spots remaining" },
];

const faqs = [
  { q:"Do I need prior Pilates experience?",
    a:"Not at all — 70% of our members joined with zero experience. Every session is personally guided. Our instructors adapt the workout to exactly where you are, and you'll feel the difference from class one." },
  { q:"What should I bring to a session?",
    a:"Just yourself and comfortable workout attire. Grip socks are available to borrow. That's genuinely it — 500+ members started exactly the same way." },
  { q:"How does the trial session work?",
    a:"Book below, pay ₹1,000 at the studio. You'll experience a full 60-minute class with a senior instructor, plus a personalised feedback note after. Over 80% of trial students convert to memberships — we think you'll understand why." },
  { q:"Can I freeze my membership?",
    a:"Yes — up to 60 days per year with 3 days' notice. We believe life happens and your membership should flex with you. Our members consistently rate our flexibility as their #1 reason for staying." },
  { q:"How small are the classes?",
    a:"We cap every class at 12 students — non-negotiable. Recommended by 12+ physiotherapy clinics across Pune specifically because of this. Instructors know your name, your history, and your form." },
];

const instructors = [
  { name:"Diya Nambiar",  spec:"Reformer & Rehabilitation", photo:"/instructors/diya.jpg",  years:"8 yrs experience", cert:"STOTT Pilates Certified" },
  { name:"Manisha Kakde", spec:"Mat Pilates & Barre",       photo:"/instructors/manisha.jpg", years:"6 yrs experience", cert:"Peak Pilates Certified" },
  { name:"Rohit Shinde",  spec:"Power Pilates & Strength",  photo:"/instructors/rohit.jpg",  years:"5 yrs experience", cert:"BASI Certified" },
  { name:"Kavita",        spec:"Prenatal & Restorative",    photo:"/instructors/kavita.jpg", years:"7 yrs experience", cert:"Pre/Postnatal Specialist" },
];

// ─── Gallery items ────────────────────────────────────────────
// Add your own photos/videos to /public/gallery/
// Supported: .jpg .png .webp .mp4 .mov
// type: "image" or "video"
const galleryItems = [
  { type:"image", src:"/gallery/1.jpeg", caption:"500+ Pune members transformed here",          tag:"Vigour Pilates Studio" },
  { type:"video", src:"/gallery/1.mp4",  caption:"This could be your session next week",        tag:"Reformer · 12 students max" },
  { type:"image", src:"/gallery/2.jpeg", caption:"The body you want is 12 sessions away",       tag:"Mat Pilates" },
  { type:"video", src:"/gallery/2.mp4",  caption:"What our members feel every morning",         tag:"At Vigour, Pune" },
  { type:"image", src:"/gallery/3.jpeg", caption:"Posture that changes how the world sees you", tag:"Mobility & Posture" },
  { type:"image", src:"/gallery/4.jpeg", caption:"Your transformation begins with one session", tag:"Book a Trial — ₹1,000" },
];

// ─── Gallery Section ──────────────────────────────────────────
// ─── Individual 3D tilt card ─────────────────────────────────
// ─── GSAP Gallery Section ─────────────────────────────────────
// ─── GSAP Gallery — pin: true handles scroll space ───────────
function GallerySection({ galleryItems, C }) {
  const containerRef = useRef(null);
  const textRefs     = useRef([]);
  const cardRefs     = useRef([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const n = galleryItems.length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state: only slide 0 visible
      gsap.set(textRefs.current.slice(1), { opacity: 0, y: 60 });
      gsap.set(cardRefs.current.slice(1), {
        opacity: 0, rotationY: 24, scale: 0.86, transformPerspective: 1100,
      });
      gsap.set(cardRefs.current[0], {
        opacity: 1, rotationY: 0, scale: 1, transformPerspective: 1100,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${(n - 1) * window.innerHeight}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate(self) {
            setActiveIdx(Math.min(Math.floor(self.progress * n), n - 1));
          },
        },
      });

      for (let i = 0; i < n - 1; i++) {
        const step = i * 2;
        tl
          .to(textRefs.current[i],     { opacity: 0, y: -60, duration: 1, ease: "power2.in" },  step)
          .to(cardRefs.current[i],     { opacity: 0, rotationY: -24, scale: 0.86, duration: 1, ease: "power2.in" }, step)
          .to(textRefs.current[i + 1], { opacity: 1, y: 0,   duration: 1, ease: "power2.out" }, step + 1)
          .to(cardRefs.current[i + 1], { opacity: 1, rotationY: 0, scale: 1, duration: 1, ease: "power2.out" }, step + 0.7);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [n]);

  return (
    <section ref={containerRef} style={{ background: "#080808" }}>
      {/* 100vh inner — GSAP pins this whole section, no CSS sticky needed */}
      <div style={{
        height: "100vh", display: "flex", alignItems: "stretch", overflow: "hidden",
      }}>

        {/* Ambient glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 68% 50%, rgba(201,168,76,0.055) 0%, transparent 58%)",
        }}/>

        {/* ── LEFT: text ──────────────────────────────── */}
        <div style={{
          width: "42%", position: "relative", overflow: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}>
          {/* Ghost number */}
          <div style={{
            position: "absolute", top: "50%", left: "clamp(16px,3vw,48px)",
            transform: "translateY(-55%)", pointerEvents: "none", userSelect: "none",
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: "clamp(90px,14vw,160px)", fontWeight: 700,
            color: "rgba(255,255,255,0.022)", lineHeight: 1,
          }}>
            {String(activeIdx + 1).padStart(2, "0")}
          </div>

          {/* Counter + progress bar */}
          <div style={{
            position: "absolute", top: "clamp(24px,4vh,48px)",
            left: "clamp(24px,5vw,72px)",
            display: "flex", alignItems: "center", gap: 10, zIndex: 2,
          }}>
            <span style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: 11,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
            }}>
              {String(activeIdx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            <div style={{ width: 52, height: 1, background: "rgba(255,255,255,0.08)", borderRadius: 1, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 1, background: C.gold,
                width: `${((activeIdx + 1) / n) * 100}%`,
                transition: "width 0.5s ease",
              }}/>
            </div>
          </div>

          {/* GSAP-animated text panels — all stacked absolutely */}
          {galleryItems.map((item, i) => (
            <div
              key={i}
              ref={el => { textRefs.current[i] = el; }}
              style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "0 clamp(24px,5vw,72px)",
              }}
            >
              <p style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(9px,1vw,11px)",
                letterSpacing: "0.28em", textTransform: "uppercase",
                color: C.gold, marginBottom: 14,
              }}>{item.tag}</p>
              <h2 style={{
                fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 600,
                fontSize: "clamp(1.5rem,3vw,2.8rem)", color: "#fff",
                lineHeight: 1.18, marginBottom: 20,
              }}>{item.caption}</h2>
              <div style={{ width: 36, height: 2, background: C.gold, borderRadius: 2, marginBottom: 18 }}/>
              <p style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(13px,1.1vw,15px)",
                color: "rgba(255,255,255,0.35)", lineHeight: 1.72, maxWidth: 300,
              }}>
                Every session at Vigour is capped at 12 students — so each body gets the attention it deserves.
              </p>
            </div>
          ))}

          {/* Progress pills */}
          <div style={{
            position: "absolute", bottom: "clamp(24px,4vh,48px)",
            left: "clamp(24px,5vw,72px)",
            display: "flex", gap: 6, zIndex: 2,
          }}>
            {galleryItems.map((_, di) => (
              <div key={di} style={{
                height: 3, borderRadius: 9999,
                width: di === activeIdx ? 28 : 10,
                background: di === activeIdx ? C.gold : "rgba(255,255,255,0.13)",
                transition: "all 0.4s ease",
              }}/>
            ))}
          </div>
        </div>

        {/* ── RIGHT: card panels ──────────────────────── */}
        <div style={{ flex: 1, position: "relative" }}>
          {galleryItems.map((item, i) => (
            <div
              key={i}
              ref={el => { cardRefs.current[i] = el; }}
              style={{
                position: "absolute",
                inset: "clamp(16px,2.5vw,40px)",
                borderRadius: 18, overflow: "hidden",
                boxShadow: "0 28px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              {item.type === "video" ? (
                <video src={item.src} autoPlay muted loop playsInline style={{
                  position:"absolute", inset:"-10%", width:"120%", height:"120%",
                  objectFit:"cover", filter:"blur(22px) brightness(0.32) saturate(1.3)",
                  transform:"scale(1.05)", pointerEvents:"none",
                }}/>
              ) : (
                <img src={item.src} alt="" style={{
                  position:"absolute", inset:"-10%", width:"120%", height:"120%",
                  objectFit:"cover", filter:"blur(22px) brightness(0.32) saturate(1.3)",
                  transform:"scale(1.05)", pointerEvents:"none",
                }}/>
              )}
              {item.type === "video" ? (
                <video src={item.src} autoPlay muted loop playsInline style={{
                  position:"absolute", inset:0, width:"100%", height:"100%",
                  objectFit:"contain", objectPosition:"center",
                }}/>
              ) : (
                <img src={item.src} alt={item.caption} style={{
                  position:"absolute", inset:0, width:"100%", height:"100%",
                  objectFit:"contain", objectPosition:"center",
                }}/>
              )}
              <div style={{
                position:"absolute", inset:0, pointerEvents:"none",
                background:"radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.28) 100%)",
              }}/>
              <div style={{
                position:"absolute", top:0, left:0, right:0, height:1,
                background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.13),transparent)",
              }}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function LandingPage() {
  const containerRef = useRef(null);
  const machineRef   = useRef(null);
  const [navOpen, setNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const { scrollYProgress: machineScroll } = useScroll({
    target: machineRef,
    offset: ["start end","end start"],
  });

  const smoothMachine = useSpring(machineScroll, { stiffness:40, damping:18 });

  const heroY       = useTransform(scrollYProgress, [0,0.15], [0,-60]);
  const heroOpacity = useTransform(scrollYProgress, [0,0.18], [1,0]);

  return (
    <div ref={containerRef} className="font-body"
      style={{ background:C.cream, color:C.black, overflowX:"clip" }}>

      {/* ── NAV ─────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background:"rgba(245,240,232,0.85)", backdropFilter:"blur(20px)",
          borderColor:C.border }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold text-white text-sm"
              style={{ background:C.forest }}>V</div>
            <div>
              <span className="font-display text-xl font-semibold" style={{color:C.forest}}>Vigour</span>
              <span className="hidden sm:inline font-body text-xs ml-2 tracking-widest uppercase" style={{color:C.muted}}>Pilates, Pune</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {["classes","pricing","testimonials","faq"].map(l=>(
              <a key={l} href={`#${l}`} className="font-body text-sm capitalize transition-colors"
                style={{color:C.muted}} onMouseEnter={e=>e.target.style.color=C.green}
                onMouseLeave={e=>e.target.style.color=C.muted}>{l}</a>
            ))}
          </div>

          {/* Desktop-only extras */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#quiz" className="font-body text-sm px-4 py-2 rounded-xl transition-colors"
              style={{color:C.green}}>Take the Quiz</a>
          </div>

          {/* Book Trial — always visible on all screen sizes */}
          <a href="#trial"
            className="font-body font-semibold rounded-xl transition-all relative flex-shrink-0"
            style={{background:C.forest, color:C.ivory,
              boxShadow:`0 4px 20px rgba(26,46,30,0.3)`,
              padding:"10px 16px", fontSize:"13px", lineHeight:1}}>
            <span className="hidden sm:inline">Book Your Trial</span>
            <span className="sm:hidden">Book Trial</span>
          </a>

          {/* Hamburger — mobile only */}
          <button onClick={()=>setNavOpen(!navOpen)} className="md:hidden p-2 rounded-xl"
            style={{color:C.forest}}>
            {navOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>

        {navOpen && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
            className="md:hidden border-t px-6 py-4 space-y-3"
            style={{borderColor:C.border, background:C.cream}}>
            {["classes","pricing","testimonials","faq"].map(l=>(
              <a key={l} href={`#${l}`} onClick={()=>setNavOpen(false)}
                className="block font-body py-2 border-b capitalize" style={{color:C.black, borderColor:C.border}}>{l}</a>
            ))}
            <a href="#quiz" onClick={()=>setNavOpen(false)}
              className="block font-body py-2 text-center rounded-xl border font-medium"
              style={{color:C.forest, borderColor:C.forest}}>Take the Quiz</a>
            <a href="#trial" onClick={()=>setNavOpen(false)}
              className="block font-body py-3 text-center rounded-xl font-semibold"
              style={{background:C.forest, color:C.ivory}}>Book Trial — ₹1,000</a>
          </motion.div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden"
        style={{ background:`linear-gradient(160deg, ${C.forest} 0%, #0d1f10 50%, ${C.black} 100%)` }}>

        {/* Grain texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")" }}/>

        {/* Ambient orbs */}
        <div className="absolute pointer-events-none" style={{
          width:"700px", height:"700px", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(45,90,52,0.35) 0%, transparent 70%)",
          top:"-200px", left:"-150px", filter:"blur(80px)"
        }}/>
        <div className="absolute pointer-events-none" style={{
          width:"500px", height:"500px", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
          bottom:"0px", right:"-100px", filter:"blur(60px)"
        }}/>

        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(90deg, transparent, ${C.gold}, transparent)`}}/>

        {/* Scattered dots */}
        {[[10,20],[85,15],[15,70],[88,65],[50,88]].map(([x,y],i)=>(
          <div key={i} className="absolute w-1 h-1 rounded-full opacity-40"
            style={{left:`${x}%`, top:`${y}%`, background:C.gold}}/>
        ))}

        <motion.div style={{y:heroY, opacity:heroOpacity}}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto">

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8}}
            className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full mb-8 border"
            style={{borderColor:`rgba(201,168,76,0.4)`, background:`rgba(201,168,76,0.08)`}}>
            <span className="font-body text-sm" style={{color:C.gold}}>⭐ 4.9/5</span>
            <span className="hidden sm:inline" style={{width:"1px", height:"14px", background:"rgba(201,168,76,0.3)"}}/>
            <span className="hidden sm:inline font-body text-sm" style={{color:C.gold}}>Pune's most-loved Pilates studio</span>
            <span style={{width:"1px", height:"14px", background:"rgba(201,168,76,0.3)", display:"inline-block"}}/>
            <span className="font-body text-sm" style={{color:"rgba(201,168,76,0.7)"}}>500+ members</span>
          </motion.div>

          <motion.h1 initial={{opacity:0,y:50}} animate={{opacity:1,y:0}} transition={{duration:1, delay:0.1}}
            className="font-display font-semibold leading-none mb-8"
            style={{fontSize:"clamp(2.8rem,9vw,8rem)", color:C.white}}>
            Move with<br/>
            <em style={{color:C.gold, fontStyle:"italic"}}>intention.</em>
          </motion.h1>

          <motion.p initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.9, delay:0.25}}
            className="font-accent italic text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{color:"rgba(255,255,255,0.55)"}}>
            "In 10 sessions you will feel the difference.<br className="hidden sm:block"/>
            In 20, you will see the difference."
            <span className="block font-body not-italic text-base mt-3" style={{color:"rgba(201,168,76,0.7)"}}>
              — Joseph Pilates
            </span>
          </motion.p>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8, delay:0.4}}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#trial"
              className="flex items-center gap-2 font-body font-semibold px-8 py-4 rounded-2xl transition-all duration-300"
              style={{background:C.gold, color:C.black, boxShadow:`0 12px 40px rgba(201,168,76,0.4)`,
                fontSize:"15px"}}>
              Book Trial Session <ArrowRight size={18}/>
            </a>
            <a href="#quiz"
              className="flex items-center gap-2 font-body px-8 py-4 rounded-2xl border transition-all duration-300"
              style={{borderColor:"rgba(255,255,255,0.2)", color:C.white, fontSize:"15px"}}>
              Find My Class
            </a>
          </motion.div>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6">
            <span className="font-body text-xs flex items-center gap-1.5" style={{color:"rgba(255,255,255,0.35)"}}>
              <span style={{color:C.lime, fontSize:"10px"}}>●</span> 127 trials booked this month
            </span>
            <span className="hidden sm:inline" style={{color:"rgba(255,255,255,0.15)"}}>·</span>
            <span className="font-body text-xs flex items-center gap-1.5" style={{color:"rgba(255,255,255,0.35)"}}>
              <span style={{color:"#e87a4a", fontSize:"10px"}}>●</span> Only 8 trial spots left this week
            </span>
            <span className="hidden sm:inline" style={{color:"rgba(255,255,255,0.15)"}}>·</span>
            <span className="font-body text-xs" style={{color:"rgba(255,255,255,0.35)"}}>No commitment required</span>
          </motion.div>

          {/* Stats bar */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.65}}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-20 pt-12 border-t"
            style={{borderColor:"rgba(255,255,255,0.1)"}}>
            {[["500+","Members"],["12","Max class size"],["4","Expert trainers"],["4.9★","Rating"]].map(([v,l])=>(
              <div key={l} className="text-center">
                <p className="font-display text-3xl font-semibold" style={{color:C.gold}}>{v}</p>
                <p className="font-body text-xs mt-1 tracking-wider uppercase" style={{color:"rgba(255,255,255,0.4)"}}>{l}</p>
              </div>
            ))}
          </motion.div>

          <motion.div className="mt-14" animate={{y:[0,8,0]}} transition={{duration:2,repeat:Infinity}}>
            <ChevronDown size={28} className="mx-auto" style={{color:"rgba(201,168,76,0.5)"}}/>
          </motion.div>
        </motion.div>
      </section>

      {/* ── GALLERY SCROLL ───────────────────────── */}
      <GallerySection galleryItems={galleryItems} C={C} />

      {/* ── PHILOSOPHY ───────────────────────── */}
      <section style={{background:C.black, padding:"100px 24px", position:"relative", overflow:"hidden"}}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background:"radial-gradient(ellipse 60% 60% at 50% 50%, rgba(45,90,52,0.15) 0%, transparent 70%)"
        }}/>
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}}
          viewport={{once:true}} transition={{duration:1}}
          style={{maxWidth:"860px", margin:"0 auto", textAlign:"center", position:"relative", zIndex:1}}>
          <div style={{
            width:"40px", height:"1px", background:C.gold, margin:"0 auto 40px",
            opacity:0.7
          }}/>
          <p style={{
            fontFamily:"'Cormorant Garamond', Georgia, serif",
            fontSize:"clamp(1.6rem,4.5vw,3.8rem)",
            fontStyle:"italic", fontWeight:400,
            color:C.white, lineHeight:1.35,
            letterSpacing:"-0.01em", marginBottom:"40px"
          }}>
            "In 10 sessions you feel the difference. In 20, you see it. In 30, you have a whole new body."
          </p>
          <div style={{width:"40px", height:"1px", background:C.gold, margin:"0 auto 24px", opacity:0.7}}/>
          <p style={{
            fontFamily:"'DM Sans', sans-serif", fontSize:"13px",
            letterSpacing:"0.2em", textTransform:"uppercase",
            color:"rgba(201,168,76,0.6)"
          }}>— Joseph Pilates</p>
        </motion.div>
      </section>

            {/* ── CLASSES ──────────────────────────────── */}
      <section id="classes" className="py-28 px-6" style={{background:C.cream}}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="font-body text-xs tracking-widest uppercase mb-3" style={{color:C.green, letterSpacing:"0.2em"}}>What we offer</p>
              <h2 className="font-display font-semibold leading-none" style={{color:C.forest, fontSize:"clamp(3rem,7vw,5.5rem)"}}>
                Our<br/><em style={{fontStyle:"italic", color:C.gold}}>classes</em>
              </h2>
            </div>
            <p className="font-accent italic text-lg max-w-xs" style={{color:C.muted, paddingBottom:"8px"}}>
              Every class. Max 12 students.<br/>Genuine attention to every body.
            </p>
          </motion.div>

          <motion.p initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="font-body text-sm mb-12 -mt-10"
            style={{color:C.muted}}>
            Trusted by physiotherapy clinics across Pune · Recommended for post-injury recovery
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((c,i)=>(
              <motion.div key={c.name} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*0.07}}
                className="group rounded-3xl overflow-hidden cursor-default"
                style={{background:C.forest, boxShadow:"0 4px 30px rgba(26,46,30,0.1)", transition:"transform 0.3s ease, box-shadow 0.3s ease"}}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.boxShadow="0 24px 60px rgba(26,46,30,0.2)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 30px rgba(26,46,30,0.1)"; }}>

                {/* Video area — portrait ratio */}
                <div className="relative overflow-hidden" style={{aspectRatio:"4/5", background:"#1a2e1e"}}>
                  <video
                    src={c.video} muted loop playsInline
                    style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", display:"block", opacity:0.85 }}
                    onMouseEnter={e=>e.target.play()}
                    onMouseLeave={e=>{ e.target.pause(); e.target.currentTime=0; }}
                  />
                  {/* Gradient overlay bottom */}
                  <div style={{
                    position:"absolute", inset:0,
                    background:"linear-gradient(180deg, transparent 40%, rgba(13,20,14,0.92) 100%)"
                  }}/>
                  {/* Overlay text */}
                  <div style={{position:"absolute", bottom:0, left:0, right:0, padding:"24px"}}>
                    <h3 className="font-display font-semibold mb-2" style={{color:C.white, fontSize:"1.35rem", lineHeight:1.2}}>{c.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs font-body px-2.5 py-1 rounded-full" style={{background:"rgba(201,168,76,0.25)", color:C.gold, border:"1px solid rgba(201,168,76,0.3)"}}>{c.level}</span>
                      <span className="text-xs font-body px-2.5 py-1 rounded-full" style={{background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)"}}>{c.dur}</span>
                      {c.badge && (
                        <span className="text-xs font-body font-semibold px-2.5 py-1 rounded-full"
                          style={{background: c.badge==="Filling Fast" ? "rgba(232,122,74,0.85)" : "rgba(201,168,76,0.85)", color:C.black}}>
                          {c.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Play icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background:"rgba(201,168,76,0.85)", backdropFilter:"blur(4px)"}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d0d0d"><polygon points="6,3 20,12 6,21"/></svg>
                    </div>
                  </div>
                </div>

                {/* Description strip */}
                <div style={{padding:"16px 20px 20px"}}>
                  <p className="font-body text-sm leading-relaxed" style={{color:"rgba(245,240,232,0.6)"}}>{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTRUCTORS ──────────────────────────── */}
      <section style={{background:C.black, padding:"100px 24px", position:"relative", overflow:"hidden"}}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background:"radial-gradient(ellipse 80% 50% at 20% 80%, rgba(45,90,52,0.1) 0%, transparent 60%)"
        }}/>
        <div className="max-w-7xl mx-auto" style={{position:"relative"}}>
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="mb-14">
            <p className="font-body text-xs tracking-widest uppercase mb-3" style={{color:C.gold, letterSpacing:"0.2em"}}>The team</p>
            <h2 className="font-display font-semibold leading-none mb-6" style={{color:C.white, fontSize:"clamp(3rem,7vw,5.5rem)"}}>
              Meet your<br/><em style={{fontStyle:"italic", color:C.lime}}>instructors</em>
            </h2>
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full border"
              style={{borderColor:"rgba(125,184,122,0.3)", background:"rgba(125,184,122,0.06)", maxWidth:"100%"}}>
              <span style={{color:C.lime, fontSize:"12px", flexShrink:0}}>✓</span>
              <span className="font-body text-xs md:text-sm" style={{color:"rgba(255,255,255,0.6)"}}>Internationally certified · Recommended by 12+ physio clinics in Pune</span>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructors.map((inst,i)=>(
              <motion.div key={inst.name} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*0.1}}
                className="group"
                style={{cursor:"default"}}>
                {/* Photo circle / placeholder */}
                <div className="relative mb-5 overflow-hidden rounded-3xl"
                  style={{aspectRatio:"3/4", background:`linear-gradient(160deg, #1e3a22 0%, #0d1f10 100%)`,
                    border:`1px solid rgba(201,168,76,0.1)`}}>
                  <img src={inst.photo} alt={inst.name}
                    style={{width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top",
                      opacity:0.85, transition:"transform 0.5s ease, opacity 0.3s"}}
                    onMouseEnter={e=>{e.target.style.transform="scale(1.04)"; e.target.style.opacity="1";}}
                    onMouseLeave={e=>{e.target.style.transform=""; e.target.style.opacity="0.85";}}
                    onError={e=>{
                      e.target.style.display="none";
                      e.target.parentNode.style.display="flex";
                      e.target.parentNode.style.alignItems="center";
                      e.target.parentNode.style.justifyContent="center";
                    }}
                  />
                  {/* Gold gradient bottom */}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:"40%",
                    background:"linear-gradient(180deg,transparent,rgba(13,13,13,0.7))"}}/>
                </div>
                <h3 className="font-display font-semibold text-lg mb-1" style={{color:C.white}}>{inst.name}</h3>
                <p className="font-body text-sm mb-1" style={{color:"rgba(201,168,76,0.7)"}}>{inst.spec}</p>
                <p className="font-body text-xs" style={{color:"rgba(255,255,255,0.3)"}}>{inst.years} · {inst.cert}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — dual infinite marquee ── */}
      <section id="testimonials" className="py-28 overflow-hidden"
        style={{background:`linear-gradient(135deg, ${C.forest} 0%, #152319 100%)`}}>

        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
          viewport={{once:true}} className="px-6 max-w-7xl mx-auto mb-14">
          <p className="font-body text-sm tracking-widest uppercase mb-3" style={{color:C.gold}}>Testimonials</p>
          <h2 className="font-display font-semibold leading-none mb-6" style={{color:C.white, fontSize:"clamp(3rem,7vw,5.5rem)"}}>
            Member <em style={{fontStyle:"italic", color:C.gold}}>stories</em>
          </h2>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-2">
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(i=>(
                <Star key={i} size={15} style={{fill:C.gold, color:C.gold}}/>
              ))}
              <span className="font-body text-sm ml-2" style={{color:"rgba(255,255,255,0.5)"}}>4.9 · 200+ reviews</span>
            </div>
            <span className="font-body text-xs px-3 py-1.5 rounded-full border" style={{borderColor:"rgba(125,184,122,0.3)", color:C.lime, whiteSpace:"nowrap"}}>
              ✓ Join 500+ Pune members
            </span>
          </div>
        </motion.div>

        {/* Row 1 — scrolls left */}
        <div className="relative mb-5 overflow-hidden"
          style={{WebkitMaskImage:"linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)",
            maskImage:"linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)"}}>
          <motion.div className="flex gap-5 w-max"
            animate={{x:["0px", "-50%"]}}
            transition={{duration:40, ease:"linear", repeat:Infinity}}>
            {[...allTestimonials, ...allTestimonials].map((t,i) => (
              <TestimonialCard key={`r1-${i}`} t={t} C={C}/>
            ))}
          </motion.div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="relative overflow-hidden"
          style={{WebkitMaskImage:"linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)",
            maskImage:"linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%)"}}>
          <motion.div className="flex gap-5 w-max"
            animate={{x:["-50%", "0px"]}}
            transition={{duration:32, ease:"linear", repeat:Infinity}}>
            {[...allTestimonials, ...allTestimonials].map((t,i) => (
              <TestimonialCard key={`r2-${i}`} t={t} C={C}/>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────── */}
      <section id="pricing" className="py-28 px-6" style={{background:"#0a0f0b", position:"relative", overflow:"hidden"}}>
        <div className="max-w-7xl mx-auto">
          <div className="absolute inset-0 pointer-events-none" style={{
            background:"radial-gradient(ellipse 60% 60% at 70% 40%, rgba(45,90,52,0.12) 0%, transparent 70%)"
          }}/>
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="mb-16">
            <p className="font-body text-sm tracking-widest uppercase mb-3" style={{color:C.gold}}>Membership</p>
            <h2 className="font-display text-5xl md:text-6xl font-semibold mb-4" style={{color:C.white}}>
              Invest in your body
            </h2>
            <p className="font-body text-sm" style={{color:"rgba(255,255,255,0.35)"}}>
              Start with a ₹1,000 trial — upgrade to membership when you're ready. No pressure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p,i)=>(
              <motion.div key={p.name} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*0.1}}
                className="relative p-8 rounded-3xl border"
                style={{
                  background: p.highlight ? C.forest : "rgba(255,255,255,0.04)",
                  borderColor: p.highlight ? C.gold : "rgba(255,255,255,0.08)",
                  boxShadow: p.highlight ? `0 20px 60px rgba(26,46,30,0.25), 0 0 0 1px ${C.gold}` : "none"
                }}>
                {p.badge && (
                  <div className="absolute -top-3.5 left-8">
                    <span className="text-xs font-body font-semibold px-4 py-1.5 rounded-full"
                      style={{background:C.gold, color:C.black}}>{p.badge}</span>
                  </div>
                )}
                <h3 className="font-display text-2xl font-semibold mb-1"
                  style={{color: p.highlight ? C.white : "rgba(255,255,255,0.9)"}}>{p.name}</h3>
                <p className="font-body text-sm mb-4" style={{color: p.highlight ? C.lime : "rgba(255,255,255,0.4)"}}>{p.sub}</p>
                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b"
                  style={{borderColor: p.highlight ? "rgba(201,168,76,0.2)" : C.border}}>
                  <span className="font-display text-4xl font-semibold"
                    style={{color: p.highlight ? C.gold : "rgba(255,255,255,0.85)"}}>{p.price}</span>
                  <span className="font-body text-sm" style={{color: p.highlight ? "rgba(255,255,255,0.4)" : C.muted}}>/mo</span>
                </div>
                <p className="font-body text-xs mb-6 -mt-4" style={{color:"rgba(255,255,255,0.25)"}}>{p.perClass}</p>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f=>(
                    <li key={f} className="flex items-center gap-3 font-body text-sm"
                      style={{color: p.highlight ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.65)"}}>
                      <Check size={14} style={{color: p.highlight ? C.lime : C.lime, flexShrink:0}}/>{f}
                    </li>
                  ))}
                </ul>
                {p.social && (
                  <p className="font-body text-xs mb-3 text-center" style={{color:C.lime}}>✓ {p.social}</p>
                )}
                {p.scarcity && (
                  <p className="font-body text-xs mb-3 text-center" style={{color:"#e87a4a"}}>⚡ {p.scarcity}</p>
                )}
                <a href="#trial"
                  className="block text-center py-3.5 rounded-2xl font-body font-semibold text-sm transition-all duration-300"
                  style={p.highlight
                    ? {background:C.gold, color:C.black, boxShadow:`0 8px 25px rgba(201,168,76,0.3)`}
                    : {background:"transparent", color:"rgba(255,255,255,0.8)", border:"1.5px solid rgba(255,255,255,0.2)"}}>
                  Get Started
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUIZ ─────────────────────────────────── */}
      <PilatesQuiz />

      {/* ── FAQ ──────────────────────────────────── */}
      <section id="faq" className="py-28 px-6" style={{background:"#050a06"}}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="mb-16">
            <p className="font-body text-sm tracking-widest uppercase mb-3" style={{color:C.gold}}>FAQ</p>
            <h2 className="font-display text-5xl md:text-6xl font-semibold" style={{color:C.white}}>
              Good questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((f,i)=>(
              <motion.div key={i} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*0.07}}
                className="border rounded-2xl overflow-hidden cursor-pointer transition-all"
                style={{borderColor: openFaq===i ? `rgba(201,168,76,0.4)` : "rgba(255,255,255,0.08)",
                  background: openFaq===i ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.03)"}}
                onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                <div className="flex items-center justify-between gap-4 p-6">
                  <h3 className="font-body font-semibold text-sm md:text-base" style={{color:"rgba(255,255,255,0.9)"}}>{f.q}</h3>
                  <motion.div animate={{rotate:openFaq===i?45:0}} transition={{duration:0.2}}
                    className="text-xl flex-shrink-0 font-light" style={{color:C.gold}}>+</motion.div>
                </div>
                {openFaq===i && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} className="px-6 pb-6">
                    <p className="font-body text-sm leading-relaxed" style={{color:"rgba(255,255,255,0.65)"}}>{f.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRIAL BOOKING ────────────────────────── */}
      <section id="trial" className="py-28 px-6"
        style={{background:`linear-gradient(160deg, #0d1f10 0%, ${C.forest} 100%)`}}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="text-center mb-12">
            <p className="font-body text-sm tracking-widest uppercase mb-3" style={{color:C.gold}}>First session</p>
            <h2 className="font-display font-semibold mb-4 leading-none" style={{color:C.white, fontSize:"clamp(3rem,7vw,5rem)"}}>
              Book your<br/><em style={{fontStyle:"italic", color:C.gold}}>trial</em>
            </h2>
            <p className="font-accent italic text-xl" style={{color:"rgba(255,255,255,0.5)"}}>
              One session. ₹1,000. Zero commitment.
            </p>
            <p className="font-body text-sm mt-2" style={{color:"rgba(255,255,255,0.3)"}}>
              Recommended by physiotherapists · 80% of trial students become members
            </p>

            {/* Info pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {[
                [Clock, "60 minutes"],
                [Users, "Max 12 students"],
                [MapPin, "Pune studio"],
              ].map(([Icon,text])=>(
                <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-body"
                  style={{borderColor:"rgba(201,168,76,0.25)", color:"rgba(255,255,255,0.6)"}}>
                  <Icon size={13} style={{color:C.gold}}/>{text}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-5">
              <span className="font-body text-xs flex items-center gap-1.5" style={{color:"rgba(255,255,255,0.4)"}}>
                <span style={{color:"#e87a4a", fontSize:"10px"}}>●</span> Only 8 trial spots left this week
              </span>
              <span className="hidden sm:inline" style={{color:"rgba(255,255,255,0.15)"}}>·</span>
              <span className="font-body text-xs flex items-center gap-1.5" style={{color:"rgba(255,255,255,0.4)"}}>
                <span style={{color:C.lime, fontSize:"10px"}}>●</span> 127 people booked this month
              </span>
              <span className="hidden sm:inline" style={{color:"rgba(255,255,255,0.15)"}}>·</span>
              <span className="font-body text-xs" style={{color:"rgba(255,255,255,0.4)"}}>Free welcome kit included</span>
            </div>
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}}
            className="p-8 md:p-10 rounded-4xl border"
            style={{background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)",
              borderColor:"rgba(201,168,76,0.2)"}}>
            <TrialForm/>
          </motion.div>
        </div>
      </section>

      {/* ── LOCATION ─────────────────────────────── */}
      <section className="py-24 px-6" style={{background:C.cream}}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} className="mb-12">
            <p className="font-body text-sm tracking-widest uppercase mb-3" style={{color:C.green}}>Find us</p>
            <h2 className="font-display font-semibold leading-none" style={{color:C.forest, fontSize:"clamp(2.5rem,6vw,4.5rem)"}}>
              We're in <em style={{fontStyle:"italic", color:C.green}}>Pune</em>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Map embed */}
            <motion.div className="lg:col-span-3 rounded-3xl overflow-hidden border"
              initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}}
              viewport={{once:true}} transition={{duration:0.8}}
              style={{borderColor:C.border, height:"400px", boxShadow:"0 20px 60px rgba(26,46,30,0.12)"}}>
              {/* ─────────────────────────────────────────────────────
                  TO PIN YOUR EXACT LOCATION:
                  1. Open maps.google.com and search your studio address
                  2. Click Share → Embed a map → Copy the src URL
                  3. Replace the src below with your copied URL
                  ───────────────────────────────────────────────────── */}
              <iframe
                src="https://maps.google.com/maps?q=Vigour+Pilates+Studio+Pune+Maharashtra&output=embed&z=15"
                width="100%" height="100%" style={{border:0, display:"block"}}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title="Vigour Pilates Studio Location"/>
            </motion.div>

            {/* Info cards */}
            <motion.div className="lg:col-span-2 space-y-4"
              initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}}
              viewport={{once:true}} transition={{duration:0.8, delay:0.1}}>

              {/* Address */}
              <div className="p-6 rounded-2xl border" style={{background:C.white, borderColor:C.border}}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{background:`rgba(26,46,30,0.08)`}}>
                    <MapPin size={18} style={{color:C.green}}/>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-sm mb-1" style={{color:C.forest}}>Studio Address</p>
                    <p className="font-body text-sm leading-relaxed" style={{color:C.muted}}>
                      Pune, Maharashtra<br/>
                      <span className="text-xs">📍 Exact address shared on booking confirmation</span>
                    </p>
                    <a href="https://share.google/nFWKDIzAMm9hc5J24"
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-body font-semibold px-4 py-2 rounded-xl transition-all"
                      style={{background:C.forest, color:C.ivory, boxShadow:"0 4px 15px rgba(26,46,30,0.3)"}}>
                      <MapPin size={12}/> Get Directions
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="p-6 rounded-2xl border" style={{background:C.white, borderColor:C.border}}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{background:`rgba(26,46,30,0.08)`}}>
                    <Clock size={18} style={{color:C.green}}/>
                  </div>
                  <div className="w-full">
                    <p className="font-body font-semibold text-sm mb-3" style={{color:C.forest}}>Studio Hours</p>
                    <div className="space-y-1.5">
                      {[
                        ["Mon – Fri", "6:00 AM – 9:00 PM"],
                        ["Saturday",  "7:00 AM – 6:00 PM"],
                        ["Sunday",    "Closed"],
                      ].map(([day,hrs])=>(
                        <div key={day} className="flex justify-between font-body text-sm">
                          <span style={{color:C.muted}}>{day}</span>
                          <span style={{color: day==="Sunday" ? "#e24b4a" : C.forest, fontWeight:"500"}}>{hrs}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-2xl border" style={{background:C.forest, borderColor:C.forest}}>
                <p className="font-body font-semibold text-sm mb-1" style={{color:C.gold}}>Questions?</p>
                <p className="font-body text-sm mb-4" style={{color:"rgba(255,255,255,0.6)"}}>
                  Reach us on WhatsApp or book a free 5-min call before your trial.
                </p>
                <a href="#trial"
                  className="block text-center font-body font-semibold text-sm py-3 rounded-xl transition-all"
                  style={{background:C.gold, color:C.black}}>
                  Book Trial — ₹1,000
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer style={{background:C.black, borderTop:`1px solid rgba(255,255,255,0.06)`}}>
        <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold text-sm"
                style={{background:C.forest, color:C.gold}}>V</div>
              <span className="font-display text-xl font-semibold" style={{color:C.white}}>Vigour</span>
            </div>
            <p className="font-body text-sm leading-relaxed" style={{color:"rgba(255,255,255,0.35)"}}>
              Pune's most intimate premium Pilates studio. Precision, intention, transformation.
            </p>
            <p className="font-body text-xs mt-4" style={{color:"rgba(201,168,76,0.5)"}}>
              📍 Pune, Maharashtra
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="font-body font-semibold text-sm mb-4" style={{color:C.white}}>Studio</p>
              {["classes","pricing","faq"].map(l=>(
                <a key={l} href={`#${l}`}
                  className="block font-body text-sm mb-2.5 capitalize transition-colors"
                  style={{color:"rgba(255,255,255,0.4)"}}
                  onMouseEnter={e=>e.target.style.color=C.gold}
                  onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.4)"}>{l}</a>
              ))}
            </div>
            <div>
              <p className="font-body font-semibold text-sm mb-4" style={{color:C.white}}>Studio</p>
              <a href="#quiz" className="block font-body text-sm mb-2.5 transition-colors"
                style={{color:"rgba(255,255,255,0.4)"}}
                onMouseEnter={e=>e.target.style.color=C.gold}
                onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.4)"}>Find My Class</a>
              <a href="#trial" className="block font-body text-sm mb-2.5 transition-colors"
                style={{color:"rgba(255,255,255,0.4)"}}
                onMouseEnter={e=>e.target.style.color=C.gold}
                onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.4)"}>Book trial</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-8 flex flex-col sm:flex-row justify-between gap-2 border-t"
          style={{borderColor:"rgba(255,255,255,0.06)"}}>
          <p className="font-body text-xs pt-6" style={{color:"rgba(255,255,255,0.2)"}}>
            © 2026 Vigour Pilates Studio, Pune. All rights reserved.
          </p>
          <p className="font-body text-xs pt-6" style={{color:"rgba(201,168,76,0.3)"}}>
            Made with intention in Pune 🌿
          </p>
        </div>
      </footer>

      {/* ── Chatbot ──────────────────────────────────── */}
      <ChatBot />
    </div>
  );
}
