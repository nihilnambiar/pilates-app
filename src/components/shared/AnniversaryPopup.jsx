import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const OFFER_END = new Date("2026-06-10T23:59:59");

const TIERS = [
  { price: "10,000", sessions: 12, bonus: 2,  pink: true  },
  { price: "15,000", sessions: 20, bonus: 3,  pink: false },
  { price: "16,000", sessions: 22, bonus: 4,  pink: true  },
  { price: "30,000", sessions: 36, bonus: 8,  pink: false },
];

// Simple pilates silhouette — a person in a side-stretch pose
function PilatesFigure({ color = "#fff" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      {/* Head */}
      <circle cx="12" cy="3.5" r="2" fill={color} opacity="0.9"/>
      {/* Body reaching up-right */}
      <path d="M12 5.5 L10 13 L8 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.9"/>
      {/* Right arm reaching up */}
      <path d="M12 8 L17 5" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.9"/>
      {/* Left arm reaching down */}
      <path d="M11 10 L7 13" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.9"/>
      {/* Right leg */}
      <path d="M10 13 L14 19" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.9"/>
    </svg>
  );
}

function getDaysLeft() {
  return Math.max(0, Math.ceil((OFFER_END - new Date()) / 86400000));
}

export default function AnniversaryPopup() {
  const [visible, setVisible] = useState(false);
  const daysLeft = getDaysLeft();

  useEffect(() => {
    if (new Date() > OFFER_END) return;
    const t = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(t);
  }, []);

  const close = () => setVisible(false);

  const goToPricing = () => {
    close();
    setTimeout(() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }), 200);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* Card */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
          >
            <div
              className="relative w-full max-w-[340px] rounded-[28px] overflow-hidden"
              style={{ boxShadow: "0 32px 80px rgba(194,24,91,0.35), 0 8px 24px rgba(0,0,0,0.25)" }}
              onClick={e => e.stopPropagation()}
            >

              {/* ── HEADER ─────────────────────────────── */}
              <div
                className="relative px-6 pt-8 pb-10 text-center overflow-hidden"
                style={{ background: "linear-gradient(160deg, #6a0032 0%, #c2185b 45%, #f06292 100%)" }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}/>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}/>

                {/* Gold dots */}
                {[[8,10],[85,8],[92,35],[12,65],[78,55]].map(([l,t],i) => (
                  <div key={i} className="absolute rounded-full animate-pulse"
                    style={{ left:`${l}%`, top:`${t}%`, width: i%2===0?5:4, height: i%2===0?5:4,
                      background: i%2===0 ? "#ffd700" : "rgba(255,255,255,0.6)", opacity: 0.7 }}/>
                ))}

                {/* Close */}
                <button onClick={close}
                  className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.2)" }}>
                  <X size={13} color="rgba(255,255,255,0.85)" strokeWidth={2.5}/>
                </button>

                {/* Eyebrow */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span style={{ color: "#ffd700", fontSize: 13 }}>✦</span>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                    Celebrate Our
                  </span>
                  <span style={{ color: "#ffd700", fontSize: 13 }}>✦</span>
                </div>

                {/* Title */}
                <h2 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 42, fontWeight: 700, color: "#fff",
                  lineHeight: 1, margin: "0 0 10px",
                  textShadow: "0 2px 20px rgba(0,0,0,0.2)",
                  letterSpacing: "-0.5px",
                }}>
                  Anniversary
                </h2>

                {/* OFFER pill */}
                <div style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #4a0072, #7b1fa2)",
                  borderRadius: 50, padding: "7px 32px",
                  color: "#fff", fontWeight: 900, fontSize: 17,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  boxShadow: "0 4px 16px rgba(74,0,114,0.5)",
                }}>
                  OFFER
                </div>

                {/* Tagline */}
                <p style={{
                  color: "rgba(255,255,255,0.75)", fontSize: 12,
                  marginTop: 10, fontStyle: "italic", letterSpacing: "0.03em",
                }}>
                  Stronger Body · Calmer Mind · Better You
                </p>
              </div>

              {/* Wave separator */}
              <div style={{ background: "linear-gradient(160deg,#6a0032,#c2185b,#f06292)", marginTop: -1 }}>
                <svg viewBox="0 0 340 22" style={{ display:"block", width:"100%", height:22 }}>
                  <path d="M0,0 C85,22 255,22 340,0 L340,22 L0,22 Z" fill="#fff"/>
                </svg>
              </div>

              {/* ── BODY ───────────────────────────────── */}
              <div style={{ background: "#fff", padding: "4px 16px 0" }}>

                {/* Subheading */}
                <p style={{
                  textAlign: "center", color: "#c2185b",
                  fontSize: 11, fontWeight: 800,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  marginBottom: 12,
                }}>
                  More Sessions · More Benefits
                </p>

                {/* Tiers */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  {TIERS.map((t, i) => {
                    const bg    = t.pink ? "#c2185b" : "#9a7200";
                    const light = t.pink ? "#fce4ec" : "#fef9e7";
                    const text  = t.pink ? "#c2185b" : "#9a7200";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 260, damping: 22 }}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          background: "#fff", borderRadius: 16, padding: "10px 12px",
                          border: `1.5px solid ${light}`,
                          boxShadow: `0 2px 10px ${bg}12`,
                        }}
                      >
                        {/* Icon */}
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                          background: `linear-gradient(145deg, ${bg}, ${t.pink ? "#e91e8c" : "#c9a800"})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: `0 3px 10px ${bg}40`,
                        }}>
                          <PilatesFigure color="#fff"/>
                        </div>

                        {/* Price + sessions */}
                        <div style={{ flex: 1 }}>
                          <span style={{ color: text, fontWeight: 800, fontSize: 18, lineHeight: 1 }}>
                            ₹{t.price}
                          </span>
                          <span style={{ color: "#888", fontSize: 11, marginLeft: 5 }}>
                            · {t.sessions} sessions
                          </span>
                        </div>

                        {/* Bonus badge */}
                        <div style={{
                          background: `linear-gradient(135deg, ${bg}, ${t.pink ? "#e91e8c" : "#c9a800"})`,
                          borderRadius: 12, padding: "6px 10px",
                          display: "flex", flexDirection: "column", alignItems: "center",
                          minWidth: 58, boxShadow: `0 2px 8px ${bg}40`,
                        }}>
                          <span style={{ color: "#fff", fontWeight: 900, fontSize: 16, lineHeight: 1 }}>
                            +{t.bonus}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1.4 }}>
                            sessions
                          </span>
                          <span style={{ color: "#fff", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1 }}>
                            FREE
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Countdown */}
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    background: daysLeft <= 3 ? "#fff0f0" : "#fff5f8",
                    border: `1.5px solid ${daysLeft <= 3 ? "#ffcdd2" : "#f8bbd0"}`,
                    borderRadius: 50, padding: "7px 16px",
                  }}>
                    <span style={{
                      display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                      background: daysLeft <= 3 ? "#e53935" : "#c2185b",
                      boxShadow: `0 0 6px ${daysLeft <= 3 ? "#e53935" : "#c2185b"}`,
                      animation: "pulse 1.5s infinite",
                      flexShrink: 0,
                    }}/>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: daysLeft <= 3 ? "#b71c1c" : "#880e4f" }}>
                      {daysLeft === 0
                        ? "Offer ends today!"
                        : `Offer ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} — 10th June 2026`
                      }
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div style={{ padding: "0 0 18px" }}>
                  <button
                    onClick={goToPricing}
                    className="active:scale-[0.97]"
                    style={{
                      width: "100%", padding: "14px 0",
                      borderRadius: 18, border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg, #880e4f 0%, #c2185b 50%, #e91e8c 100%)",
                      color: "#fff", fontWeight: 800, fontSize: 13,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      boxShadow: "0 6px 24px rgba(194,24,91,0.45), 0 2px 8px rgba(0,0,0,0.15)",
                      transition: "opacity 0.15s, transform 0.1s",
                    }}
                    onMouseEnter={e => e.target.style.opacity = "0.92"}
                    onMouseLeave={e => e.target.style.opacity = "1"}
                  >
                    Book Your Sessions Today →
                  </button>
                  <p style={{ textAlign: "center", fontSize: 10, color: "#bbb", marginTop: 7 }}>
                    Limited spots available · Offer valid till 10th June 2026
                  </p>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
