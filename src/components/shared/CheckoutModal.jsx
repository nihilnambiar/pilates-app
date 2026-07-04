import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CheckCircle, ChevronRight, AlertCircle } from "lucide-react";

// Load Razorpay script once
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const ACCENT = {
  highlight: { bg: "linear-gradient(135deg,#0a1e32 0%,#1E80C2 100%)", ring: "#1E80C2", btn: "#1E80C2", btnText: "#0d0d0d" },
  elite:     { bg: "linear-gradient(135deg,#0e0c08 0%,#2a1e08 100%)", ring: "#c9a46a", btn: "#c9a46a", btnText: "#0d0d0d" },
  group:     { bg: "linear-gradient(135deg,#0a1e32 0%,#1E80C2 100%)", ring: "#1E80C2", btn: "#1E80C2", btnText: "#0d0d0d" },
  default:   { bg: "linear-gradient(135deg,#0a1e32 0%,#1a2d40 100%)", ring: "#1E80C2", btn: "#fff",    btnText: "#0d0d0d" },
};

function getAccent(plan) {
  if (plan.isElite)     return ACCENT.elite;
  if (plan.highlight)   return ACCENT.highlight;
  if (plan.isGroup)     return ACCENT.group;
  return ACCENT.default;
}

export default function CheckoutModal({ plan, onClose }) {
  const [form,  setForm]  = useState({ name: "", email: "", phone: "" });
  const [step,  setStep]  = useState("form");   // form | processing | success | error
  const [error, setError] = useState("");

  const acc = getAccent(plan);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const validate = () => {
    if (!form.name.trim())  return "Please enter your name.";
    if (!form.email.trim() || !form.email.includes("@")) return "Please enter a valid email.";
    if (!form.phone.trim() || form.phone.replace(/\D/g,"").length < 10) return "Please enter a valid 10-digit phone number.";
    return null;
  };

  const pay = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setStep("processing");

    try {
      // 1. Create order
      const orderRes = await fetch("/api/create-razorpay-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: plan.amount, planName: plan.name }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Could not create payment order.");

      // 2. Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your internet connection.");

      // 3. Open Razorpay checkout
      await new Promise((resolve, reject) => {
        const options = {
          key:         orderData.key,
          amount:      orderData.amount,
          currency:    "INR",
          name:        "Vigour Pilates Studio",
          description: `${plan.name} — ${plan.sub}`,
          image:       "/logop.png",
          order_id:    orderData.orderId,
          prefill: {
            name:    form.name,
            email:   form.email,
            contact: form.phone,
          },
          theme:  { color: acc.ring },
          modal: {
            ondismiss: () => { setStep("form"); resolve(); },
          },
          handler: async (response) => {
            try {
              // 4. Verify payment + send emails
              const verifyRes = await fetch("/api/verify-payment", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...response,
                  name:       form.name,
                  email:      form.email,
                  phone:      form.phone,
                  planName:   plan.name,
                  amount:     plan.amount,
                  sessions:   plan.sub,
                  perSession: plan.perClass,
                }),
              });
              if (!verifyRes.ok) throw new Error("Payment verification failed.");
              setStep("success");
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        };
        new window.Razorpay(options).open();
      });

    } catch (e) {
      console.error("Checkout error:", e);
      setError(e.message || "Something went wrong. Please try again.");
      setStep("error");
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={step === "form" || step === "error" ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1,  y: 0  }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div
          className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style={{ maxHeight: "92vh", overflowY: "auto", background: "#0d0d0d" }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── PLAN HEADER ─────────────────────────────────────── */}
          <div style={{ background: acc.bg }} className="px-6 pt-6 pb-5 relative">

            {/* Close — only show when dismissible */}
            {(step === "form" || step === "error") && (
              <button onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.12)" }}>
                <X size={14} color="rgba(255,255,255,0.8)" strokeWidth={2.5}/>
              </button>
            )}

            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Arial,sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
              You selected
            </p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 2px", letterSpacing: "-0.3px" }}>
              {plan.name}
            </h2>
            <p style={{ color: plan.isElite ? "rgba(201,164,106,0.7)" : "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>
              {plan.sub}
            </p>

            {/* Price row */}
            <div className="flex items-baseline justify-between">
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: plan.isElite ? "#c9a46a" : "#fff" }}>
                {plan.price}
              </span>
              <span style={{ fontSize: 12, color: plan.isElite ? "rgba(201,164,106,0.55)" : "rgba(255,255,255,0.4)", textAlign: "right" }}>
                {plan.perClass}
              </span>
            </div>

            {/* Features */}
            <div className="mt-4 space-y-1.5">
              {plan.features.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <span style={{ color: plan.isElite ? "#c9a46a" : "#9DC230", fontSize: 10, flexShrink: 0 }}>—</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── FORM / STATES ────────────────────────────────────── */}
          <div className="px-6 py-6">

            {/* ── SUCCESS ── */}
            {step === "success" && (
              <motion.div
                className="text-center py-4"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
              >
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(34,197,94,0.15)", border: "1.5px solid rgba(34,197,94,0.3)" }}>
                  <CheckCircle size={30} style={{ color: "#22c55e" }}/>
                </div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#fff", marginBottom: 8 }}>
                  Payment successful!
                </h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                  We've sent a confirmation to <strong style={{ color: "rgba(255,255,255,0.75)" }}>{form.email}</strong>.
                  Our team will reach out within 24 hours to book your first session.
                </p>
                <button onClick={onClose}
                  className="w-full py-3.5 rounded-2xl font-body font-semibold text-sm"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  Close
                </button>
              </motion.div>
            )}

            {/* ── PROCESSING ── */}
            {step === "processing" && (
              <div className="text-center py-6">
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                  style={{ borderColor: `${acc.ring}40`, borderTopColor: acc.ring }}/>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Opening payment window…</p>
              </div>
            )}

            {/* ── FORM / ERROR ── */}
            {(step === "form" || step === "error") && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 16 }}>
                  Just a few details before we take you to payment
                </p>

                {[
                  { key: "name",  label: "Full Name",    type: "text",  placeholder: "Your name" },
                  { key: "email", label: "Email Address", type: "email", placeholder: "email@example.com" },
                  { key: "phone", label: "Phone Number",  type: "tel",   placeholder: "10-digit mobile number" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "Arial,sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      placeholder={f.placeholder}
                      onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setError(""); }}
                      style={{
                        display: "block", width: "100%", padding: "12px 14px",
                        background: "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${error && !form[f.key].trim() ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: 12, color: "#fff", fontSize: 14, fontFamily: "inherit",
                        outline: "none", boxSizing: "border-box",
                      }}
                      onFocus={e => { e.target.style.borderColor = acc.ring; }}
                      onBlur={e  => { e.target.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,0.1)"; }}
                    />
                  </div>
                ))}

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }}/>
                    <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
                  </motion.div>
                )}

                {/* Pay button */}
                <button
                  onClick={pay}
                  className="w-full py-4 rounded-2xl font-body font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98] mt-2"
                  style={{
                    background: acc.btn === "#fff"
                      ? "linear-gradient(135deg,#1E80C2,#0a1e32)"
                      : `linear-gradient(135deg,${acc.btn},${acc.ring})`,
                    color: "#fff",
                    boxShadow: `0 6px 24px ${acc.ring}50`,
                    letterSpacing: "0.02em",
                  }}
                >
                  Pay {plan.price}
                  <ChevronRight size={16} strokeWidth={2.5}/>
                </button>

                {/* Trust line */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Lock size={11} style={{ color: "rgba(255,255,255,0.3)" }}/>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "Arial,sans-serif" }}>
                    Secured by Razorpay · 256-bit SSL
                  </span>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
