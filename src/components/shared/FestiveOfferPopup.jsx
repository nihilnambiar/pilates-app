import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { claimPopupSlot, releasePopupSlot } from "./popupGate";

const AMBER = "#c9a46a"; // warm festive accent — same tone used for the Elite tier elsewhere

const SHOW_AFTER_MS = 3000;                  // true 3 real seconds after the page opens — not "3s of foreground time"
const SNOOZE_MS = 1000 * 60 * 60 * 24 * 3;   // short snooze — this is a time-limited promo, not an evergreen nudge
// Bumped again: the trigger used to pause while the tab was backgrounded
// (e.g. someone briefly switching tabs while the page loaded), so it could
// take much longer than 3s to actually appear. Now it's a straight timer —
// anyone who dismissed under the old, slower-to-appear behavior should get
// a fresh shot at this version.
const POPUP_VERSION = 3;
const SNOOZE_KEY = `vg_festive_popup_seen_v${POPUP_VERSION}`;

const OFFER_END = new Date("2026-11-08T23:59:59");

export default function FestiveOfferPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (new Date() > OFFER_END) return;
    try {
      const lastSeen = Number(localStorage.getItem(SNOOZE_KEY) || 0);
      if (Date.now() - lastSeen < SNOOZE_MS) return;
    } catch (_) {}

    // Warm the browser cache now so the image is already loaded by the time
    // the popup actually appears — no flash/pop-in at the 3s mark.
    const preload = new Image();
    preload.src = "/festive-ad.jpg";

    // Fires at a true 3 seconds of real elapsed time, full stop — no
    // pausing for a backgrounded tab, scrolling, clicking, or anything else
    // happening on the page. If the quiz nudge's own (10s, much later)
    // trigger happened to be mid-animation right at this instant, wait a
    // brief beat for it to clear rather than silently skipping.
    let retryTimer;
    const showTimer = setTimeout(() => {
      const tryShow = () => {
        if (claimPopupSlot()) { setVisible(true); return; }
        retryTimer = setTimeout(tryShow, 200);
      };
      tryShow();
    }, SHOW_AFTER_MS);

    return () => { clearTimeout(showTimer); clearTimeout(retryTimer); };
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
              className="relative w-full flex flex-col"
              style={{
                maxWidth: 420, maxHeight: "90vh",
                borderRadius: 24, overflow: "hidden",
                background: "#1a1308",
                border: `1px solid rgba(201,164,106,0.3)`,
                boxShadow: "0 40px 100px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.3)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
              >
                <X size={14} color="#fff" strokeWidth={2.5}/>
              </button>

              <div style={{ overflowY: "auto" }}>
                <img
                  src="/festive-ad.jpg"
                  alt="Vigour Pilates Studio — Move Together This Festive Season. Festive Offer: ₹10,000 for 12 sessions + 1 free, ₹15,000 for 20 sessions + 1 for a friend, ₹20,000 for 27 sessions + 2 for your friend, ₹30,000 for 38 sessions + 3 for your friend. Valid till Diwali, limited period."
                  style={{ width: "100%", display: "block" }}
                />
              </div>

              <div style={{ padding: "18px 22px 22px", flexShrink: 0 }}>
                <button
                  onClick={viewOffers}
                  className="w-full flex items-center justify-center gap-2 font-body font-semibold rounded-2xl active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${AMBER} 0%, #e8c98a 100%)`, color: "#1a1308", padding: "15px 0", fontSize: 15,
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
                    marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.35)",
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
