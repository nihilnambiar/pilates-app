import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

const GOLD   = "#1E80C2";
const FOREST = "#0a1e32";

const ACTIVE_MS   = 10000;                    // 10s of genuinely active (tab-visible) time
const SNOOZE_MS   = 1000 * 60 * 60 * 24 * 7;  // don't re-nag for a week after a dismissal
// Versioned so a redesign of the nudge (copy, layout, whatever) resets
// everyone's snooze automatically — bump this instead of asking anyone
// to clear localStorage by hand.
const NUDGE_VERSION = 2;
const SNOOZE_KEY  = `vg_quiz_nudge_seen_v${NUDGE_VERSION}`;
const RESULT_KEY  = "vigour_quiz_result";     // set by PilatesQuiz on completion

// Small line-art figure, matching the mark used elsewhere on the site.
function PilatesMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="3.5" r="2" fill={GOLD} opacity="0.9"/>
      <path d="M12 5.5 L10 13 L8 18" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" opacity="0.9"/>
      <path d="M12 8 L17 5" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" opacity="0.9"/>
      <path d="M11 10 L7 13" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" opacity="0.9"/>
      <path d="M10 13 L14 19" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" opacity="0.9"/>
    </svg>
  );
}

export default function QuizNudge() {
  const [visible, setVisible] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(RESULT_KEY)) return; // already took it
      const lastSeen = Number(localStorage.getItem(SNOOZE_KEY) || 0);
      if (Date.now() - lastSeen < SNOOZE_MS) return;
    } catch (_) {}

    let activeMs = 0;
    let last = Date.now();
    let timer;

    // Counts only time the tab is actually visible, so a background tab
    // doesn't silently rack up the 10s and pop the moment someone returns.
    const tick = () => {
      const now = Date.now();
      if (!document.hidden) activeMs += now - last;
      last = now;

      if (activeMs >= ACTIVE_MS) {
        const quizEl = document.getElementById("quiz");
        const rect = quizEl?.getBoundingClientRect();
        const quizInView = rect && rect.top < window.innerHeight && rect.bottom > 0;
        if (!quizInView) {
          shownRef.current = true;
          setVisible(true);
        }
        return;
      }
      timer = setTimeout(tick, 400);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  const remember = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now())); } catch (_) {}
  };

  const dismiss = () => {
    setVisible(false);
    remember();
  };

  const takeQuiz = () => {
    setVisible(false);
    remember();
    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
              className="relative w-full max-w-[460px] rounded-[28px] overflow-hidden"
              style={{
                background: `linear-gradient(160deg, ${FOREST} 0%, #0d1f2e 55%, #0d0d0d 100%)`,
                border: "1px solid rgba(30,128,194,0.22)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.3)",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Ambient glow */}
              <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, opacity: 0.18 }}/>
              <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, opacity: 0.1 }}/>

              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center z-10"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <X size={14} color="rgba(255,255,255,0.65)" strokeWidth={2.5}/>
              </button>

              <div className="relative" style={{ padding: "56px 40px 40px" }}>
                <div className="flex items-center gap-2.5 mb-7">
                  <PilatesMark/>
                  <span style={{
                    fontFamily: "DM Sans,sans-serif", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(30,128,194,0.9)",
                  }}>
                    2-Minute Quiz
                  </span>
                </div>

                <h2 style={{
                  fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 600,
                  fontSize: "clamp(30px,5vw,40px)", lineHeight: 1.15, color: "#fff",
                  margin: "0 0 18px", letterSpacing: "-0.01em",
                }}>
                  Let's find your<br/>
                  <em style={{ fontStyle: "italic", color: GOLD }}>perfect class.</em>
                </h2>

                <p className="font-accent italic" style={{
                  fontSize: 18, lineHeight: 1.6, color: "rgba(255,255,255,0.55)",
                  margin: "0 0 34px", maxWidth: 360,
                }}>
                  Answer a few quick questions and we'll match you to the class that actually fits your body, right now.
                </p>

                <button
                  onClick={takeQuiz}
                  className="w-full flex items-center justify-center gap-2 font-body font-semibold rounded-2xl active:scale-[0.98]"
                  style={{
                    background: GOLD, color: "#0d0d0d", padding: "16px 0", fontSize: 15,
                    border: "none", cursor: "pointer", transition: "transform 0.15s, opacity 0.15s",
                    boxShadow: `0 12px 32px rgba(30,128,194,0.4)`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  Take the Quiz <ArrowRight size={17}/>
                </button>

                <button
                  onClick={dismiss}
                  className="w-full text-center font-body"
                  style={{
                    marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.35)",
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
