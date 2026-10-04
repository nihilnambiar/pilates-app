import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { claimPopupSlot, releasePopupSlot } from "./popupGate";

const GOLD   = "#1E80C2";
const AMBER  = "#c9a46a";   // warm festive accent — same tone used for the Elite tier elsewhere
const FOREST = "#0a1e32";

const ACTIVE_MS = 3000;                      // 3s of genuinely active (tab-visible) time
const SNOOZE_MS = 1000 * 60 * 60 * 24 * 3;   // short snooze — this is a time-limited promo, not an evergreen nudge
const POPUP_VERSION = 1;
const SNOOZE_KEY = `vg_festive_popup_seen_v${POPUP_VERSION}`;

const OFFER_END = new Date("2026-11-08T23:59:59");

const TIERS = [
  { price: "10,000", sessions: 12, bonusLabel: "FREE SESSION",     bonus: "+1" },
  { price: "15,000", sessions: 20, bonusLabel: "FOR A FRIEND",     bonus: "+1" },
  { price: "20,000", sessions: 27, bonusLabel: "FOR YOUR FRIEND",  bonus: "+2", highlight: true },
  { price: "30,000", sessions: 38, bonusLabel: "FOR YOUR FRIEND",  bonus: "+3" },
];

function getDaysLeft() {
  return Math.max(0, Math.ceil((OFFER_END - new Date()) / 86400000));
}

export default function FestiveOfferPopup() {
  const [visible, setVisible] = useState(false);
  const daysLeft = getDaysLeft();

  useEffect(() => {
    if (new Date() > OFFER_END) return;
    try {
      const lastSeen = Number(localStorage.getItem(SNOOZE_KEY) || 0);
      if (Date.now() - lastSeen < SNOOZE_MS) return;
    } catch (_) {}

    let activeMs = 0;
    let last = Date.now();
    let timer;

    // Counts only time the tab is actually visible, matching the pattern used
    // for the quiz nudge — a backgrounded tab shouldn't silently rack up 3s.
    const tick = () => {
      const now = Date.now();
      if (!document.hidden) activeMs += now - last;
      last = now;

      if (activeMs >= ACTIVE_MS) {
        // Another popup (e.g. the quiz nudge) already has the floor — don't
        // stack on top of it, just keep checking until it's free.
        if (!claimPopupSlot()) {
          timer = setTimeout(tick, 300);
          return;
        }
        setVisible(true);
        return;
      }
      timer = setTimeout(tick, 300);
    };
    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, []);

  const remember = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now())); } catch (_) {}
  };

  const dismiss = () => {
    setVisible(false);
    releasePopupSlot();
    remember();
  };

  const viewOffers = () => {
    setVisible(false);
    releasePopupSlot();
    remember();
    setTimeout(() => document.getElementById("festive-offer")?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={dismiss}
          />

          {/* Card */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative w-full max-w-[500px] rounded-[28px] overflow-hidden"
              style={{
                background: `linear-gradient(160deg, ${FOREST} 0%, #1a1308 55%, #0d0d0d 100%)`,
                border: `1px solid rgba(201,164,106,0.25)`,
                boxShadow: "0 40px 100px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.3)",
                maxHeight: "92vh", overflowY: "auto",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Ambient glow */}
              <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${AMBER} 0%, transparent 70%)`, opacity: 0.16 }}/>
              <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, opacity: 0.12 }}/>

              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center z-10"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <X size={14} color="rgba(255,255,255,0.65)" strokeWidth={2.5}/>
              </button>

              <div className="relative" style={{ padding: "48px 36px 36px" }}>
                <div className="flex items-center gap-2.5 mb-6">
                  <span style={{ color: AMBER, fontSize: 13 }}>✦</span>
                  <span style={{
                    fontFamily: "DM Sans,sans-serif", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.22em", textTransform: "uppercase", color: AMBER,
                  }}>
                    Festive Season Offer
                  </span>
                  <span style={{ color: AMBER, fontSize: 13 }}>✦</span>
                </div>

                <h2 style={{
                  fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 600,
                  fontSize: "clamp(28px,4.5vw,36px)", lineHeight: 1.15, color: "#fff",
                  margin: "0 0 14px", letterSpacing: "-0.01em",
                }}>
                  Move together<br/>
                  <em style={{ fontStyle: "italic", color: AMBER }}>this festive season.</em>
                </h2>

                <p className="font-accent italic" style={{
                  fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.5)",
                  margin: "0 0 28px", maxWidth: 400,
                }}>
                  Choose a package, bring someone along — every tier includes bonus sessions to share.
                </p>

                {/* Tier grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {TIERS.map((t, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                      style={{
                        borderRadius: 16, padding: "16px 14px",
                        background: t.highlight ? "rgba(201,164,106,0.1)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${t.highlight ? "rgba(201,164,106,0.35)" : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1 }}>
                        ₹{t.price}
                      </p>
                      <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", margin: "4px 0 10px" }}>
                        {t.sessions} sessions
                      </p>
                      <div style={{
                        display: "inline-flex", alignItems: "baseline", gap: 4,
                        background: t.highlight ? "rgba(201,164,106,0.18)" : "rgba(30,128,194,0.12)",
                        borderRadius: 999, padding: "3px 9px",
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: t.highlight ? AMBER : GOLD }}>{t.bonus}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", color: t.highlight ? AMBER : GOLD, opacity: 0.85 }}>
                          {t.bonusLabel}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Countdown badge */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    background: "rgba(201,164,106,0.1)", border: "1px solid rgba(201,164,106,0.3)",
                    borderRadius: 999, padding: "6px 14px",
                  }}>
                    <span style={{
                      display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                      background: AMBER, boxShadow: `0 0 6px ${AMBER}`,
                      animation: "festivePulse 1.5s infinite", flexShrink: 0,
                    }}/>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: AMBER }}>
                      {daysLeft <= 1 ? "Last day — valid till Diwali" : `${daysLeft} days left · Valid till Diwali`}
                    </span>
                  </div>
                  <style>{`@keyframes festivePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
                </div>

                <button
                  onClick={viewOffers}
                  className="w-full flex items-center justify-center gap-2 font-body font-semibold rounded-2xl active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${AMBER} 0%, #e8c98a 100%)`, color: "#1a1308", padding: "16px 0", fontSize: 15,
                    border: "none", cursor: "pointer", transition: "transform 0.15s, opacity 0.15s",
                    boxShadow: `0 12px 32px rgba(201,164,106,0.3)`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  View Festive Offers <ArrowRight size={17}/>
                </button>

                <button
                  onClick={dismiss}
                  className="w-full text-center font-body"
                  style={{
                    marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.35)",
                    background: "none", border: "none", cursor: "pointer",
                  }}
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
