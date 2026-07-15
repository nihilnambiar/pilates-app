import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const GOLD = "#1E80C2";

const ACTIVE_MS   = 10000;                    // 10s of genuinely active (tab-visible) time
const SNOOZE_MS   = 1000 * 60 * 60 * 24 * 7;  // don't re-nag for a week after a dismissal
const SNOOZE_KEY  = "vg_quiz_nudge_last_seen";
const RESULT_KEY  = "vigour_quiz_result";     // set by PilatesQuiz on completion

// Small line-art figure, matching the mark used elsewhere on the site.
function PilatesMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[45] bottom-5 left-4 sm:bottom-6 sm:left-6"
          style={{ width: "min(320px, calc(100vw - 32px))" }}
        >
          <div
            className="relative overflow-hidden rounded-[20px]"
            style={{
              background: "linear-gradient(160deg, #0a1e32 0%, #0d1f2e 55%, #0d0d0d 100%)",
              border: "1px solid rgba(30,128,194,0.22)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            {/* Accent edge */}
            <div style={{
              position: "absolute", top: 0, left: 0, bottom: 0, width: "3px",
              background: `linear-gradient(180deg, ${GOLD}, transparent)`,
            }}/>

            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <X size={11} color="rgba(255,255,255,0.6)" strokeWidth={2.5}/>
            </button>

            <div style={{ padding: "20px 26px 20px 22px" }}>
              <div className="flex items-center gap-2 mb-3">
                <PilatesMark/>
                <span style={{
                  fontFamily: "DM Sans,sans-serif", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(30,128,194,0.85)",
                }}>
                  2-Minute Quiz
                </span>
              </div>

              <p style={{
                fontFamily: "'Playfair Display',Georgia,serif", fontSize: 19, lineHeight: 1.3,
                color: "#fff", margin: "0 0 8px", fontWeight: 600,
              }}>
                Not sure which class fits you?
              </p>
              <p style={{
                fontFamily: "DM Sans,sans-serif", fontSize: 12.5, lineHeight: 1.6,
                color: "rgba(255,255,255,0.55)", margin: "0 0 16px",
              }}>
                Answer a few quick questions and we'll match you to the right class — reformer, barrel, or something gentler.
              </p>

              <button
                onClick={takeQuiz}
                className="font-body text-sm"
                style={{
                  color: "#fff", fontWeight: 600, background: "none", border: "none",
                  padding: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Take the quiz <span style={{ color: GOLD }}>→</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
